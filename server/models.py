import json
import math
import threading
from flask import jsonify
from passlib.hash import pbkdf2_sha256
import uuid
import helper
from app import db
import bson.json_util as json_util
import geocoder
import re
import stripe
import datetime
from datetime import date
import math
from sklearn.neighbors import NearestNeighbors


class User:
    # Initialize a threading timer (Unused and requires implementation)
    timer = threading.Timer(0, 'hello')
    def signup(self, userData): 
        latitude, longitude = geocoder.ip('me').latlng
        user = { 
            "username": userData['username'], 
            "password": userData['password'],
            "listings": userData["listings"], # one list of dictionaries of different listings
            "creditCards" : userData['creditCards'], 
            "email" : userData["email"], 
            "sessionId": [],
            "recentBookings": [],
            "isVerified" : False,
            "latitude": latitude,
            "longitude": longitude,
            "paymentId": "",
            "payOutId": "",
            "defaultPaymentId":"",
            "isStripeConnected": False,
            "preBookingTime": "",
            "currentListingId": "",
            "currentListingNo": "",
            "profilePicture": "", 
            "likedListings": [],
            "carNumberPlate": "",
            "timer": "",

        }
        user['password'] = pbkdf2_sha256.encrypt(
            user['password'])
        if db.userbase_data.find_one({"email": userData['email']}): 
            return jsonify({'type': "email", "error": "Email already in use"}), 400
        try:

            userPayment = stripe.Customer.create(
                name = userData['username'],
                email = userData["email"],
            )
            user['paymentId'] = userPayment.id
            userPayOut = stripe.Account.create(
                type="custom",
                country="AU",
                email=userData["email"],
                capabilities={
                    "card_payments": {"requested": True},
                    "transfers": {"requested": True},
                    "au_becs_debit_payments": {"requested": True},
                },
            )
            user['payOutId'] = userPayOut.id

 
        except stripe.error as e:
            return jsonify({'type': "system error", "error": "Signup failed due to unforeseen circumstances"}), 400

        if db.userbase_data.insert_one(user):
            # debugging 
            return json_util.dumps(user)

        return jsonify({'type': "system error", "error": "Signup failed due to unforeseen circumstances"}), 400
    
    def getUsername(self, userData): 
        user = db.userbase_data.find_one({"email": userData['email']})
        if user: 
            return user['username']
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

    def setupAdmin(self, userData): 
        user = { 
            "username": userData['username'], 
            "password": userData['password'],
            "email" : userData["email"], 
            "sessionId": [],
            "isVerified" : True,
            "isAdmin": True,
            "disputes": [],
            "profilePicture": "", 
        }
        user['password'] = pbkdf2_sha256.encrypt(
            user['password'])
        if db.userbase_data.find_one({"email": userData['email']}): 
            return jsonify({'type': "email", "error": "Email already in use"}), 400 
        if db.userbase_data.insert_one(user):
            # debugging 
            return json_util.dumps({"type": "SUCCESS"})

    def checkAdmin(self, headers): 
        user = db.userbase_data.find_one({"sessionId": headers['token']})
        if user:
            isAdmin = user.get('isAdmin', False)
            return jsonify({'isAdmin': isAdmin})
        return jsonify({'isAdmin': False})

    def login(self, userData): 
        user = db.userbase_data.find_one({"email": userData['email']})
        if "isVerified" in userData: 
            user['isVerified'] = userData['isVerified']

            db.userbase_data.update_one({"email": userData['email']}, {
                                        "$set": {"isVerified": user['isVerified']}})
        if user: 
            if user['isVerified'] == False: 
                return jsonify({"type": "Unverified User", "error": "The user has not verified their email"}), 405

                
            if pbkdf2_sha256.verify(userData['password'], user['password']):
                if user['isVerified'] == False: 
                    return jsonify({"type": "Unverified User", "error": "The user has not verified their email"}), 405
                currentSessionID = uuid.uuid4().hex
                while user['sessionId'].count(currentSessionID) > 0:
                        currentSessionID = uuid.uuid4().hex
                # Add session id for the user
                sessionIDList = user["sessionId"]
                sessionIDList.append(currentSessionID)
                # Updating Session ID and adding new Session ID per Device
                db.userbase_data.update_many({'email': user['email']}, {"$set": {"sessionId": sessionIDList},})

                return json_util.dumps(user)
            else:
                return jsonify({"type": "password", "error": "Password Is Incorrect"}), 401

        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402


    def logout(self, userData): 
        user = db.userbase_data.find_one({"sessionId": userData['token']})
        if user: 
            if not user['sessionId'].count(userData['currentSessionID']) > 0: 
                return jsonify({'error': "Session Does Not Exist"}), 403
            user['sessionId'].remove(userData['currentSessionID'])
            db.userbase_data.update_one({"email": user['email']}, {
                                        "$set": {"sessionId": user['sessionId']}})
            return jsonify({'status': "PASS"}), 200
        return jsonify({"type": "username", "error": "User Does Not Exist"}), 402
    

    def deleteAccount(self, userData): 
        requester = db.userbase_data.find_one({"sessionId": userData['token']})
        userInfo = db.userbase_data.find_one({"email": userData['email']})
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        # deleting the same listing within the listings DB so ensure syncronised listings across DBs
        listingIds = [listing['listingId'] for listing in userInfo.get('listings', [])]
        if listingIds:
            for listingId in listingIds:
                db.listingData.delete_one({"listingId": listingId})
        isAdmin = userInfo.get('isAdmin', False)
        if not isAdmin:
            if userInfo["paymentId"] != "":
                stripe.Customer.delete(userInfo["paymentId"])
            if userInfo["payOutId"] != "":
                stripe.Account.delete(userInfo["payOutId"])
            db.userbase_data.delete_one(userInfo)
            return jsonify({'status': "PASS"}), 200
        db.userbase_data.delete_one(userInfo)
        return jsonify({'status': "PASS"}), 200
    
    def resetPass(self, userData): 
        user = db.userbase_data.find_one({"email": userData['email']})
        if user: 
            db.userbase_data.update_one({"email": userData['email']}, {"$set": {"password": pbkdf2_sha256.encrypt(user['password'])}})
            return jsonify({'status': "PASS"}), 200
        return jsonify({"type": "username", "error": "User Does Not Exist"}), 402
    
    
    def createListing(self, userData):
        requester = db.userbase_data.find_one({"sessionId": userData['token']})
        userInfo = db.userbase_data.find_one({"email": userData['email']})
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        if userInfo:

            listing = {
                "listingId": uuid.uuid4().hex,
                "listingNo": len(userInfo['listings']),
                "address": userData['listings']['address'],
                "price": userData['listings']['price'],
                "quantity": userData['listings']['quantity'],
                "details": userData['listings']['details'],
                "restrictions": userData['listings']['restrictions'],
                "imageUrl": userData['listings']['imageUrl'], 
                "images": userData['listings']['images'],
                "startDate": "",
                "endDate": "",
                "isActive": 'False',
                "latitude": float(userData['listings']['lat']),
                "longitude": float(userData['listings']['lon']),
                "recentBookings": [], 
                "likes": 0
            }

            userListings = userInfo['listings']
            userListings.append(listing)
            filter = {'email': userInfo['email']}
            newvalues = {"$set" : {'listings': userListings}}
            db.userbase_data.update_one(filter, newvalues)
            db.listingData.insert_one(listing)

            return json_util.dumps(listing["listingId"])
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def deactivateListing(self, userData, headers):
        requester = db.userbase_data.find_one({"sessionId": headers['token']})
        userInfo = db.userbase_data.find_one({"email": headers['email']})
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        # check if the listing exists
        userListings = userInfo.get('listings')
        # todo
        listingFound = [i for i in userListings if i["listingId"] == userData["listings"]["listingId"]]

        if userInfo:

            if listingFound:
                # todo
                listingNo = userData["listings"]["listingNo"] 
                userListings[listingNo].update({'startDate': "", 'endDate': "", 'isActive': "False"})
                filter = {'email': userInfo['email']}
                newvalues = {"$set" : {'listings': userListings}}
                db.userbase_data.update_one(filter, newvalues)
        
                # updating the same listing within the listings DB so ensure syncronised listings across DBs
                # todo
                listingId = userData["listings"]["listingId"] 
                filter = {'listingId': listingId}
                newvalues = {
                    "$set": {
                        'startDate': "",
                        'endDate': "",
                        'isActive': "False"
                    }
                }
                db.listingData.update_one(filter, newvalues)

                return json_util.dumps(userInfo)
            return jsonify({"type": "listingId", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def activateListing(self, userData, headers):
        requester = db.userbase_data.find_one({"sessionId": headers['token']})
        userInfo = db.userbase_data.find_one({"email": headers['email']})
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        # check if the listing exists
        userListings = userInfo.get('listings')
        # todo
        listingFound = [i for i in userListings if i["listingId"] == userData["listings"]["listingId"]]

        if userInfo:
            if listingFound:
                # todo
                listingNo = userData["listings"]["listingNo"] 
                # todo
                userListings[listingNo].update({'startDate': userData['listings']['startDate'], 'endDate': userData['listings']['endDate'], 'isActive': "True"})
                filter = {'email': userInfo['email']}
                newvalues = {"$set" : {'listings': userListings}}
                db.userbase_data.update_one(filter, newvalues)

                # updating the same listing within the listings DB so ensure syncronised listings across DBs
                # todo
                listingId = userData["listings"]["listingId"] 
                filter = {'listingId': listingId}
                newvalues = {
                    "$set": {
                        # todo
                        'startDate': userData['listings']['startDate'],
                        # todo
                        'endDate': userData['listings']['endDate'],
                        'isActive': "True"
                    }
                }
                db.listingData.update_one(filter, newvalues)

                return json_util.dumps(userInfo)
            return jsonify({"type": "listingId", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def deleteListing(self, userData, headers):
        requester = db.userbase_data.find_one({"sessionId": headers['token']})
        userInfo = db.userbase_data.find_one({"email": headers['email']})
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        # check if the listing exists
        userListings = userInfo.get('listings')
        # todo
        listingFound = [i for i in userListings if i["listingId"] == userData["listings"]["listingId"]]
        if userInfo: 
            if listingFound: 
                # todo
                listingNo = userData["listings"]["listingNo"]
                listingLength = len(userInfo['listings'])
                userListings.remove(userListings[listingNo])
                listingLength = len(userInfo['listings'])
                while listingNo < listingLength:
                    userListings[listingNo].update({'listingNo': userListings[listingNo]['listingNo'] - 1})
                    listingNo += 1
                    
                filter = {'email': userInfo['email']}
                newvalues = {"$set" : {'listings': userListings}}
                db.userbase_data.update_one(filter, newvalues)

                # updating the same listing within the listings DB so ensure syncronised listings across DBs
                # todo
                listingId = userData["listings"]["listingId"]
                filter = {'listingId': listingId}
                db.listingData.delete_one(filter)

                return json_util.dumps(userListings)
            return jsonify({"type": "listingId", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

    def updateListing(self, userData, headers):

        requester = db.userbase_data.find_one({"sessionId": headers['token']})
        userInfo = db.userbase_data.find_one({"email": headers['email']})
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        # check if the listing exists
        userListings = userInfo.get('listings')
        # todo
        listingFound = [i for i in userListings if i["listingId"] == userData["listings"]["listingId"]]
        if userInfo:
            if listingFound:

                listing = {
                    "address": userData['listings']['address'],
                    "price": userData['listings']['price'],
                    "quantity": userData['listings']['quantity'], 
                    "details": userData['listings']['details'],
                    "restrictions": userData['listings']['restrictions'],
                    # todo
                    "imageUrl": userData['listings']['imageUrl'],
                    "images": userData['listings']['images'], 
                    # todo
                    "startDate": userData['listings']['startDate'],
                    # todo
                    "endDate": userData['listings']['endDate'],
                    # todo
                    "isActive": userData['listings']['isActive']  
                }
                # todo
                listingNo = userData["listings"]["listingNo"]
                userListings = userInfo['listings']
                userListings[listingNo].update(listing)
                filter = {'email': userInfo['email']}
                newvalues = {"$set" : {'listings': userListings}}
                db.userbase_data.update_one(filter, newvalues)

                # updating the same listing within the listings DB so ensure syncronised listings across DBs
                listingId = userData['listings']['listingId']
                filter = {'listingId': listingId}
                newvalues = {"$set": listing}
                db.listingData.update_one(filter, newvalues)


                return json_util.dumps(userInfo)
            return jsonify({"type": "listingId", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def getListings(self, headers):
        # check if the user exists
        requester = db.userbase_data.find_one({"sessionId": headers['token']})
        userInfo = db.userbase_data.find_one({"email": headers['email']})
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402
        if userInfo: 
            return json_util.dumps(userInfo['listings'])
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402

    def getAllUsers(self, headers):
        query = {
            "isAdmin": {"$ne": True}, 
            "isVerified": {"$ne": False} 
        }
        projection = {"_id": 0, "username": 1, "email": 1}

        usersCursor = db.userbase_data.find(query, projection)
        users = list(usersCursor)
        return json_util.dumps(users)

     

        

    def getListing(self, headers):
        # check if the user exists
        user = db.userbase_data.find_one({"email": headers['email']})
        # check if the listing exists
        userListings = user.get('listings')
        listingFound = [i for i in userListings if i["listingId"] == headers["listings"]["listingId"]]

        if user:
            if listingFound:
                listingNo = headers["listings"]["listingNo"] 
                return json_util.dumps(userListings[listingNo])
            return jsonify({"type": "listingId", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    

    def getAllListings(self): 
        
        allListings = db.userbase_data.find({},{"_id":0,'listings':1})
        allActiveListings = []
        for listingDict in allListings: 
            if bool(listingDict):
                for listing in listingDict['listings']:
                    if listing['isActive'] == "True":  
                    
                        allActiveListings.append(listing)

        return json_util.dumps(allActiveListings)


    def getUserInfo(self, userData): 
        requester = db.userbase_data.find_one({"sessionId": userData['token']})
        userInfo = db.userbase_data.find_one({"email": userData['email']})
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402
        if userInfo:
            return json_util.dumps(userInfo)
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402

    # takes listing off page
    def holdListing(self, userData):
        
        # check if the user exists
        user = db.userbase_data.find_one({"sessionId": userData['token']})
        # check if the listing exists
        providerUser = db.userbase_data.find_one({"listings.listingId": userData["listingId"]})
        userListings = providerUser.get('listings')

        now = datetime.datetime.now()
        startTime = now.strftime("%H:%M:%S")


        if user:
                db.userbase_data.update_one({"email": user['email']}, {"$set": {"preBookingTime": startTime}})
                db.userbase_data.update_one({"email": user['email']}, {"$set": {"currentListingId": userData["listingId"]}})
                db.userbase_data.update_one({"email": user['email']}, {"$set": {"currentListingNo": userData["listingNo"]}})
                db.userbase_data.update_one({"email": user['email']}, {"$set": {"carNumberPlate": userData["carNumberPlate"]}})
                # listing no to book 
                listingNo = userData["listingNo"] 
                userListings[listingNo].update({'isActive': "False"})
                filter = {"listings.listingId": userData["listingId"]}
                newvalues = {"$set" : {'listings': userListings}}
                db.userbase_data.update_one(filter, newvalues)
                filter = {"listingId": userData["listingId"]}
                newvalues = {"$set" : userListings[listingNo]}
                db.listingData.update_one(filter, newvalues)
                self.timer = threading.Timer(600, User.timer_thread, args=(User, userData,))
                self.timer.start()
                return json_util.dumps("Pass")
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def timerThread(self, userData): 
        # release listing 
        User.releaseListing(self, userData)




    # puts listing on page
    def releaseListing(self, userData):
        self.timer.cancel()
        # check if the user exists
        
        user = db.userbase_data.find_one({"sessionId": userData['token']})

        # check if the listing exists
        providerUser = db.userbase_data.find_one({"listings.listingId": userData["listingId"]})
        userListings = providerUser.get('listings')


        if user:
                listingNo = userData["listingNo"] 
                userListings[listingNo].update({'isActive': "True"})
                db.userbase_data.update_one({"email": user['email']}, {"$set": {"preBookingTime": ""}})
                filter = {"listings.listingId": userData["listingId"]}
                newvalues = {"$set" : {'listings': userListings}}
                db.userbase_data.update_one(filter, newvalues)
                filter = {"listingId": userData["listingId"]}
                newvalues = {"$set" : userListings[listingNo]}
                db.listingData.update_one(filter, newvalues)
                return json_util.dumps("Pass")
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def getClosestListings(self, headers, distance): 
        latitude = 0
        longitude = 0
        print(headers['lat'], headers['lon'])
        latitude = float(headers['lat'])
        longitude = float(headers['lon'])
        closestListings = []
        for listing in db.listingData.find({}): 
            listingLat = 0
            listingLong = 0
            if 'latitude' not in listing.keys() or 'longitude' not in listing.keys(): 
                listingLat, listingLong = helper.calcLatLong(listing['address'])
            else:
                listingLat = listing["latitude"]
                listingLong = listing["longitude"]

            if listing['isActive'] == "True" and helper.calculateDistance(latitude, listingLat, longitude, listingLong) <= distance: 
                now = int(datetime.datetime.now().timestamp() * 1000)
                start = int(datetime.datetime.strptime(listing['startDate'][:-1]+'+00:00', "%Y-%m-%dT%H:%M:%S.%f%z").timestamp() * 1000)
                end = int(datetime.datetime.strptime(listing['endDate'][:-1]+'+00:00', "%Y-%m-%dT%H:%M:%S.%f%z").timestamp() * 1000)
                # maybe update the expired listing as isActive = false in both listingDb and userDb
                if start <= now and now <= end:
                    closestListings.append(listing)
                else:
                    print(listing['address'], start,now, end)
        return json_util.dumps(closestListings)
      
    def createBooking(self, userData):
        if self.timer:
            self.timer.cancel()
        # check if the user exists
        user = db.userbase_data.find_one({"sessionId": userData['token']})

        # check if the listing exists
        providerUser = db.userbase_data.find_one({"listings.listingId": userData["listingId"]})
        userListings = providerUser.get('listings')
        bookingList = user["recentBookings"]

        listingNo = userData["listingNo"]

        listingBookingList = userListings[listingNo]["recentBookings"]

        now = datetime.datetime.now()
        startTime = now.strftime("%H:%M:%S")
        today = str(date.today())

        booking = {
            "address": userListings[listingNo]["address"],
            "listingId": userData["listingId"],
            "recentBookingNo": len(user["recentBookings"]),
            "date": today,
            "startTime": startTime,
            "endPrice": "",
            "feedback": "",
            "endImageUrl": "", 
            "totalTime": "",
            "inEndBookingPhase": False,
            "paymentId": "",
            "carNumberPlate": userData["carNumberPlate"],
        }
        self.notifs(db, providerUser, userListings[listingNo]["address"], today)

        if user:
            bookingList.append(booking)
            userListings[listingNo].update({'isActive': "False"})
            db.userbase_data.update_one({"email": user['email']}, {"$set": {"preBookingTime": ""}})
            filter = {'email': user['email']}
            newvalues = {"$set" : {'recentBookings': bookingList}}
            db.userbase_data.update_one(filter, newvalues)
            booking.update({"email": user['email']})
            del booking["recentBookingNo"]
            listingBookingList.append(booking)
            filter = {"listings.listingId": userData["listingId"]}
            newvalues = {"$set" : {'listings': userListings}}
            db.userbase_data.update_one(filter, newvalues)
            filter = {"listingId": userData["listingId"]}
            newvalues = {"$set" : userListings[listingNo]}
            db.listingData.update_one(filter, newvalues)
            return json_util.dumps(user["recentBookings"]) # HOW IS THIS WORKING EVEN THOUGH IM NOT UPDATING USER
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def removeRecentBooking(self, userData):
        # check if the user exists
        user = db.userbase_data.find_one({"email": userData['email']})
        # check if the listing exists
        bookingList = user["recentBookings"]

        if user:
            # todo
            recentBookingNo = userData["booking"]["recentBookingNo"]
            recentBookingLength = len(user['recentBookings'])
            bookingList.remove(bookingList[recentBookingNo])
            recentBookingLength = len(user['recentBookings'])
            while recentBookingNo < recentBookingLength:
                bookingList[recentBookingNo].update({'recentBookingNo': bookingList[recentBookingNo]['recentBookingNo'] - 1})
                recentBookingNo += 1                
            filter = {'email': user['email']}
            newvalues = {"$set" : {'recentBookings': bookingList}}
            db.userbase_data.update_one(filter, newvalues)
            return json_util.dumps(user["recentBookings"]) # HOW IS THIS WORKING EVEN THOUGH IM NOT UPDATING USER
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def endBooking(self, headers, userData):
        # check if the user exists
        user = db.userbase_data.find_one({"sessionId": headers['token']})
        # check if the listing exists
        providerUser = db.userbase_data.find_one({"listings.listingId": userData["listingId"]})
        userListings = providerUser.get('listings')
        bookingList = user["recentBookings"]
        if user:
            listingNo = userData["listingNo"]
            listingBookingList = userListings[listingNo]["recentBookings"]
            endPrice = math.ceil(int(userData["totalTime"])/3600) * int(userListings[listingNo]["price"])
            #todo
            discountedPrice = self.applyPromoCode(endPrice, userData["promoCode"])
            booking = {
                    "endPrice": discountedPrice,
                    "feedback": userData["feedback"],
                    # todo
                    "endImageUrl": userData["endImageUrl"], 
                    # todo
                    "totalTime": userData["totalTime"],
                    "inEndBookingPhase": False
            }
            paymentMethods = stripe.PaymentMethod.list(
                customer=user['paymentId'],
                limit=3
            )
            if len(paymentMethods.data) <= 0 or user['defaultPaymentId'] == "":
                return jsonify({"type": "payment", "error": "payment failed"}), 402
 
            paymentMethodId = user['defaultPaymentId']
            try:
                stripe.PaymentIntent.create(
                    amount=int(discountedPrice * 100),
                    currency='AUD',
                    customer=user['paymentId'],
                    payment_method=paymentMethodId,
                    off_session=True,
                    confirm=True,
                )
                stripe.Transfer.create(
                    amount=int(discountedPrice * 0.85 * 100),
                    currency="AUD",
                    destination=providerUser['payOutId'],
                )
                helper.sendConfirmationEmail(user['email'], user['username'], discountedPrice)
            # err handling from https://docs.stripe.com/payments/without-card-authentication
            except stripe.error.CardError as e:
                return json.dumps({'error': e.user_message}), 200

            userListings[listingNo].update({'isActive': "True"})
            bookingList[-1].update(booking)
            listingBookingList[-1].update(booking)
            filter = {'email': user['email']}
            newvalues = {"$set" : {'recentBookings': bookingList}}
            db.userbase_data.update_one(filter, newvalues)
            filter = {"listings.listingId": userData["listingId"]}
            newvalues = {"$set" : {'listings': userListings}}
            db.userbase_data.update_one(filter, newvalues)
            filter = {"listingId": userData["listingId"]}
            newvalues = {"$set" : userListings[listingNo]}
            db.listingData.update_one(filter, newvalues)
            return json_util.dumps(discountedPrice)
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    
    def filterByPriceAndDistance(self, headers): 
        order = headers["order"]
        if headers["distance"] == "":
            distance = 10000000
        else:
            distance = int(headers["distance"])
        nearbyListings = json_util.loads(User.getClosestListings(self,headers,distance))
        page = int(headers['page'])
        pageSize = 12.0
        totalPage = math.ceil(len(nearbyListings)/pageSize)
        start = page*int(pageSize)
        end = int(page*pageSize)+int(pageSize)
        if page > totalPage:
            nearbyListings = []
        elif page + 1 >= totalPage:
            nearbyListings = nearbyListings[start:]
        else :
            nearbyListings = nearbyListings[start:end]
        if order == "":
            return json_util.dumps({'listings':nearbyListings, 'totalPage':totalPage})

        if order == "ascending": 
            return json_util.dumps({'listings':sorted(nearbyListings, key = lambda x: int(x["price"])), 'totalPage':totalPage})
        else: 
            return json_util.dumps({'listings':sorted(nearbyListings, key = lambda x:int(x["price"]), reverse = True), 'totalPage':totalPage})
        
    def searchForSpace(self, userData): 
        listings = db.listingData.find({})
        listingResults = []
        
        # regex
        pattern = re.compile(re.escape(userData['query']), re.IGNORECASE)
        
        for listing in listings: 
            if pattern.search(listing['address']) and listing['isActive'] == "True":
                now = int(datetime.datetime.now().timestamp() * 1000)
                start = int(datetime.datetime.strptime(listing['startDate'][:-1]+'+00:00', "%Y-%m-%dT%H:%M:%S.%f%z").timestamp() * 1000)
                end = int(datetime.datetime.strptime(listing['endDate'][:-1]+'+00:00', "%Y-%m-%dT%H:%M:%S.%f%z").timestamp() * 1000)
                # maybe update the expired listing as isActive = false in both listingDb and userDb
                if start <= now and now <= end:
                    listingResults.append(listing) 
    
        return json_util.dumps(listingResults)

    
    def addPaymentMethod(self, userData):
        user = db.userbase_data.find_one({"sessionId": userData['token']})
        if user:
            intent=stripe.SetupIntent.create(
                customer=user['paymentId'],
                automatic_payment_methods={"enabled": True},
                # return_url="https://localhost:3000/paymentAddedSuccess",
                # confirm=True
            )
            return jsonify({"client_secret":intent.client_secret})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    
    # https://docs.stripe.com/connect/testing#creating-accounts
    def providerDetails(self, userData):
        user = db.userbase_data.find_one({"sessionId": userData['token']})
        if user:
            typeOfLink = "account_update" if user["isStripeConnected"] else "account_onboarding"
            link = stripe.AccountLink.create(
                account=user['payOutId'],
                refresh_url="https://localhost:3000/providerDetailsExpired",
                return_url="https://localhost:3000/providerDetailsReturn",
                type=typeOfLink,
                collection_options={"fields": "eventually_due"},
            )
            if user["isStripeConnected"]  == False:
                filter = {'email': user['email']}
                newvalues = {"$set" : {'isStripeConnected': True}}
                db.userbase_data.update_one(filter, newvalues)
            return jsonify({"account_link":link.url})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    def userIsprovider(self,userData):
        user = db.userbase_data.find_one({"sessionId": userData['token']})

        if user:
            isAdmin = user.get('isAdmin', False)
            if isAdmin:
                return jsonify({"type": "User", "error": "Admin Account"}), 402
            account = stripe.Account.retrieve(user['payOutId'])
            if not account.payouts_enabled:
                return jsonify({"type": "User", "error": "Please provide or update provider details"}), 402

            return jsonify({"stripe_connected":user["isStripeConnected"]})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    
    def allCardList(self, userData):
        user = db.userbase_data.find_one({"sessionId": userData['token']})

        if user:
            respond = stripe.PaymentMethod.list(
                customer=user['paymentId'],
            )
            data = respond.data
            if (len(data) != 0) and (user['defaultPaymentId'] == ""):
                user['defaultPaymentId'] = data[0].id
                filter = {'email': user['email']}
                newvalues = {"$set" : {'defaultPaymentId': data[0].id}}
                db.userbase_data.update_one(filter, newvalues)


            return jsonify({"defaultPayment": user['defaultPaymentId'], "payments": data, })
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    
    def setDefaultCard(self, headers, userData):
        user = db.userbase_data.find_one({"sessionId": headers['token']})

        if user:
            try:
                # todo
                cardId = userData['defaultCard']
                respond = stripe.Customer.retrieve_payment_method(
                    user['paymentId'],
                    cardId,
                )
                user['defaultPaymentId'] = cardId
                filter = {'email': user['email']}
                newvalues = {"$set" : {'defaultPaymentId': cardId}}
                db.userbase_data.update_one(filter, newvalues)
            except stripe.error as e:    
                return json.dumps({'error': e.user_message}), 400
            return jsonify({"defaultPayment": user['defaultPaymentId']})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    def removeCard(self, headers, userData):
        user = db.userbase_data.find_one({"sessionId": headers['token']})
        if user:
            try:
                cardId = userData['cardId']
                respond = stripe.PaymentMethod.list(
                    customer=user['paymentId'],
                )
                data = respond.data
                matchData = [(x) for x in data if x.id == cardId]
                if len(matchData) == 0:
                    return json.dumps({'error': "No matched cardId"}), 400
                otherCards = [(x) for x in data if x.id != cardId]
                stripe.PaymentMethod.detach(cardId)
                if user['defaultPaymentId'] == cardId:
                    newDefault = ""
                    if  len(otherCards) != 0:
                        newDefault = otherCards[0].id
                    user['defaultPaymentId'] = newDefault
                    filter = {'email': user['email']}
                    newvalues = {"$set" : {'defaultPaymentId': newDefault}}
                    db.userbase_data.update_one(filter, newvalues)
            except stripe.error as e:    
                return json.dumps({'error': e.user_message}), 400
            return jsonify({"defaultPayment": user['defaultPaymentId'], "cards":otherCards})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    def getDefaultCard(self, userData):
        user = db.userbase_data.find_one({"sessionId": userData['token']})

        if user:
            try:
                if user['defaultPaymentId'] != "":
                    return jsonify({"defaultPayment": user['defaultPaymentId']})
                respond = stripe.PaymentMethod.list(
                    customer=user['paymentId'],
                )
                data = respond.data
                if (len(data) != 0) and (user['defaultPaymentId'] == ""):
                    user['defaultPaymentId'] = data[0].id
                    filter = {'email': user['email']}
                    newvalues = {"$set" : {'defaultPaymentId': data[0].id}}
                    db.userbase_data.update_one(filter, newvalues)
                    return jsonify({"defaultPayment": user['defaultPaymentId']})
                return jsonify({"type": "User", "error": "User Does Not have a default payment method"}), 402

            except stripe.error as e:    
                return json.dumps({'error': e.user_message}), 400
            return jsonify({"defaultPayment": user['defaultPaymentId'], "cards":otherCards})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402

    def getSpecificListing(self, headers):
        # user should be able to view listing before login in
        # check if the user exists
        user = db.userbase_data.find_one({"sessionId": headers['token']})

        # check if the listing exists

        listingData = db.listingData.find_one({"listingId": headers["listingId"]})
        if user: 
            listingData['bookedPreviously'] = False
            listingData['hasLiked'] = False
            for listing in user['recentBookings']: 
                if listing['listingId'] == headers['listingId']: 
                    listingData['bookedPreviously'] = True
                    if any(likedListing['listingId'] == headers["listingId"] for likedListing in user['likedListings']):
                        listingData['hasLiked'] = True
                    break
        return json_util.dumps(listingData)

    def getPreBookingTime(self, headers):
        # check if the user exists
        user = db.userbase_data.find_one({"sessionId": headers['token']})

        return json_util.dumps(user["preBookingTime"])
    
    def getBookingTime(self, headers):
        # check if the user exists

        user = db.userbase_data.find_one({"sessionId": headers['token']})
        bookingList = user["recentBookings"]

        return json_util.dumps(bookingList[-1]["startTime"])
    
    def applyPromoCode(self, bookingPrice, promoCode):

            if promoCode and promoCode.isalnum():
                #the last two digits 
                
                with open("./promoCodes.txt", "r") as file: 
                    for promo in file: 
                        if promoCode == promo.strip():
                            print(promoCode[-2:])
                            discountPercentage = int(promoCode[-2:]) 
                            discountedPrice = bookingPrice - (bookingPrice * discountPercentage / 100)
                            return discountedPrice
                return bookingPrice
            else:
                return bookingPrice
            
    def updateUser(self, userData, headers):
        # check if the user exists
        requester = db.userbase_data.find_one({"sessionId": headers['token']})
        userInfo = db.userbase_data.find_one({"email": headers['email']})
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402
        if userInfo:

            newuser = {
                "username": userData['username'], 
                "email" : userData["email"], 
                "profilePicture": userData['profilePicture'] 
            }
            userInfo.update(newuser)
            filter = {'email': userInfo['email']}
            newvalues = {"$set" : userInfo}
            db.userbase_data.update_one(filter, newvalues)
            return json_util.dumps(userInfo)
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

    def createDispute(self, userData, headers):
        # check if the user exists
        user = db.userbase_data.find_one({"sessionId": headers['token']})
        if user:
            dispute = {
                "disputeId": uuid.uuid4().hex,
                "address": userData['address'],
                "date": userData['date'],
                # todo
                "endPrice": userData['endPrice'],
                # todo
                "totalTime": userData['totalTime'],
                # todo
                "startTime": userData['startTime'],
                # todo
                "disputeBy": userData['disputeBy'],
                # todo
                "disputeAgainst": userData["disputeAgainst"],
                # todo
                "disputeMessage": userData["disputeMessage"], 
                # todo
                "disputeImage": userData['disputeImages'],
                "resolved": False 
            }
            db.disputes.insert_one(dispute)
            return jsonify({"message": "Dispute successfully created"}), 200
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def resolveDispute(self, userData, headers):
        user = db.userbase_data.find_one({"sessionId": headers['token']})

        if user:
            dispute = {
                "resolved": True 
            }
            disputeId = userData['disputeId']
            filter = {'disputeId': disputeId}
            newvalues = {"$set": dispute}
            db.disputes.update_one(filter, newvalues)
            return jsonify({"message": "Dispute successfully resolved"}), 200
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

            

    def getEmail(self, headers):
        providerUser = db.userbase_data.find_one({"listings.listingId": headers["listingId"]})
        return json_util.dumps(providerUser['email'])
    
    def getDisputes(self, headers):
        user = db.userbase_data.find_one({"sessionId": headers['token']})
        if user: 
            disputes = db.disputes.find()
            disputesList = list(disputes)  
            return json_util.dumps(disputesList)
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        
    # this function is never used along with its route
    def getRecentBookings(self, headers):
        # check if the user exists
        user = db.userbase_data.find_one({"email": headers['email']})
        # check if the listing exists
        userListings = user.get('listings')
        listingFound = [i for i in userListings if i["listingId"] == headers["listingId"]]

        listing = db.userbase_data.find_one(
            {"listings.listingId": headers["listingId"]},
            {"listings.$": 1}
        )

        recentBookings = listing.get('listings', [])[0].get('recentBookings', [])

        if user:
            if listingFound:
                return json_util.dumps(recentBookings)
            return jsonify({"type": "listingId", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    
    def like(self, userData, headers):
        # Check if the user exists
        user = db.userbase_data.find_one({"sessionId": headers['token']})
        if user:
            chk = False 
            likedListings = user['likedListings']
            userRecentBookings = user.get('recentBookings')
            for listing in userRecentBookings: 
                if listing['listingId'] == userData['listingId']: 
                    likedListings.append(listing)
                    chk = True
                    break

            if chk == True: 
                db.userbase_data.update_one({"email": user['email']}, {"$set": {"likedListings": likedListings}})
                providerUser = db.userbase_data.find_one({"listings.listingId": userData["listingId"]})
                userListings = providerUser.get('listings')
                for listing in userListings: 
                    if listing['listingId'] == userData['listingId']: 
                        listing['likes'] += 1
                db.userbase_data.update_one({"listings.listingId": userData["listingId"]}, {"$set": {"listings": userListings}})
                # Check if the listing exists
                listing = db.listingData.find_one({"listingId": userData["listingId"]})
                if listing: 
                    db.listingData.update_one({"_id": listing["_id"]}, {"$inc": {"likes": 1}})
                
                
            
            return jsonify({"message": "liked"}), 200
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    
    def dislike(self, userData, headers):
        user = db.userbase_data.find_one({"sessionId": headers['token']})
        if user:
            chk = False 
            likedListings = user['likedListings']
            userRecentBookings = user.get('recentBookings')
            for listing in userRecentBookings: 
                if listing['listingId'] == userData['listingId']: 
                    likedListings.remove(listing)
                    chk = True
                    break
            if chk == True: 
                db.userbase_data.update_one({"email": user['email']}, {"$set": {"likedListings": likedListings}})
                providerUser = db.userbase_data.find_one({"listings.listingId": userData["listingId"]})
                userListings = providerUser.get('listings')
                for listing in userListings: 
                    if listing['listingId'] == userData['listingId']: 
                        listing['likes'] -= 1
                        if listing['likes'] < 0: 
                            listing['likes'] = 0
                db.userbase_data.update_one({"listings.listingId": userData["listingId"]}, {"$set": {"listings": userListings}})
                # Check if the listing exists
                listing = db.listingData.find_one({"listingId": userData["listingId"]})
                if listing: 
                    if listing.get("likes", 0) > 0: 
                        db.listingData.update_one({"_id": listing["_id"]}, {"$inc": {"likes": -1}})
            return jsonify({"message": "disliked"}), 200
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    
    def timerPersistence(self, headers):
        user = db.userbase_data.find_one({"sessionId": headers['token']})
        if user:
            if user['preBookingTime'] != "":
                return jsonify({"result": "prebooking", "listingId": user['currentListingId'], "listingNo": user['currentListingNo'], "carNumberPlate": user['carNumberPlate']}), 200
            elif len(user['recentBookings']) != 0:
                if user['recentBookings'][-1]['inEndBookingPhase'] == True:
                    return jsonify({"result": "endbooking", "listingId": user['currentListingId'], "listingNo": user['currentListingNo'], "timer": user['timer']}), 200
                if user['recentBookings'][-1]['totalTime'] == "":
                    return jsonify({"result": "booking", "listingId": user['currentListingId'], "listingNo": user['currentListingNo']}), 200
                else:
                    return jsonify({"result": "none"}), 200
            else:
                return jsonify({"result": "none"}), 200
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402

    def saveTimer(self, userData, headers):
        user = db.userbase_data.find_one({"sessionId": headers['token']})
        if user:
            db.userbase_data.update_one({"sessionId": headers['token']}, {"$set": {"timer": userData["timer"]}})
            if user['recentBookings']:
                lastBookingIndex = len(user['recentBookings']) - 1
                updateField = f"recentBookings.{lastBookingIndex}.inEndBookingPhase"
                db.userbase_data.update_one(
                    {"sessionId": headers['token']},
                    {"$set": {updateField: True}}
                )
            return json_util.dumps("Pass")
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
        
    def notifs(self, db, providerUser, address, date):
        # Check if providerUser exists
        notificationMessage = f"Your listing {address} has been booked."
        if providerUser:
            # Push notificationMessage to the notifications array
            db.userbase_data.update_one(
                {"_id": providerUser["_id"]},
                {
                    "$push": {
                        "notifications": {
                            "title": address,
                            "description": notificationMessage,
                            "date": date 
                        }
                    }
                }
            )
        else:
            print("Provider user not found.")
    
    def getNotifs(self, headers):
        user = db.userbase_data.find_one({"sessionId": headers['token']})
        if user:
            notifications = user.get("notifications", [])
            return json_util.dumps(notifications)
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def makeReco(self, headers): 
        user = db.userbase_data.find_one({"sessionId": headers['token']})
        if user: 
            matrixDf = helper.makeDf(db)
            # fit the model with the user interactions
            model = NearestNeighbors(n_neighbors=3, metric='cosine')
            model.fit(matrixDf)
            userInteraction = matrixDf.loc[headers['email']]
            distances, indices = model.kneighbors([userInteraction])
            # Retrieve recommended car spaces
            recommendations = []
            targetUserIdx = matrixDf.index.get_loc(headers['email'])
            for idx in indices.flatten():
                if idx != targetUserIdx:  # Exclude target user
                    recommendations.extend(matrixDf.iloc[idx][matrixDf.iloc[idx] > 0].index)

            # Remove duplicates and sort recommendations by interaction strength
            recommendations = list(set(recommendations))
            recommendations.sort(reverse=True)
            listingsDb = db.listingData.find({})
            for listing in listingsDb: 
                if listing['listingId'] in recommendations: 
                    recommendations.append(listing)
                    recommendations.remove(listing['listingId'])
            return json_util.dumps(recommendations)