from copyreg import constructor
import json
import math
from operator import truediv
from pickle import FALSE, TRUE
import this
from unittest import result
from flask import Flask, jsonify, request, session, redirect
from jinja2 import Undefined
from passlib.hash import pbkdf2_sha256
import uuid
import helper
from requests import delete
from app import db
import bson.json_util as json_util
import boto3
import urllib.request
from PIL import Image
import googlemaps
from operator import length_hint
import pandas as pd
import sys
import geocoder
from pygtrie import Trie
import re
import stripe
import datetime

class User: 
    def signup(self, userData): 
        latitude, longitude = geocoder.ip('me').latlng
        user = { 
            "username": userData['username'], 
            "password": userData['password'],
            "listings": userData["listings"], # one list of dictionaries of different listings
            "creditCards" : userData['creditCards'], 
            "email" : userData["email"], 
            "session_id": [],
            "recentBookings": [],
            "isVerified" : False,
            "latitude": latitude,
            "longitude": longitude,
            "payment_id": "",
            "payOut_id": "",
            "default_payment_id":"",
            "is_stripe_connected": False,
            "pre_booking_time": ""
        }
        user['password'] = pbkdf2_sha256.encrypt(
            user['password'])
        #user = db.userbase_data.find_one(userData[])
        if db.userbase_data.find_one({"email": userData['email']}): 
            return jsonify({'type': "email", "error": "Email already in use"}), 400
        try:

            user_payment = stripe.Customer.create(
                name = userData['username'],
                email = userData["email"],
            )
            user['payment_id'] = user_payment.id
            user_payOut = stripe.Account.create(
                type="custom",
                country="AU",
                email=userData["email"],
                capabilities={
                    "card_payments": {"requested": True},
                    "transfers": {"requested": True},
                    "au_becs_debit_payments": {"requested": True},
                },
            )
            user['payOut_id'] = user_payOut.id

 
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
            "session_id": [],
            "isVerified" : True,
            "isAdmin": True
        }
        user['password'] = pbkdf2_sha256.encrypt(
            user['password'])
        #user = db.userbase_data.find_one(userData[])
        if db.userbase_data.find_one({"email": userData['email']}): 
            return jsonify({'type': "email", "error": "Email already in use"}), 400 
        if db.userbase_data.insert_one(user):
            # debugging 
            return json_util.dumps({"type": "SUCCESS"})
        

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
                while user['session_id'].count(currentSessionID) > 0:
                        currentSessionID = uuid.uuid4().hex
                # Add session id for the user
                sessionID_list = user["session_id"]
                sessionID_list.append(currentSessionID)
                # Updating Session ID and adding new Session ID per Device
                #user["currentSessionID"] = currentSessionID
                db.userbase_data.update_many({'email': user['email']}, {"$set": {"session_id": sessionID_list},})
                    # Add current session id to the user
                #if "isAdmin" in user: 
                #    if user['isAdmin'] == True: 
                #        return jsonify({"admin": True}, {"adminInfo" : json_util.dumps(user)})

                return json_util.dumps(user)
            else:
                return jsonify({"type": "password", "error": "Password Is Incorrect"}), 401

        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402


    def logout(self, userData): 
        user = db.userbase_data.find_one({"email": userData['email']})
        if user: 
            if not user['session_id'].count(userData['currentSessionID']) > 0: 
                return jsonify({'error': "Session Does Not Exist"}), 403
            user['session_id'].remove(userData['currentSessionID'])
            db.userbase_data.update_one({"email": userData['email']}, {
                                        "$set": {"session_id": user['session_id']}})
            return jsonify({'status': "PASS"}), 200
        return jsonify({"type": "username", "error": "User Does Not Exist"}), 402
    

    def delete_account(self, userData): 
        user = db.userbase_data.find_one({"email": userData['email']})
        
        # deleting the same listing within the listings DB so ensure syncronised listings across DBs
        listing_ids = [listing['listing_id'] for listing in user.get('listings', [])]
        if listing_ids:
            for listing_id in listing_ids:
                db.listing_data.delete_one({"listing_id": listing_id})

        if user:
            if user["payment_id"] != "":
                stripe.Customer.delete(user["payment_id"])
            if user["payOut_id"] != "":
                stripe.Account.delete(user["payOut_id"])
            db.userbase_data.delete_one(user)
            return jsonify({'status': "PASS"}), 200
        return jsonify({"type": "username", "error": "User Does Not Exist"}), 402 
    
    def resetPass(self, userData): 
        user = db.userbase_data.find_one({"email": userData['email']})
        if user: 
            db.userbase_data.update_one({"email": userData['email']}, {"$set": {"password": pbkdf2_sha256.encrypt(user['password'])}})
            return jsonify({'status': "PASS"}), 200
        return jsonify({"type": "username", "error": "User Does Not Exist"}), 402
    
    
    def create_listing(self, userData):
        # check if the user exists
        user = db.userbase_data.find_one({"email": userData['email']})
        if user:

            listing = {
                "listing_id": uuid.uuid4().hex,
                "listing_no": len(user['listings']),
                "address": userData['listings']['address'],
                "price": userData['listings']['price'],
                "quantity": userData['listings']['quantity'],
                "details": userData['listings']['details'],
                "restrictions": userData['listings']['restrictions'],
                "image_url": userData['listings']['image_url'], 
                "start_date": "",
                "end_date": "",
                "is_active": 'False',
                "latitude": helper.calcLatLong(userData['listings']['address'])[0],
                "longitude": helper.calcLatLong(userData['listings']['address'])[1]
            }

            user_listings = user['listings']
            user_listings.append(listing)
            filter = {'email': user['email']}
            newvalues = {"$set" : {'listings': user_listings}}
            db.userbase_data.update_one(filter, newvalues)
            db.listing_data.insert_one(listing)

            return json_util.dumps(listing["listing_id"])
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def deactivate_listing(self, userData, headers):
        # check if the user exists
        user = db.userbase_data.find_one({"email": headers['email']})
        # check if the listing exists
        user_listings = user.get('listings')
        listingFound = [i for i in user_listings if i["listing_id"] == userData["listings"]["listing_id"]]

        if user:

            if listingFound:
                listing_no = userData["listings"]["listing_no"] 
                user_listings[listing_no].update({'start_date': "", 'end_date': "", 'is_active': "False"})
                filter = {'email': user['email']}
                newvalues = {"$set" : {'listings': user_listings}}
                db.userbase_data.update_one(filter, newvalues)
        
                # updating the same listing within the listings DB so ensure syncronised listings across DBs
                listing_id = userData["listings"]["listing_id"] 
                filter = {'listing_id': listing_id}
                newvalues = {
                    "$set": {
                        'start_date': "",
                        'end_date': "",
                        'is_active': "False"
                    }
                }
                db.listing_data.update_one(filter, newvalues)

                return json_util.dumps(user)
            return jsonify({"type": "listing_id", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def activate_listing(self, userData, headers):
        # check if the user exists
        user = db.userbase_data.find_one({"email": headers['email']})
        # check if the listing exists
        user_listings = user.get('listings')
        listingFound = [i for i in user_listings if i["listing_id"] == userData["listings"]["listing_id"]]

        if user:
            if listingFound:
                
                listing_no = userData["listings"]["listing_no"] 
                user_listings[listing_no].update({'start_date': userData['listings']['start_date'], 'end_date': userData['listings']['end_date'], 'is_active': "True"})
                filter = {'email': user['email']}
                newvalues = {"$set" : {'listings': user_listings}}
                db.userbase_data.update_one(filter, newvalues)

                # updating the same listing within the listings DB so ensure syncronised listings across DBs
                listing_id = userData["listings"]["listing_id"] 
                filter = {'listing_id': listing_id}
                newvalues = {
                    "$set": {
                        'start_date': userData['listings']['start_date'],
                        'end_date': userData['listings']['end_date'],
                        'is_active': "True"
                    }
                }
                db.listing_data.update_one(filter, newvalues)

                return json_util.dumps(user)
            return jsonify({"type": "listing_id", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def delete_listing(self, userData, headers):
        # check if the user exists
        user = db.userbase_data.find_one({"email": headers['email']})
        # check if the listing exists
        user_listings = user.get('listings')
        listingFound = [i for i in user_listings if i["listing_id"] == userData["listings"]["listing_id"]]
        if user: 
            if listingFound: 
                listing_no = userData["listings"]["listing_no"]
                listing_length = len(user['listings'])
                user_listings.remove(user_listings[listing_no])
                listing_length = len(user['listings'])
                while listing_no < listing_length:
                    user_listings[listing_no].update({'listing_no': user_listings[listing_no]['listing_no'] - 1})
                    listing_no += 1
                    
                filter = {'email': user['email']}
                newvalues = {"$set" : {'listings': user_listings}}
                db.userbase_data.update_one(filter, newvalues)

                # updating the same listing within the listings DB so ensure syncronised listings across DBs
                listing_id = userData["listings"]["listing_id"]
                filter = {'listing_id': listing_id}
                db.listing_data.delete_one(filter)

                return json_util.dumps(user_listings)
            return jsonify({"type": "listing_id", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

    def update_listing(self, userData, headers):
        # check if the user exists
        user = db.userbase_data.find_one({"email": headers['email']})
        # check if the listing exists
        user_listings = user.get('listings')
        listingFound = [i for i in user_listings if i["listing_id"] == userData["listings"]["listing_id"]]
        if user:
            if listingFound:

                listing = {
                    "address": userData['listings']['address'],
                    "price": userData['listings']['price'],
                    "quantity": userData['listings']['quantity'], 
                    "details": userData['listings']['details'],
                    "restrictions": userData['listings']['restrictions'],
                    "image_url": userData['listings']['image_url'], 
                    "start_date": userData['listings']['start_date'],
                    "end_date": userData['listings']['end_date'],
                    "is_active": userData['listings']['is_active']  
                }
                listing_no = userData["listings"]["listing_no"]
                user_listings = user['listings']
                user_listings[listing_no].update(listing)
                filter = {'email': user['email']}
                newvalues = {"$set" : {'listings': user_listings}}
                db.userbase_data.update_one(filter, newvalues)

                # updating the same listing within the listings DB so ensure syncronised listings across DBs
                listing_id = userData['listings']['listing_id']
                filter = {'listing_id': listing_id}
                newvalues = {"$set": listing}
                db.listing_data.update_one(filter, newvalues)


                return json_util.dumps(user)
            return jsonify({"type": "listing_id", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def get_listings(self, headers):
        # check if the user exists
        user = db.userbase_data.find_one({"email": headers['email']})
        if user: 
            return json_util.dumps(user['listings'])
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402

    def get_listing(self, headers):
        # check if the user exists
        user = db.userbase_data.find_one({"email": headers['email']})
        # check if the listing exists
        user_listings = user.get('listings')
        listingFound = [i for i in user_listings if i["listing_id"] == headers["listings"]["listing_id"]]

        if user:
            if listingFound:
                listing_no = headers["listings"]["listing_no"] 
                return json_util.dumps(user_listings[listing_no])
            return jsonify({"type": "listing_id", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    

    def get_all_listings(self): 
        
        all_listings = db.userbase_data.find({},{"_id":0,'listings':1})
        all_active_listings = []
        for listing_dict in all_listings: 
            if bool(listing_dict):
                for listing in listing_dict['listings']:
                    if listing['is_active'] == "True":  
                    
                        all_active_listings.append(listing)

        return json_util.dumps(all_active_listings)


    def getUserInfo(self, userData): 
        user = db.userbase_data.find_one({"email": userData['email']})
        if user:
            return json_util.dumps(user)
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402

    # takes listing off page
    def hold_listing(self, userData):
        
        # check if the user exists
        user = db.userbase_data.find_one({"email": userData['email']})
        # check if the listing exists
        provider_user = db.userbase_data.find_one({"listings.listing_id": userData["listingId"]})
        user_listings = provider_user.get('listings')

        now = datetime.datetime.now()
        start_time = now.strftime("%H:%M:%S")


        if user:
                db.userbase_data.update_one({"email": userData['email']}, {"$set": {"pre_booking_time": start_time}})
                listing_no = userData["listingNo"] 
                user_listings[listing_no].update({'is_active': "False"})
                filter = {"listings.listing_id": userData["listingId"]}
                newvalues = {"$set" : {'listings': user_listings}}
                db.userbase_data.update_one(filter, newvalues)
                filter = {"listing_id": userData["listingId"]}
                newvalues = {"$set" : user_listings[listing_no]}
                db.listing_data.update_one(filter, newvalues)
                return json_util.dumps("Pass")
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    

    # puts listing on page
    def release_listing(self, userData):
        # print(userData)
        # check if the user exists
        user = db.userbase_data.find_one({"email": userData['email']})
        # check if the listing exists
        provider_user = db.userbase_data.find_one({"listings.listing_id": userData["listingId"]})
        user_listings = provider_user.get('listings')


        if user:
                listing_no = userData["listingNo"] 
                user_listings[listing_no].update({'is_active': "True"})
                filter = {"listings.listing_id": userData["listingId"]}
                newvalues = {"$set" : {'listings': user_listings}}
                db.userbase_data.update_one(filter, newvalues)
                filter = {"listing_id": userData["listingId"]}
                newvalues = {"$set" : user_listings[listing_no]}
                db.listing_data.update_one(filter, newvalues)
                return json_util.dumps("Pass")
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def getClosestListings(self, headers, distance): 
        user = db.userbase_data.find_one({"email": headers['email']})
        if user: 
            latitude = 0
            longitude = 0
            if 'latitude' not in user.keys() or 'longitude' not in user.keys(): 
                latitude, longitude = geocoder.ip('me').latlng
            else:
                latitude = user["latitude"]
                longitude = user["longitude"]
            closestListings = []
            print(latitude)
            print(longitude)
            for listing in db.listing_data.find({}): 
                print(listing)
                listing_lat = 0
                listing_long = 0
                if 'latitude' not in listing.keys() or 'longitude' not in listing.keys(): 
                    listing_lat, listing_long = helper.calcLatLong(listing['address'])
                else:
                    listing_lat = listing["latitude"]
                    listing_long = listing["longitude"]

                if helper.calculateDistance(latitude, listing_lat, longitude, listing_long) <= distance and listing['is_active'] == "True": 
                    closestListings.append(listing)
            print(closestListings)
            return json_util.dumps(closestListings)

        return jsonify({"Error": "User does not exist"})
      
    def create_booking(self, userData):
        # check if the user exists
        # print(userData)
        user = db.userbase_data.find_one({"email": userData['email']})
        # check if the listing exists
        provider_user = db.userbase_data.find_one({"listings.listing_id": userData["listingId"]})
        user_listings = provider_user.get('listings')
        booking_list = user["recentBookings"]

        listing_no = userData["listingNo"]

        now = datetime.datetime.now()
        start_time = now.strftime("%H:%M:%S")

        booking = {
                    "address": user_listings[listing_no]["address"],
                    "listing_id": userData["listingId"],
                    "recentbooking_no": len(user["recentBookings"]),
                    "start_time": start_time,
                    "end_price": "",
                    "feedback": "",
                    "end_image_url": "", 
                    "total_time": "",
                    "is_paid": False,
                    "payment_id": "",
        }

        bookingFound = [i for i in booking_list if i["listing_id"] == userData["listingId"]]

        if user:
            if not bookingFound:
                booking_list.append(booking)
            user_listings[listing_no].update({'is_active': "False"})
            filter = {'email': user['email']}
            newvalues = {"$set" : {'recentBookings': booking_list}}
            db.userbase_data.update_one(filter, newvalues)
            filter = {"listings.listing_id": userData["listingId"]}
            newvalues = {"$set" : {'listings': user_listings}}
            db.userbase_data.update_one(filter, newvalues)
            filter = {"listing_id": userData["listingId"]}
            newvalues = {"$set" : user_listings[listing_no]}
            db.listing_data.update_one(filter, newvalues)
            return json_util.dumps(user["recentBookings"]) # HOW IS THIS WORKING EVEN THOUGH IM NOT UPDATING USER
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def remove_recentbooking(self, userData):
        # check if the user exists
        user = db.userbase_data.find_one({"email": userData['email']})
        # check if the listing exists
        booking_list = user["recentBookings"]

        if user:
            recentBooking_no = userData["booking"]["recentbooking_no"]
            recentBooking_length = len(user['recentBookings'])
            booking_list.remove(booking_list[recentBooking_no])
            recentBooking_length = len(user['recentBookings'])
            while recentBooking_no < recentBooking_length:
                booking_list[recentBooking_no].update({'recentbooking_no': booking_list[recentBooking_no]['recentbooking_no'] - 1})
                recentBooking_no += 1                
            filter = {'email': user['email']}
            newvalues = {"$set" : {'recentBookings': booking_list}}
            db.userbase_data.update_one(filter, newvalues)
            return json_util.dumps(user["recentBookings"]) # HOW IS THIS WORKING EVEN THOUGH IM NOT UPDATING USER
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def end_booking(self, headers, userData):
        # check if the user exists
        user = db.userbase_data.find_one({"email": headers['email']})
        # check if the listing exists
        provider_user = db.userbase_data.find_one({"listings.listing_id": userData["listingId"]})
        user_listings = provider_user.get('listings')
        booking_list = user["recentBookings"]
        if user:
            listing_no = userData["listingNo"]
            end_price = math.ceil(int(userData["totalTime"])/3600) * int(user_listings[listing_no]["price"])
            discounted_price = self.apply_promo_code(end_price, userData["promoCode"])
            now = datetime.datetime.now()
            start_time = now.strftime("%H:%M:%S")
            booking = {
                    "start_time": start_time,
                    "end_price": discounted_price,
                    "feedback": userData["feedback"],
                    "end_image_url": userData["endImageUrl"], 
                    "total_time": userData["totalTime"]
            }
            paymentMethods = stripe.PaymentMethod.list(
                customer=user['payment_id'],
                limit=3
            )
            if len(paymentMethods.data) <= 0 or user['default_payment_id'] == "":
                return jsonify({"type": "payment", "error": "payment failed"}), 402
 
            paymentMethodId = user['default_payment_id']
            try:
                stripe.PaymentIntent.create(
                    amount=int(discounted_price * 100),
                    currency='AUD',
                    customer=user['payment_id'],
                    payment_method=paymentMethodId,
                    off_session=True,
                    confirm=True,
                )
                stripe.Transfer.create(
                    amount=int(discounted_price * 0.85 * 100),
                    currency="AUD",
                    destination=provider_user['payOut_id'],
                )
                helper.sendConfirmationEmail(user['email'], user['username'], discounted_price)
            # err handling from https://docs.stripe.com/payments/without-card-authentication
            except stripe.error.CardError as e:
                return json.dumps({'error': e.user_message}), 200

            user_listings[listing_no].update({'is_active': "True"})
            booking_list[-1].update(booking)
            filter = {'email': user['email']}
            newvalues = {"$set" : {'recentBookings': booking_list}}
            db.userbase_data.update_one(filter, newvalues)
            filter = {"listings.listing_id": userData["listingId"]}
            newvalues = {"$set" : {'listings': user_listings}}
            db.userbase_data.update_one(filter, newvalues)
            filter = {"listing_id": userData["listingId"]}
            newvalues = {"$set" : user_listings[listing_no]}
            db.listing_data.update_one(filter, newvalues)
            return json_util.dumps(discounted_price)
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    """ def testPay(self, userData):
        paymentMethods = stripe.PaymentMethod.list(
            customer="cus_PpxZVOFpOPxNHM",
            limit=3
        )
        if len(paymentMethods.data) <= 0:
            return jsonify({"type": "payment", "error": "payment failed"}), 402
        paymentMethodId = paymentMethods.data[0].id
        try:
            stripe.PaymentIntent.create(
            amount=200*100,
            currency='AUD',
            customer="cus_PpxZVOFpOPxNHM",
            payment_method=paymentMethodId,
            off_session=True,

            # error_on_requires_action=True,
            confirm=True,
            )
            stripe.Transfer.create(
                amount=int(200 * 0.85 * 100),
                currency="AUD",
                destination="acct_1P0HeLPa3wzFl1vn",
            )

        # err handling from https://docs.stripe.com/payments/without-card-authentication
        except stripe.error.CardError as e:    
            return json.dumps({'error': e.user_message}), 400
        return json_util.dumps({"status":"success"}) """



    #def updateListingDatabase(self): 
    #    user_database = db.userbase_data.find({})
    #    
    #    listings = []
    #    for user in user_database: 
    #        if 'listings' in user: 
    #            for listing in user['listings']: 
    #                listings.append(listing)
    #    for listing in listings: 
    #        temp = db.listing_data.find_one({"address": listing["address"]}) 
    #        if temp is None: 
    #            db.listing_data.insert_one(listing)

    def filterByPriceAndDistance(self, headers): 
        order = headers["order"]
        if headers["distance"] == "":
            distance = 10000000
        else:
            distance = int(headers["distance"])
        nearbyListings = json_util.loads(User.getClosestListings(self,headers,distance))

        if order == "":
            return json_util.dumps(nearbyListings)

        if order == "ascending": 
            return json_util.dumps(sorted(nearbyListings, key = lambda x: int(x["price"])))
        else: 
            return json_util.dumps(sorted(nearbyListings, key = lambda x:int(x["price"]), reverse = True))
        
    def searchForSpace(self, userData): 
        listings = db.listing_data.find({})
        listingResults = []
        
        # regex
        pattern = re.compile(re.escape(userData['query']), re.IGNORECASE)
        
        for listing in listings: 
            if pattern.search(listing['address']) and listing['is_active'] == "True":
                listingResults.append(listing) 
        
        return json_util.dumps(listingResults)

    
    def addPaymentMethod(self, userData):
        user = db.userbase_data.find_one({"email": userData['email']})
        if user:
            intent=stripe.SetupIntent.create(
                customer=user['payment_id'],
                automatic_payment_methods={"enabled": True},
                # return_url="https://localhost:3000/paymentAddedSuccess",
                # confirm=True
            )
            return jsonify({"client_secret":intent.client_secret})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    
    # https://docs.stripe.com/connect/testing#creating-accounts
    def providerDetails(self, userData):
        user = db.userbase_data.find_one({"email": userData['email']})
        if user:
            typeOfLink = "account_update" if user["is_stripe_connected"] else "account_onboarding"
            link = stripe.AccountLink.create(
                account=user['payOut_id'],
                refresh_url="https://localhost:3000/providerDetailsExpired",
                return_url="https://localhost:3000/providerDetailsReturn",
                type=typeOfLink,
                collection_options={"fields": "eventually_due"},
            )
            if user["is_stripe_connected"]  == False:
                filter = {'email': user['email']}
                newvalues = {"$set" : {'is_stripe_connected': True}}
                db.userbase_data.update_one(filter, newvalues)
            return jsonify({"account_link":link.url})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    def userIsprovider(self,userData):
        user = db.userbase_data.find_one({"email": userData['email']})

        if user:
            account = stripe.Account.retrieve(user['payOut_id'])
            print(account)
            if not account.payouts_enabled:
                return jsonify({"type": "User", "error": "Please provide or update provider details"}), 402

            return jsonify({"stripe_connected":user["is_stripe_connected"]})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    def allCardList(self, userData):
        user = db.userbase_data.find_one({"email": userData['email']})

        if user:
            respond = stripe.PaymentMethod.list(
                customer=user['payment_id'],
            )
            data = respond.data
            if (len(data) != 0) and (user['default_payment_id'] == ""):
                user['default_payment_id'] = data[0].id
                filter = {'email': user['email']}
                newvalues = {"$set" : {'default_payment_id': data[0].id}}
                db.userbase_data.update_one(filter, newvalues)


            return jsonify({"default_payment": user['default_payment_id'], "payments": data, })
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    def setDefaultCard(self, headers, userData):
        user = db.userbase_data.find_one({"email": headers['email']})
        if user:
            try:

                card_id = userData['default_card']
                respond = stripe.Customer.retrieve_payment_method(
                    user['payment_id'],
                    card_id,
                )
                user['default_payment_id'] = card_id
                filter = {'email': user['email']}
                newvalues = {"$set" : {'default_payment_id': card_id}}
                db.userbase_data.update_one(filter, newvalues)
            except stripe.error as e:    
                return json.dumps({'error': e.user_message}), 400
            return jsonify({"default_payment": user['default_payment_id']})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    def removeCard(self, headers, userData):
        user = db.userbase_data.find_one({"email": headers['email']})
        if user:
            try:
                card_id = userData['card_id']
                respond = stripe.PaymentMethod.list(
                    customer=user['payment_id'],
                )
                data = respond.data
                match_data = [(x) for x in data if x.id == card_id]
                if len(match_data) == 0:
                    return json.dumps({'error': "No matched card_id"}), 400
                other_cards = [(x) for x in data if x.id != card_id]
                stripe.PaymentMethod.detach(card_id)
                if user['default_payment_id'] == card_id:
                    new_default = ""
                    if  len(other_cards) != 0:
                        new_default = other_cards[0].id
                    user['default_payment_id'] = new_default
                    filter = {'email': user['email']}
                    newvalues = {"$set" : {'default_payment_id': new_default}}
                    db.userbase_data.update_one(filter, newvalues)
            except stripe.error as e:    
                return json.dumps({'error': e.user_message}), 400
            return jsonify({"default_payment": user['default_payment_id'], "cards":other_cards})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    def getDefaultCard(self, userData):
        user = db.userbase_data.find_one({"email": userData['email']})
        if user:
            try:
                if user['default_payment_id'] != "":
                    return jsonify({"default_payment": user['default_payment_id']})
                respond = stripe.PaymentMethod.list(
                    customer=user['payment_id'],
                )
                data = respond.data
                if (len(data) != 0) and (user['default_payment_id'] == ""):
                    user['default_payment_id'] = data[0].id
                    filter = {'email': user['email']}
                    newvalues = {"$set" : {'default_payment_id': data[0].id}}
                    db.userbase_data.update_one(filter, newvalues)
                    return jsonify({"default_payment": user['default_payment_id']})
                return jsonify({"type": "User", "error": "User Does Not have a default payment method"}), 402

            except stripe.error as e:    
                return json.dumps({'error': e.user_message}), 400
            return jsonify({"default_payment": user['default_payment_id'], "cards":other_cards})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402

    # def pay_booking(self, userData): 
    #     user = db.userbase_data.find_one({"email": userData['email']})
    #     if user:
    #         booking_list = user["recentBookings"]
    #         provider_user = db.userbase_data.find_one({"listings.listing_id": userData["listings"]["listing_id"]})
    #         booking = booking_list[userData.bookingId]
    #         price = booking[end_price]
    #         listing_id = booking[listing_id]
    #         listing = db.userbase_data.find_one({"listings.listing_id": listing_id})
    #         payment = stripe.PaymentIntent.create(
    #             amount=price,
    #             currency="aud",
    #             automatic_payment_methods={"enabled": True},
    #             customer=user[payment_id]
    #         )
    #         respond = {"price":price, "address": listing.address, "client_secret":payment.client_secret }
    #         return json_util.dumps(respond)


    def get_specific_listing(self, headers):
        # user should be able to view listing before login in
        # check if the user exists
        user = db.userbase_data.find_one({"email": headers['email']})
        # check if the listing exists
        provider_user = db.listing_data.find_one({"listing_id": headers["listingId"]})
        return json_util.dumps(provider_user)

    def get_pre_booking_time(self, headers):
        # check if the user exists
        user = db.userbase_data.find_one({"email": headers['email']})
        return json_util.dumps(user["pre_booking_time"])
    
    def get_booking_time(self, headers):
        # check if the user exists
        user = db.userbase_data.find_one({"email": headers['email']})
        booking_list = user["recentBookings"]

        return json_util.dumps(booking_list[-1]["start_time"])
    
    def apply_promo_code(self, booking_price, promo_code):

            if promo_code and promo_code.isalnum():
                #the last two digits 
                
                with open("/home/sam/comp3900/capstone-project-3900w09a_parkify/server/promoCodes.txt", "r") as file: 
                    for promo in file: 
                        if promo_code == promo.strip():
                            print(promo_code[-2:])
                            discount_percentage = int(promo_code[-2:]) 
                            discounted_price = booking_price - (booking_price * discount_percentage / 100)
                            return discounted_price
                return booking_price
            else:
                return booking_price