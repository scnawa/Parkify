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
        # Get the latitude and longitude of the user's IP address
        latitude, longitude = geocoder.ip('me').latlng
        # Create a dictionary to hold user data with initial values
        user = {
            "username": userData['username'],
            "password": userData['password'],
            "listings": userData["listings"], # one list of dictionaries of different listings
            "creditCards": userData['creditCards'],
            "email": userData["email"],
            "sessionId": [],
            "recentBookings": [],
            "isVerified": False,
            "latitude": latitude,
            "longitude": longitude,
            "paymentId": "",
            "payOutId": "",
            "defaultPaymentId": "",
            "isStripeConnected": False,
            "preBookingTime": "",
            "currentListingId": "",
            "currentListingNo": "",
            "profilePicture": "",
            "likedListings": [],
            "carNumberPlate": "",
            "timer": "",
        }

        # Encrypt the user's password using pbkdf2_sha256
        user['password'] = pbkdf2_sha256.encrypt(user['password'])

        # Check if email is already in use
        if db.userbaseData.find_one({"email": userData['email']}):
            return jsonify({'type': "email", "error": "Email already in use"}), 400

        # Try to create Stripe customer and account
        try:
            userPayment = stripe.Customer.create(
                name=userData['username'],
                email=userData["email"],
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

        # Insert user data into the database
        if db.userbaseData.insert_one(user):
            # Return the user data as JSON for debugging purposes
            return json_util.dumps(user)

        # Return an error if the signup failed
        return jsonify({'type': "system error", "error": "Signup failed due to unforeseen circumstances"}), 400
    
    def getUsername(self, userData): 
        # Find user by email
        user = db.userbaseData.find_one({"email": userData['email']})
        if user:
            # Return the username if the user exists
            return user['username']
        # Return an error if the user does not exist
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

    def setupAdmin(self, userData): 
        # Create a dictionary to hold admin user data
        user = {
            "username": userData['username'],
            "password": userData['password'],
            "email": userData["email"],
            "sessionId": [],
            "isVerified": True,
            "isAdmin": True,
            "disputes": [],
            "profilePicture": "",
        }

        # Encrypt the user's password using pbkdf2_sha256
        user['password'] = pbkdf2_sha256.encrypt(user['password'])

        # Check if email is already in use
        if db.userbaseData.find_one({"email": userData['email']}):
            return jsonify({'type': "email", "error": "Email already in use"}), 400

        # Insert admin user data into the database
        if db.userbaseData.insert_one(user):
            # Return a success message as JSON for debugging purposes
            return json_util.dumps({"type": "SUCCESS"})

    def checkAdmin(self, headers): 
        # Retrieve a user from the database using the session ID token from the headers
        user = db.userbaseData.find_one({"sessionId": headers['token']})
        
        # If a user is found, check if the user is an admin
        if user:
            # Get the 'isAdmin' flag from the user's data, defaulting to False if not present
            isAdmin = user.get('isAdmin', False)
            # Return the 'isAdmin' status in a JSON response
            return jsonify({'isAdmin': isAdmin})
        
        # If no user is found, return a JSON response indicating the user is not an admin
        return jsonify({'isAdmin': False})

    def login(self, userData): 
        # Fetch the user from the database based on the provided email
        user = db.userbaseData.find_one({"email": userData['email']})
        # If 'isVerified' key is in userData, update the user's verification status
        if "isVerified" in userData:
            user['isVerified'] = userData['isVerified']
            db.userbaseData.update_one({"email": userData['email']}, {"$set": {"isVerified": user['isVerified']}})
        
        # If the user exists
        if user:
            # If the user is not verified, return an error
            if user['isVerified'] == False:
                return jsonify({"type": "Unverified User", "error": "The user has not verified their email"}), 405
            
            # Verify the password using pbkdf2_sha256 library
            if pbkdf2_sha256.verify(userData['password'], user['password']):
                # If the user is not verified, return an error
                if user['isVerified'] == False:
                    return jsonify({"type": "Unverified User", "error": "The user has not verified their email"}), 405
                
                # Generate a new session ID
                currentSessionID = uuid.uuid4().hex
                while user['sessionId'].count(currentSessionID) > 0:
                    currentSessionID = uuid.uuid4().hex
                
                # Add the new session ID to the user
                sessionIDList = user["sessionId"]
                sessionIDList.append(currentSessionID)
                
                # Update the session IDs in the database
                db.userbaseData.update_many({'email': user['email']}, {"$set": {"sessionId": sessionIDList}})
                
                # Return user data as JSON
                return json_util.dumps(user)
            else:
                # If password is incorrect, return an error
                return jsonify({"type": "password", "error": "Password Is Incorrect"}), 401
        
        # If the user does not exist, return an error
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402


    def logout(self, userData): 
        # Find the user in the database using the provided session ID
        user = db.userbaseData.find_one({"sessionId": userData['token']})
        
        # If the user exists
        if user:
            # Check if the provided session ID is not present in the user's session ID list
            if not user['sessionId'].count(userData['currentSessionID']) > 0:
                return jsonify({'error': "Session Does Not Exist"}), 403
            
            # Remove the current session ID from the user's session ID list
            user['sessionId'].remove(userData['currentSessionID'])
            
            # Update the user's session ID list in the database
            db.userbaseData.update_one({"email": user['email']}, {"$set": {"sessionId": user['sessionId']}})
            
            # Return success status
            return jsonify({'status': "PASS"}), 200
    
        # If the user does not exist, return an error
        return jsonify({"type": "username", "error": "User Does Not Exist"}), 402
    

    def deleteAccount(self, userData): 
        # Find the requester and the user in the database using session ID and email
        requester = db.userbaseData.find_one({"sessionId": userData['token']})
        userInfo = db.userbaseData.find_one({"email": userData['email']})
        
        # If the user does not exist, return an error
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        
        # If the requester does not exist, return an error
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        
        # Check if the requester is not the same as the user and is not an admin
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402
        
        # If the user has listings, delete them from the listings DB
        listingIds = [listing['listingId'] for listing in userInfo.get('listings', [])]
        if listingIds:
            for listingId in listingIds:
                db.listingData.delete_one({"listingId": listingId})
        
        # If the user is not an admin, delete payment and payout information
        if not userInfo.get('isAdmin', False):
            if userInfo["paymentId"] != "":
                stripe.Customer.delete(userInfo["paymentId"])
            if userInfo["payOutId"] != "":
                stripe.Account.delete(userInfo["payOutId"])
            
            # Delete the user's account from the database
            db.userbaseData.delete_one(userInfo)
            
            # Return success status
            return jsonify({'status': "PASS"}), 200
        
        # If the user is an admin, delete their account from the database and return success status
        db.userbaseData.delete_one(userInfo)
        return jsonify({'status': "PASS"}), 200
    
    def resetPass(self, userData): 
        # Find the user in the database using the provided email
        user = db.userbaseData.find_one({"email": userData['email']})
        
        # If the user exists
        if user:
            # Update the user's password in the database
            db.userbaseData.update_one({"email": userData['email']}, {"$set": {"password": pbkdf2_sha256.encrypt(user['password'])}})
            
            # Return success status
            return jsonify({'status': "PASS"}), 200
        
        # If the user does not exist, return an error
        return jsonify({"type": "username", "error": "User Does Not Exist"}), 402
    
    
    # Function to create a new listing
    def createListing(self, userData):
        # Retrieve requester's information from the database using session token
        requester = db.userbaseData.find_one({"sessionId": userData['token']})
        # Retrieve user's information from the database using email
        userInfo = db.userbaseData.find_one({"email": userData['email']})
        # Check if the user exists
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        # Check if the session ID exists
        if not requester:
            return jsonify({"type": "email", "error": "Session ID Does Not Exist"}), 402
        # Check if the requester has permission to create a listing
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        if userInfo:
            # Create a new listing object
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

            # Update user's listings with the new listing
            userListings = userInfo['listings']
            userListings.append(listing)
            filter = {'email': userInfo['email']}
            newvalues = {"$set" : {'listings': userListings}}
            db.userbaseData.update_one(filter, newvalues)
            # Insert the new listing into the listings database
            db.listingData.insert_one(listing)

            return json_util.dumps(listing["listingId"])
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

    # Function to deactivate a listing
    def deactivateListing(self, userData, headers):
        # Retrieve requester's information from the database using session token
        requester = db.userbaseData.find_one({"sessionId": headers['token']})
        # Retrieve user's information from the database using email
        userInfo = db.userbaseData.find_one({"email": headers['email']})
        # Check if the user exists
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        # Check if the session ID exists
        if not requester:
            return jsonify({"type": "email", "error": "Session ID Does Not Exist"}), 402
        # Check if the requester has permission to deactivate the listing
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        # Check if the listing exists
        userListings = userInfo.get('listings')
        listingFound = [i for i in userListings if i["listingId"] == userData["listings"]["listingId"]]

        if userInfo:
            if listingFound:
                # Deactivate the listing
                listingNo = userData["listings"]["listingNo"] 
                userListings[listingNo].update({'startDate': "", 'endDate': "", 'isActive': "False"})
                filter = {'email': userInfo['email']}
                newvalues = {"$set" : {'listings': userListings}}
                db.userbaseData.update_one(filter, newvalues)

                # Update the same listing within the listings database
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

    # Function to activate a listing
    def activateListing(self, userData, headers):
        # Retrieve requester's information from the database using session token
        requester = db.userbaseData.find_one({"sessionId": headers['token']})
        # Retrieve user's information from the database using email
        userInfo = db.userbaseData.find_one({"email": headers['email']})
        # Check if the user exists
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        # Check if the session ID exists
        if not requester:
            return jsonify({"type": "email", "error": "Session ID Does Not Exist"}), 402
        # Check if the requester has permission to activate the listing
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        # Check if the listing exists
        userListings = userInfo.get('listings')
        listingFound = [i for i in userListings if i["listingId"] == userData["listings"]["listingId"]]

        if userInfo:
            if listingFound:
                # Activate the listing
                listingNo = userData["listings"]["listingNo"] 
                userListings[listingNo].update({'startDate': userData['listings']['startDate'], 'endDate': userData['listings']['endDate'], 'isActive': "True"})
                filter = {'email': userInfo['email']}
                newvalues = {"$set" : {'listings': userListings}}
                db.userbaseData.update_one(filter, newvalues)

                # Update the same listing within the listings database
                listingId = userData["listings"]["listingId"] 
                filter = {'listingId': listingId}
                newvalues = {
                    "$set": {
                        'startDate': userData['listings']['startDate'],
                        'endDate': userData['listings']['endDate'],
                        'isActive': "True"
                    }
                }
                db.listingData.update_one(filter, newvalues)

                return json_util.dumps(userInfo)
            return jsonify({"type": "listingId", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
        # Method to delete a listing
    def deleteListing(self, userData, headers):
        # Retrieving requester and user information from the database
        requester = db.userbaseData.find_one({"sessionId": headers['token']})
        userInfo = db.userbaseData.find_one({"email": headers['email']})
        # Checking if the user exists
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        # Checking if the session id exists
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        # Checking if the requester has permission to delete the listing
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        # Check if the listing exists in the user's listings
        userListings = userInfo.get('listings')
        listingFound = [i for i in userListings if i["listingId"] == userData["listings"]["listingId"]]
        if userInfo:
            if listingFound:
                # Removing the listing from the user's listings
                listingNo = userData["listings"]["listingNo"]
                userListings.remove(userListings[listingNo])
                # Adjusting listing numbers for remaining listings
                listingLength = len(userInfo['listings'])
                while listingNo < listingLength:
                    userListings[listingNo].update({'listingNo': userListings[listingNo]['listingNo'] - 1})
                    listingNo += 1
                # Updating user's listings in the database
                filter = {'email': userInfo['email']}
                newvalues = {"$set": {'listings': userListings}}
                db.userbaseData.update_one(filter, newvalues)

                # Deleting the listing from the listing database
                listingId = userData["listings"]["listingId"]
                filter = {'listingId': listingId}
                db.listingData.delete_one(filter)

                return json_util.dumps(userListings)
            return jsonify({"type": "listingId", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

    # Method to update a listing
    def updateListing(self, userData, headers):
        # Retrieving requester and user information from the database
        requester = db.userbaseData.find_one({"sessionId": headers['token']})
        userInfo = db.userbaseData.find_one({"email": headers['email']})
        # Checking if the user exists
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        # Checking if the session id exists
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        # Checking if the requester has permission to update the listing
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        # Check if the listing exists in the user's listings
        userListings = userInfo.get('listings')
        listingFound = [i for i in userListings if i["listingId"] == userData["listings"]["listingId"]]
        if userInfo:
            if listingFound:
                # Creating a new listing object with updated data
                listing = {
                    "address": userData['listings']['address'],
                    "price": userData['listings']['price'],
                    "quantity": userData['listings']['quantity'],
                    "details": userData['listings']['details'],
                    "restrictions": userData['listings']['restrictions'],
                    "imageUrl": userData['listings']['imageUrl'],
                    "images": userData['listings']['images'],
                    "startDate": userData['listings']['startDate'],
                    "endDate": userData['listings']['endDate'],
                    "isActive": userData['listings']['isActive']
                }
                # Updating the listing in the user's listings
                listingNo = userData["listings"]["listingNo"]
                userListings = userInfo['listings']
                userListings[listingNo].update(listing)
                # Updating user's listings in the database
                filter = {'email': userInfo['email']}
                newvalues = {"$set": {'listings': userListings}}
                db.userbaseData.update_one(filter, newvalues)

                # Updating the listing in the listing database
                listingId = userData['listings']['listingId']
                filter = {'listingId': listingId}
                newvalues = {"$set": listing}
                db.listingData.update_one(filter, newvalues)

                return json_util.dumps(userInfo)
            return jsonify({"type": "listingId", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

    # Method to retrieve all listings of a user
    def getListings(self, headers):
        # Retrieving requester and user information from the database
        requester = db.userbaseData.find_one({"sessionId": headers['token']})
        userInfo = db.userbaseData.find_one({"email": headers['email']})
        # Checking if the user exists
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        # Checking if the session id exists
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        # Checking if the requester has permission to access the listings
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402
        if userInfo:
            return json_util.dumps(userInfo['listings'])
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402

    # Method to retrieve all non-admin users
    def getAllUsers(self, headers):
        query = {
            "isAdmin": {"$ne": True}
        }
        projection = {"_id": 0, "username": 1, "email": 1}

        usersCursor = db.userbaseData.find(query, projection)
        users = list(usersCursor)
        return json_util.dumps(users)

    # Method to retrieve a specific listing of a user
    def getListing(self, headers):
        # Retrieving user information from the database
        user = db.userbaseData.find_one({"email": headers['email']})
        # Checking if the user exists
        if user:
            # Checking if the listing exists in the user's listings
            userListings = user.get('listings')
            listingFound = [i for i in userListings if i["listingId"] == headers["listings"]["listingId"]]
            if listingFound:
                listingNo = headers["listings"]["listingNo"]
                return json_util.dumps(userListings[listingNo])
            return jsonify({"type": "listingId", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    

    def getAllListings(self):
        # Fetches all documents from the userbaseData collection in the database
        # Each document contains listings information (excluding '_id' key)
        allListings = db.userbaseData.find({}, {"_id": 0, 'listings': 1})
        
        # Initialize an empty list to store all active listings
        allActiveListings = []
        
        # Iterates through each document in allListings
        for listingDict in allListings:
            # Checks if the document (listingDict) is not empty
            if bool(listingDict):
                # Iterates through each listing in the listings list
                for listing in listingDict['listings']:
                    # Checks if the listing is active (isActive == "True")
                    if listing['isActive'] == "True":
                        # Adds the active listing to the allActiveListings list
                        allActiveListings.append(listing)
        
        # Converts the list of active listings to a JSON string and returns it
        return json_util.dumps(allActiveListings)

    def getUserInfo(self, userData):
        # Finds a user document based on the sessionId (token) provided in userData
        requester = db.userbaseData.find_one({"sessionId": userData['token']})
        # Finds a user document based on the email provided in userData
        userInfo = db.userbaseData.find_one({"email": userData['email']})
        
        # If no user information is found based on the email, returns an error message
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        
        # If no user information is found based on the sessionId, returns an error message
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        
        # Checks if the requester has permission to access user information
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402
        
        # Returns user information as a JSON string if found
        if userInfo:
            return json_util.dumps(userInfo)
        
        # Returns an error message if no user information is found
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402

    def holdListing(self, userData):
        # Finds the user document based on the sessionId (token) provided in userData
        user = db.userbaseData.find_one({"sessionId": userData['token']})
        
        # Finds the provider user document based on the listingId provided in userData
        providerUser = db.userbaseData.find_one({"listings.listingId": userData["listingId"]})
        userListings = providerUser.get('listings')
        
        # Gets the current date and time
        now = datetime.datetime.now()
        startTime = now.strftime("%H:%M:%S")
        
        # If the user is found
        if user:
            # Updates user information with the booking details
            db.userbaseData.update_one({"email": user['email']}, {"$set": {"preBookingTime": startTime}})
            db.userbaseData.update_one({"email": user['email']}, {"$set": {"currentListingId": userData["listingId"]}})
            db.userbaseData.update_one({"email": user['email']}, {"$set": {"currentListingNo": userData["listingNo"]}})
            db.userbaseData.update_one({"email": user['email']}, {"$set": {"carNumberPlate": userData["carNumberPlate"]}})
            
            # Gets the listing number to book
            listingNo = userData["listingNo"]
            # Marks the listing as inactive
            userListings[listingNo].update({'isActive': "False"})
            
            # Updates the provider user document with the modified listings
            filter = {"listings.listingId": userData["listingId"]}
            newvalues = {"$set": {'listings': userListings}}
            db.userbaseData.update_one(filter, newvalues)
            
            # Updates the listing data in db.listingData collection
            filter = {"listingId": userData["listingId"]}
            newvalues = {"$set": userListings[listingNo]}
            db.listingData.update_one(filter, newvalues)
            
            # Starts a timer for the holdListing function to call timerThread after 600 seconds
            self.timer = threading.Timer(600, User.timerThread, args=(User, userData,))
            self.timer.start()
            
            # Returns a success message as a JSON string
            return json_util.dumps("Pass")
        
        # If the user is not found, returns an error message
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

    def timerThread(self, userData):
        # Calls releaseListing function to release the listing
        User.releaseListing(self, userData)

    def releaseListing(self, userData):
        # Cancels the timer to prevent further execution
        self.timer.cancel()
        
        # Finds the user document based on the sessionId (token) provided in userData
        user = db.userbaseData.find_one({"sessionId": userData['token']})
        
        # Finds the provider user document based on the listingId provided in userData
        providerUser = db.userbaseData.find_one({"listings.listingId": userData["listingId"]})
        userListings = providerUser.get('listings')
        
        # If the user is found
        if user:
            # Gets the listing number
            listingNo = userData["listingNo"]
            
            # Marks the listing as active
            userListings[listingNo].update({'isActive': "True"})
            
            # Updates the user document to reset preBookingTime
            db.userbaseData.update_one({"email": user['email']}, {"$set": {"preBookingTime": ""}})
            
            # Updates the provider user document with the modified listings
            filter = {"listings.listingId": userData["listingId"]}
            newvalues = {"$set": {'listings': userListings}}
            db.userbaseData.update_one(filter, newvalues)
            
            # Updates the listing data in db.listingData collection
            filter = {"listingId": userData["listingId"]}
            newvalues = {"$set": userListings[listingNo]}
            db.listingData.update_one(filter, newvalues)
            
            # Returns a success message as a JSON string
            return json_util.dumps("Pass")
        
        # If the user is not found, returns an error message
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

    
        # Method to retrieve closest listings based on provided headers and distance
    def getClosestListings(self, headers, distance): 
        # Extract latitude and longitude from headers
        latitude = float(headers['lat'])
        longitude = float(headers['lon'])
        closestListings = []
        # Iterate through all listings in the database
        for listing in db.listingData.find({}): 
            # Retrieve latitude and longitude of the listing
            listingLat = 0
            listingLong = 0
            # Check if latitude and longitude are available in the listing data
            if 'latitude' not in listing.keys() or 'longitude' not in listing.keys(): 
                # Calculate latitude and longitude from address if not available
                listingLat, listingLong = helper.calcLatLong(listing['address'])
            else:
                listingLat = listing["latitude"]
                listingLong = listing["longitude"]

            # Check if the listing is active and within the specified distance
            if listing['isActive'] == "True" and helper.calculateDistance(latitude, listingLat, longitude, listingLong) <= distance: 
                # Convert timestamp strings to milliseconds
                now = int(datetime.datetime.now().timestamp() * 1000)
                start = int(datetime.datetime.strptime(listing['startDate'][:-1]+'+00:00', "%Y-%m-%dT%H:%M:%S.%f%z").timestamp() * 1000)
                end = int(datetime.datetime.strptime(listing['endDate'][:-1]+'+00:00', "%Y-%m-%dT%H:%M:%S.%f%z").timestamp() * 1000)
                # Check if the listing is within the active timeframe
                if start <= now and now <= end:
                    closestListings.append(listing)
        # Return closest listings in JSON format
        return json_util.dumps(closestListings)

    # Method to create a booking
    def createBooking(self, userData):
        # Cancel any existing timer
        if self.timer:
            self.timer.cancel()
        # Retrieve user data using session token
        user = db.userbaseData.find_one({"sessionId": userData['token']})
        # Retrieve provider user data using listing ID
        providerUser = db.userbaseData.find_one({"listings.listingId": userData["listingId"]})
        # Retrieve user's listings and recent bookings
        userListings = providerUser.get('listings')
        bookingList = user["recentBookings"]

        # Extract relevant data for the booking
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
        # Send notifications
        self.notifs(db, providerUser, userListings[listingNo]["address"], today)

        # If user exists, update user and listing data with new booking information
        if user:
            bookingList.append(booking)
            userListings[listingNo].update({'isActive': "False"})
            db.userbaseData.update_one({"email": user['email']}, {"$set": {"preBookingTime": ""}})
            filter = {'email': user['email']}
            newvalues = {"$set" : {'recentBookings': bookingList}}
            db.userbaseData.update_one(filter, newvalues)
            booking.update({"email": user['email']})
            del booking["recentBookingNo"]
            listingBookingList.append(booking)
            filter = {"listings.listingId": userData["listingId"]}
            newvalues = {"$set" : {'listings': userListings}}
            db.userbaseData.update_one(filter, newvalues)
            filter = {"listingId": userData["listingId"]}
            newvalues = {"$set" : userListings[listingNo]}
            db.listingData.update_one(filter, newvalues)
            return json_util.dumps(user["recentBookings"]) # Return recent bookings in JSON format
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

    # Method to remove a recent booking
    def removeRecentBooking(self, userData):
        # Retrieve user data using email
        user = db.userbaseData.find_one({"email": userData['email']})
        # Retrieve user's recent bookings
        bookingList = user["recentBookings"]

        # If user exists, remove specified recent booking and update booking numbers
        if user:
            recentBookingNo = userData["booking"]["recentBookingNo"]
            recentBookingLength = len(user['recentBookings'])
            bookingList.remove(bookingList[recentBookingNo])
            recentBookingLength = len(user['recentBookings'])
            while recentBookingNo < recentBookingLength:
                bookingList[recentBookingNo].update({'recentBookingNo': bookingList[recentBookingNo]['recentBookingNo'] - 1})
                recentBookingNo += 1                
            filter = {'email': user['email']}
            newvalues = {"$set" : {'recentBookings': bookingList}}
            db.userbaseData.update_one(filter, newvalues)
            return json_util.dumps(user["recentBookings"]) # Return recent bookings in JSON format
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    # Method to finalize a booking process
    def endBooking(self, headers, userData):
        # Check if the user exists
        user = db.userbaseData.find_one({"sessionId": headers['token']})
        # Check if the listing exists
        providerUser = db.userbaseData.find_one({"listings.listingId": userData["listingId"]})
        userListings = providerUser.get('listings')
        bookingList = user["recentBookings"]
        if user:
            # Extract necessary data
            listingNo = userData["listingNo"]
            listingBookingList = userListings[listingNo]["recentBookings"]
            # Calculate end price and apply promo code if available
            endPrice = math.ceil(int(userData["totalTime"]) / 3600) * int(userListings[listingNo]["price"])
            discountedPrice = self.applyPromoCode(endPrice, userData["promoCode"])
            # Prepare booking details
            booking = {
                    "endPrice": discountedPrice,
                    "feedback": userData["feedback"],
                    "endImageUrl": userData["endImageUrl"],
                    "totalTime": userData["totalTime"],
                    "inEndBookingPhase": False
            }
            # Perform payment and related actions
            paymentMethods = stripe.PaymentMethod.list(
                customer=user['paymentId'],
                limit=3
            )
            if len(paymentMethods.data) <= 0 or user['defaultPaymentId'] == "":
                return jsonify({"type": "payment", "error": "payment failed"}), 402
            paymentMethodId = user['defaultPaymentId']
            try:
                # Create payment intent
                stripe.PaymentIntent.create(
                    amount=int(discountedPrice * 100),
                    currency='AUD',
                    customer=user['paymentId'],
                    payment_method=paymentMethodId,
                    off_session=True,
                    confirm=True,
                )
                # Create transfer to provider's account
                stripe.Transfer.create(
                    amount=int(discountedPrice * 0.85 * 100),
                    currency="AUD",
                    destination=providerUser['payOutId'],
                )
                # Send confirmation email to user
                helper.sendConfirmationEmail(user['email'], user['username'], discountedPrice)
            # Handle payment errors
            except stripe.error.CardError as e:
                return json.dumps({'error': e.user_message}), 200
            # Update booking and listing data in databases
            userListings[listingNo].update({'isActive': "True"})
            bookingList[-1].update(booking)
            listingBookingList[-1].update(booking)
            filter = {'email': user['email']}
            newvalues = {"$set": {'recentBookings': bookingList}}
            db.userbaseData.update_one(filter, newvalues)
            filter = {"listings.listingId": userData["listingId"]}
            newvalues = {"$set": {'listings': userListings}}
            db.userbaseData.update_one(filter, newvalues)
            filter = {"listingId": userData["listingId"]}
            newvalues = {"$set": userListings[listingNo]}
            db.listingData.update_one(filter, newvalues)
            return json_util.dumps(discountedPrice)
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

    # Method to filter listings by price and distance
    def filterByPriceAndDistance(self, headers):
        order = headers["order"]
        # Determine distance threshold
        if headers["distance"] == "":
            distance = 10000000
        else:
            distance = int(headers["distance"])
        # Fetch nearby listings
        nearbyListings = json_util.loads(User.getClosestListings(self, headers, distance))
        # Paginate listings
        page = int(headers['page'])
        pageSize = 12.0
        totalPage = math.ceil(len(nearbyListings) / pageSize)
        start = page * int(pageSize)
        end = int(page * pageSize) + int(pageSize)
        if page > totalPage:
            nearbyListings = []
        elif page + 1 >= totalPage:
            nearbyListings = nearbyListings[start:]
        else:
            nearbyListings = nearbyListings[start:end]
        # Order listings based on price
        if order == "":
            return json_util.dumps({'listings': nearbyListings, 'totalPage': totalPage})
        if order == "ascending":
            return json_util.dumps({'listings': sorted(nearbyListings, key=lambda x: int(x["price"])), 'totalPage': totalPage})
        else:
            return json_util.dumps({'listings': sorted(nearbyListings, key=lambda x: int(x["price"]), reverse=True), 'totalPage': totalPage})

    # Method to search for available spaces based on query
    def searchForSpace(self, userData):
        listings = db.listingData.find({})
        listingResults = []
        # Define regex pattern for search query
        pattern = re.compile(re.escape(userData['query']), re.IGNORECASE)
        # Iterate through listings to find matches
        for listing in listings:
            if pattern.search(listing['address']) and listing['isActive'] == "True":
                now = int(datetime.datetime.now().timestamp() * 1000)
                start = int(datetime.datetime.strptime(listing['startDate'][:-1] + '+00:00', "%Y-%m-%dT%H:%M:%S.%f%z").timestamp() * 1000)
                end = int(datetime.datetime.strptime(listing['endDate'][:-1] + '+00:00', "%Y-%m-%dT%H:%M:%S.%f%z").timestamp() * 1000)
                # Check if listing is active within current time frame
                if start <= now and now <= end:
                    listingResults.append(listing)
        return json_util.dumps(listingResults)

    # Method to add a payment method for a user
    def addPaymentMethod(self, userData):
        user = db.userbaseData.find_one({"sessionId": userData['token']})
        if user:
            # Create setup intent for adding payment method
            intent = stripe.SetupIntent.create(
                customer=user['paymentId'],
                automatic_payment_methods={"enabled": True},
                # return_url="https://localhost:3000/paymentAddedSuccess",
                # confirm=True
            )
            return jsonify({"clientSecret": intent.client_secret})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    
    # https://docs.stripe.com/connect/testing#creating-accounts
    def providerDetails(self, userData):
        user = db.userbaseData.find_one({"sessionId": userData['token']})
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
                db.userbaseData.update_one(filter, newvalues)
            return jsonify({"accountLink":link.url})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    def userIsprovider(self,userData):
        user = db.userbaseData.find_one({"sessionId": userData['token']})

        if user:
            isAdmin = user.get('isAdmin', False)
            if isAdmin:
                return jsonify({"type": "User", "error": "Admin Account"}), 402
            account = stripe.Account.retrieve(user['payOutId'])
            if not account.payouts_enabled:
                return jsonify({"type": "User", "error": "Please provide or update provider details"}), 402

            return jsonify({"stripeConnected":user["isStripeConnected"]})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    
    def allCardList(self, userData):
        user = db.userbaseData.find_one({"sessionId": userData['token']})

        if user:
            respond = stripe.PaymentMethod.list(
                customer=user['paymentId'],
            )
            data = respond.data
            if (len(data) != 0) and (user['defaultPaymentId'] == ""):
                user['defaultPaymentId'] = data[0].id
                filter = {'email': user['email']}
                newvalues = {"$set" : {'defaultPaymentId': data[0].id}}
                db.userbaseData.update_one(filter, newvalues)


            return jsonify({"defaultPayment": user['defaultPaymentId'], "payments": data, })
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    
    def setDefaultCard(self, headers, userData):
        user = db.userbaseData.find_one({"sessionId": headers['token']})

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
                db.userbaseData.update_one(filter, newvalues)
            except stripe.error as e:    
                return json.dumps({'error': e.user_message}), 400
            return jsonify({"defaultPayment": user['defaultPaymentId']})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    def removeCard(self, headers, userData):
        user = db.userbaseData.find_one({"sessionId": headers['token']})
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
                    db.userbaseData.update_one(filter, newvalues)
            except stripe.error as e:    
                return json.dumps({'error': e.user_message}), 400
            return jsonify({"defaultPayment": user['defaultPaymentId'], "cards":otherCards})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    def getDefaultCard(self, userData):
        user = db.userbaseData.find_one({"sessionId": userData['token']})

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
                    db.userbaseData.update_one(filter, newvalues)
                    return jsonify({"defaultPayment": user['defaultPaymentId']})
                return jsonify({"type": "User", "error": "User Does Not have a default payment method"}), 402

            except stripe.error as e:    
                return json.dumps({'error': e.user_message}), 400
            return jsonify({"defaultPayment": user['defaultPaymentId'], "cards":otherCards})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402

    def getSpecificListing(self, headers):
        # user should be able to view listing before login in
        # check if the user exists
        user = db.userbaseData.find_one({"sessionId": headers['token']})

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
        user = db.userbaseData.find_one({"sessionId": headers['token']})

        return json_util.dumps(user["preBookingTime"])
    
    def getBookingTime(self, headers):
        # check if the user exists

        user = db.userbaseData.find_one({"sessionId": headers['token']})
        bookingList = user["recentBookings"]

        return json_util.dumps(bookingList[-1]["startTime"])
    
    def applyPromoCode(self, bookingPrice, promoCode):

            if promoCode and promoCode.isalnum():
                #the last two digits 
                
                with open("./promoCodes.txt", "r") as file: 
                    for promo in file: 
                        if promoCode == promo.strip():
                            discountPercentage = int(promoCode[-2:]) 
                            discountedPrice = bookingPrice - (bookingPrice * discountPercentage / 100)
                            return discountedPrice
                return bookingPrice
            else:
                return bookingPrice
            
    def updateUser(self, userData, headers):
        # check if the user exists
        requester = db.userbaseData.find_one({"sessionId": headers['token']})
        userInfo = db.userbaseData.find_one({"email": headers['email']})
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
            db.userbaseData.update_one(filter, newvalues)
            return json_util.dumps(userInfo)
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

    def createDispute(self, userData, headers):
        # check if the user exists
        user = db.userbaseData.find_one({"sessionId": headers['token']})
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
        user = db.userbaseData.find_one({"sessionId": headers['token']})

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
        providerUser = db.userbaseData.find_one({"listings.listingId": headers["listingId"]})
        return json_util.dumps(providerUser['email'])
    
    def getDisputes(self, headers):
        user = db.userbaseData.find_one({"sessionId": headers['token']})
        if user: 
            disputes = db.disputes.find()
            disputesList = list(disputes)  
            return json_util.dumps(disputesList)
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        
    # this function is never used along with its route
    def getRecentBookings(self, headers):
        # check if the user exists
        user = db.userbaseData.find_one({"email": headers['email']})
        # check if the listing exists
        userListings = user.get('listings')
        listingFound = [i for i in userListings if i["listingId"] == headers["listingId"]]

        listing = db.userbaseData.find_one(
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
        user = db.userbaseData.find_one({"sessionId": headers['token']})
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
                db.userbaseData.update_one({"email": user['email']}, {"$set": {"likedListings": likedListings}})
                providerUser = db.userbaseData.find_one({"listings.listingId": userData["listingId"]})
                userListings = providerUser.get('listings')
                for listing in userListings: 
                    if listing['listingId'] == userData['listingId']: 
                        listing['likes'] += 1
                db.userbaseData.update_one({"listings.listingId": userData["listingId"]}, {"$set": {"listings": userListings}})
                # Check if the listing exists
                listing = db.listingData.find_one({"listingId": userData["listingId"]})
                if listing: 
                    db.listingData.update_one({"_id": listing["_id"]}, {"$inc": {"likes": 1}})
                
                
            
            return jsonify({"message": "liked"}), 200
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    
    def dislike(self, userData, headers):
        user = db.userbaseData.find_one({"sessionId": headers['token']})
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
                db.userbaseData.update_one({"email": user['email']}, {"$set": {"likedListings": likedListings}})
                providerUser = db.userbaseData.find_one({"listings.listingId": userData["listingId"]})
                userListings = providerUser.get('listings')
                for listing in userListings: 
                    if listing['listingId'] == userData['listingId']: 
                        listing['likes'] -= 1
                        if listing['likes'] < 0: 
                            listing['likes'] = 0
                db.userbaseData.update_one({"listings.listingId": userData["listingId"]}, {"$set": {"listings": userListings}})
                # Check if the listing exists
                listing = db.listingData.find_one({"listingId": userData["listingId"]})
                if listing: 
                    if listing.get("likes", 0) > 0: 
                        db.listingData.update_one({"_id": listing["_id"]}, {"$inc": {"likes": -1}})
            return jsonify({"message": "disliked"}), 200
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    
    def timerPersistence(self, headers):
        # Find a user based on the provided session ID token
        user = db.userbaseData.find_one({"sessionId": headers['token']})
        # Check if the user exists
        if user:
            # Check if the user has a pre-booking time
            if user['preBookingTime'] != "":
                # Return pre-booking result with listing and car details
                return jsonify({"result": "prebooking", "listingId": user['currentListingId'], "listingNo": user['currentListingNo'], "carNumberPlate": user['carNumberPlate']}), 200
            # Check if there are recent bookings
            elif len(user['recentBookings']) != 0:
                # Check if the last booking is in the end booking phase
                if user['recentBookings'][-1]['inEndBookingPhase'] == True:
                    # Return end booking result with listing and timer details
                    return jsonify({"result": "endbooking", "listingId": user['currentListingId'], "listingNo": user['currentListingNo'], "timer": user['timer']}), 200
                # Check if the total time for the last booking is not set
                if user['recentBookings'][-1]['totalTime'] == "":
                    # Return booking result with listing details
                    return jsonify({"result": "booking", "listingId": user['currentListingId'], "listingNo": user['currentListingNo']}), 200
                else:
                    # Return result indicating no ongoing booking
                    return jsonify({"result": "none"}), 200
            else:
                # Return result indicating no ongoing booking
                return jsonify({"result": "none"}), 200
        # Return error response if the user does not exist
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402

    def saveTimer(self, userData, headers):
        # Find a user based on the provided session ID token
        user = db.userbaseData.find_one({"sessionId": headers['token']})
        # Check if the user exists
        if user:
            # Update the timer for the user
            db.userbaseData.update_one({"sessionId": headers['token']}, {"$set": {"timer": userData["timer"]}})
            # Check if the user has recent bookings
            if user['recentBookings']:
                # Get the index of the last booking
                lastBookingIndex = len(user['recentBookings']) - 1
                # Update the end booking phase flag for the last booking
                updateField = f"recentBookings.{lastBookingIndex}.inEndBookingPhase"
                db.userbaseData.update_one(
                    {"sessionId": headers['token']},
                    {"$set": {updateField: True}}
                )
            # Return a success response
            return json_util.dumps("Pass")
        # Return error response if the user does not exist
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
            
    def notifs(self, db, providerUser, address, date):
        # Create a notification message for the booked listing
        notificationMessage = f"Your listing {address} has been booked."
        # Check if the provider user exists
        if providerUser:
            # Push the notification message to the user's notifications array
            db.userbaseData.update_one(
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
            # Print a message indicating the provider user was not found
            print("Provider user not found.")
        
    def getNotifs(self, headers):
        # Find a user based on the provided session ID token
        user = db.userbaseData.find_one({"sessionId": headers['token']})
        # Check if the user exists
        if user:
            # Get the user's notifications
            notifications = user.get("notifications", [])
            # Return the notifications as a JSON response
            return json_util.dumps(notifications)
        # Return error response if the user does not exist
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        
    def makeReco(self, headers): 
        # Find a user based on the provided session ID token
        user = db.userbaseData.find_one({"sessionId": headers['token']})
        # Check if the user exists
        if user: 
            # Create a data frame of user interactions
            matrixDf = helper.makeDf(db)
            # Initialize the nearest neighbors model with cosine metric
            model = NearestNeighbors(n_neighbors=3, metric='cosine')
            model.fit(matrixDf)
            # Retrieve the user interaction data for the specified email
            userInteraction = matrixDf.loc[headers['email']]
            # Get the nearest neighbors for the user interaction data
            distances, indices = model.kneighbors([userInteraction])
            # Retrieve recommended car spaces
            recommendations = []
            # Get the index of the target user
            targetUserIdx = matrixDf.index.get_loc(headers['email'])
            for idx in indices.flatten():
                if idx != targetUserIdx:  # Exclude target user
                    recommendations.extend(matrixDf.iloc[idx][matrixDf.iloc[idx] > 0].index)

            # Remove duplicates and sort recommendations by interaction strength
            recommendations = list(set(recommendations))
            recommendations.sort(reverse=True)
            # Fetch listings from the database
            listingsDb = db.listingData.find({})
            for listing in listingsDb:
                # Add recommendations for listings found in the database
                if listing['listingId'] in recommendations:
                    recommendations.append(listing)
                    recommendations.remove(listing['listingId'])
            # Return the recommendations as a JSON response
            return json_util.dumps(recommendations)