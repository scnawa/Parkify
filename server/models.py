from copyreg import constructor
import json
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
import stripe

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
            "is_stripe_connected": False,
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
        if user:
            stripe.Customer.delete(user["payment_id"])
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
                    "quantity": userData['listings']['price'],
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
        provider_user = db.userbase_data.find_one({"listings.listing_id": userData["listings"]["listing_id"]})
        user_listings = provider_user.get('listings')


        if user:
                listing_no = userData["listings"]["listing_no"] 
                user_listings[listing_no].update({'is_active': "False"})
                filter = {"listings.listing_id": userData["listings"]["listing_id"]}
                newvalues = {"$set" : {'listings': user_listings}}
                db.userbase_data.update_one(filter, newvalues)
                return json_util.dumps("food")
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    

    # puts listing on page
    def release_listing(self, userData):
        # check if the user exists
        user = db.userbase_data.find_one({"email": userData['email']})
        # check if the listing exists
        provider_user = db.userbase_data.find_one({"listings.listing_id": userData["listings"]["listing_id"]})
        user_listings = provider_user.get('listings')


        if user:
                listing_no = userData["listings"]["listing_no"] 
                user_listings[listing_no].update({'is_active': "True"})
                filter = {"listings.listing_id": userData["listings"]["listing_id"]}
                newvalues = {"$set" : {'listings': user_listings}}
                db.userbase_data.update_one(filter, newvalues)
                return json_util.dumps("food")
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def getClosestListings(self, userData): 
        user = db.userbase_data.find_one({"email": userData['email']})
        if user: 
            latitude = 0
            longitude = 0
            if 'latitude' not in user.keys() or 'longitude' not in user.keys(): 
                latitude, longitude = geocoder.ip('me').latlng
            else:
                latitude = user["latitude"]
                longitude = user["longitude"]
            closestListings = []
            for listing in db.listing_data.find({}): 

                listing_lat = 0
                listing_long = 0
                if 'latitude' not in listing.keys() or 'longitude' not in listing.keys(): 
                    listing_lat, listing_long = geocoder.ip('me').latlng
                listing_lat = listing["latitude"]
                listing_long = listing["longitude"]

                if helper.calculateDistance(latitude, listing_lat, longitude, listing_long) <= 10: 
                    closestListings.append(listing)
            
            return json_util.dumps(closestListings)

        return jsonify({"Error": "User does not exist"})
      
    def create_booking(self, userData):
        # check if the user exists
        user = db.userbase_data.find_one({"email": userData['email']})
        # check if the listing exists
        provider_user = db.userbase_data.find_one({"listings.listing_id": userData["listings"]["listing_id"]})
        user_listings = provider_user.get('listings')
        booking_list = user["recentBookings"]

        booking = {
                    "address": userData['listings']['address'],
                    "listing_id": userData["listings"]["listing_id"],
                    "recentbooking_no": len(user["recentBookings"]),
                    "end_price": "",
                    "feedback": "",
                    "end_image_url": "", 
                    "total_time": "",
                    "is_paid": False,
                    "payment_id": "",
        }

        bookingFound = [i for i in booking_list if i["listing_id"] == userData["listings"]["listing_id"]]

        if user:
            listing_no = userData["listings"]["listing_no"]
            if not bookingFound:
                booking_list.append(booking)
            user_listings[listing_no].update({'is_active': "False"})
            filter = {'email': user['email']}
            newvalues = {"$set" : {'recentBookings': booking_list}}
            db.userbase_data.update_one(filter, newvalues)
            filter = {"listings.listing_id": userData["listings"]["listing_id"]}
            newvalues = {"$set" : {'listings': user_listings}}
            db.userbase_data.update_one(filter, newvalues)
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
    
    def end_booking(self, userData):
        # check if the user exists
        user = db.userbase_data.find_one({"email": userData['email']})
        # check if the listing exists
        provider_user = db.userbase_data.find_one({"listings.listing_id": userData["booking"]["listing_id"]})
        user_listings = provider_user.get('listings')

        booking_list = user["recentBookings"]


        if user:
            listing_no = userData["listings"]["listing_no"]
            recentbooking_no = userData["booking"]["recentbooking_no"]
            end_price = int(userData["booking"]["total_time"]) * int(userData['listings']['price'])
            booking = {
                    "end_price": end_price,
                    "feedback": userData["booking"]["feedback"],
                    "end_image_url": userData["booking"]["end_image_url"], 
                    "total_time": userData["booking"]["total_time"]
            }
            paymentMethods = stripe.PaymentMethod.list(
                customer=user['payment_id'],
            )
            if len(paymentMethods.data) <= 0:
                return jsonify({"type": "payment", "error": "payment failed"}), 402

            paymentMethodId = stripe.PaymentMethod.list[0].id
            try:
                stripe.PaymentIntent.create(
                    amount=end_price,
                    currency='AUD',
                    customer=user['payment_id'],
                    payment_method=paymentMethodId,
                    error_on_requires_action=True,
                    confirm=True,
                )
                stripe.Transfer.create(
                    amount=int(end_price * 0.85),
                    currency="AUD",
                    destination=provider_user['payOut_id'],
                )

            # err handling from https://docs.stripe.com/payments/without-card-authentication
            except stripe.error.CardError as e:
                return json.dumps({'error': e.user_message}), 200


            user_listings[listing_no].update({'is_active': "True"})
            booking_list[recentbooking_no].update(booking)
            filter = {'email': user['email']}
            newvalues = {"$set" : {'recentBookings': booking_list}}
            db.userbase_data.update_one(filter, newvalues)
            filter = {"listings.listing_id": userData["booking"]["listing_id"]}
            newvalues = {"$set" : {'listings': user_listings}}
            db.userbase_data.update_one(filter, newvalues)
            return json_util.dumps(end_price)
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    

    def updateListingDatabase(self): 
        user_database = db.userbase_data.find({})
        
        listings = []
        for user in user_database: 
            if 'listings' in user: 
                for listing in user['listings']: 
                    listings.append(listing)
        for listing in listings: 
            temp = db.listing_data.find_one({"address": listing["address"]}) 
            if temp is None: 
                db.listing_data.insert_one(listing)

    def filterByPrice(self, userData): 
        nearbyListings = json_util.loads(User.getClosestListings(self,userData))
        if userData['order'] == "ascending": 
            return json_util.dumps(sorted(nearbyListings, key = lambda x: int(x["price"])))
        else: 
            return json_util.dumps(sorted(nearbyListings, key = lambda x:int(x["price"]), reverse = True))
        
    def searchForSpace(self, userData): 
        listings = db.listing_data.find({})
        trie = Trie()
        for listing in listings: 
            print(listing['address'].lower())
            trie[listing['address'].lower()] = True
        
        #searchResults = trie.values(userData['query'])
        listingResults = []
        for searchResult in trie.keys(): 
            listingResults.append(db.listing_data.find({"address": searchResult}))
        return json_util.dumps(listingResults)

    # booking id
    #
    def addPaymentMethod(self, userData):
        user = db.userbase_data.find_one({"email": userData['email']})
        if user:
            intent=stripe.SetupIntent.create(
                customer=user['payment_id'],
                automatic_payment_methods={"enabled": True},
            )
            return jsonify({"client_secret":intent.client_secret})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    # since stripe only provide account link for registered company
    # i can only use the testing customer key to demostrate the flow
    # no real detail is added
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
            return jsonify({"stripe_connected":user["is_stripe_connected"]})
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


