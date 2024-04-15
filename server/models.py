from copyreg import constructor
import json
import math
from operator import truediv
from pickle import FALSE, TRUE
import this
import threading
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
from datetime import date
import time
import math

class User:
    timer = threading.Timer(0, 'hello')
    #def __init__(self):
     #   self.timer = threading.Thread()
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
            "pre_booking_time": "",
            "current_listing_id": "",
            "current_listing_no": "",
            "profile_picture": "", 
            "liked_listings": [],
            "carNumberPlate": "",
            "timer": "",

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
            "isAdmin": True,
            "disputes": [],
            "profile_picture": "", 
        }
        user['password'] = pbkdf2_sha256.encrypt(
            user['password'])
        #user = db.userbase_data.find_one(userData[])
        if db.userbase_data.find_one({"email": userData['email']}): 
            return jsonify({'type': "email", "error": "Email already in use"}), 400 
        if db.userbase_data.insert_one(user):
            # debugging 
            return json_util.dumps({"type": "SUCCESS"})

    def checkAdmin(self, headers): 
        user = db.userbase_data.find_one({"session_id": headers['token']})
        if user:
            is_admin = user.get('isAdmin', False)
            return jsonify({'isAdmin': is_admin})
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
        user = db.userbase_data.find_one({"session_id": userData['token']})
        if user: 
            if not user['session_id'].count(userData['currentSessionID']) > 0: 
                return jsonify({'error': "Session Does Not Exist"}), 403
            user['session_id'].remove(userData['currentSessionID'])
            db.userbase_data.update_one({"email": user['email']}, {
                                        "$set": {"session_id": user['session_id']}})
            return jsonify({'status': "PASS"}), 200
        return jsonify({"type": "username", "error": "User Does Not Exist"}), 402
    

    def delete_account(self, userData): 
        requester = db.userbase_data.find_one({"session_id": userData['token']})
        userInfo = db.userbase_data.find_one({"email": userData['email']})
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        # deleting the same listing within the listings DB so ensure syncronised listings across DBs
        listing_ids = [listing['listing_id'] for listing in userInfo.get('listings', [])]
        if listing_ids:
            for listing_id in listing_ids:
                db.listing_data.delete_one({"listing_id": listing_id})
        is_admin = userInfo.get('isAdmin', False)
        if not is_admin:
            if userInfo["payment_id"] != "":
                stripe.Customer.delete(userInfo["payment_id"])
            if userInfo["payOut_id"] != "":
                stripe.Account.delete(userInfo["payOut_id"])
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
    
    
    def create_listing(self, userData):
        # check if the user exists
        # user = db.userbase_data.find_one({"email": userData['email']})
        requester = db.userbase_data.find_one({"session_id": userData['token']})
        userInfo = db.userbase_data.find_one({"email": userData['email']})
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        if userInfo:

            listing = {
                "listing_id": uuid.uuid4().hex,
                "listing_no": len(userInfo['listings']),
                "address": userData['listings']['address'],
                "price": userData['listings']['price'],
                "quantity": userData['listings']['quantity'],
                "details": userData['listings']['details'],
                "restrictions": userData['listings']['restrictions'],
                "image_url": userData['listings']['image_url'], 
                "images": userData['listings']['images'],
                "start_date": "",
                "end_date": "",
                "is_active": 'False',
                "latitude": float(userData['listings']['lat']),
                "longitude": float(userData['listings']['lon']),
                "recentBookings": [], 
                "likes": 0
            }

            user_listings = userInfo['listings']
            user_listings.append(listing)
            filter = {'email': userInfo['email']}
            newvalues = {"$set" : {'listings': user_listings}}
            db.userbase_data.update_one(filter, newvalues)
            db.listing_data.insert_one(listing)

            return json_util.dumps(listing["listing_id"])
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def deactivate_listing(self, userData, headers):
        requester = db.userbase_data.find_one({"session_id": headers['token']})
        userInfo = db.userbase_data.find_one({"email": headers['email']})
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        # check if the listing exists
        user_listings = userInfo.get('listings')
        listingFound = [i for i in user_listings if i["listing_id"] == userData["listings"]["listing_id"]]

        if userInfo:

            if listingFound:
                listing_no = userData["listings"]["listing_no"] 
                user_listings[listing_no].update({'start_date': "", 'end_date': "", 'is_active': "False"})
                filter = {'email': userInfo['email']}
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

                return json_util.dumps(userInfo)
            return jsonify({"type": "listing_id", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def activate_listing(self, userData, headers):
        requester = db.userbase_data.find_one({"session_id": headers['token']})
        userInfo = db.userbase_data.find_one({"email": headers['email']})
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        # check if the user exists
        user = db.userbase_data.find_one({"session_id": headers['token']})
        # check if the listing exists
        user_listings = userInfo.get('listings')
        listingFound = [i for i in user_listings if i["listing_id"] == userData["listings"]["listing_id"]]

        if userInfo:
            if listingFound:
                
                listing_no = userData["listings"]["listing_no"] 
                user_listings[listing_no].update({'start_date': userData['listings']['start_date'], 'end_date': userData['listings']['end_date'], 'is_active': "True"})
                filter = {'email': userInfo['email']}
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

                return json_util.dumps(userInfo)
            return jsonify({"type": "listing_id", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def delete_listing(self, userData, headers):
        requester = db.userbase_data.find_one({"session_id": headers['token']})
        userInfo = db.userbase_data.find_one({"email": headers['email']})
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        # check if the listing exists
        user_listings = userInfo.get('listings')
        listingFound = [i for i in user_listings if i["listing_id"] == userData["listings"]["listing_id"]]
        if userInfo: 
            if listingFound: 
                listing_no = userData["listings"]["listing_no"]
                listing_length = len(userInfo['listings'])
                user_listings.remove(user_listings[listing_no])
                listing_length = len(userInfo['listings'])
                while listing_no < listing_length:
                    user_listings[listing_no].update({'listing_no': user_listings[listing_no]['listing_no'] - 1})
                    listing_no += 1
                    
                filter = {'email': userInfo['email']}
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

        requester = db.userbase_data.find_one({"session_id": headers['token']})
        userInfo = db.userbase_data.find_one({"email": headers['email']})
        if not userInfo:
            return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        if not requester:
            return jsonify({"type": "email", "error": "session id Does Not Exist"}), 402
        if requester['email'] != userInfo['email'] and requester['isAdmin'] == False:
            return jsonify({"type": "email", "error": "No permission"}), 402

        # check if the listing exists
        user_listings = userInfo.get('listings')
        listingFound = [i for i in user_listings if i["listing_id"] == userData["listings"]["listing_id"]]
        if userInfo:
            if listingFound:

                listing = {
                    "address": userData['listings']['address'],
                    "price": userData['listings']['price'],
                    "quantity": userData['listings']['quantity'], 
                    "details": userData['listings']['details'],
                    "restrictions": userData['listings']['restrictions'],
                    "image_url": userData['listings']['image_url'],
                    "images": userData['listings']['images'], 
                    "start_date": userData['listings']['start_date'],
                    "end_date": userData['listings']['end_date'],
                    "is_active": userData['listings']['is_active']  
                }
                listing_no = userData["listings"]["listing_no"]
                user_listings = userInfo['listings']
                user_listings[listing_no].update(listing)
                filter = {'email': userInfo['email']}
                newvalues = {"$set" : {'listings': user_listings}}
                db.userbase_data.update_one(filter, newvalues)

                # updating the same listing within the listings DB so ensure syncronised listings across DBs
                listing_id = userData['listings']['listing_id']
                filter = {'listing_id': listing_id}
                newvalues = {"$set": listing}
                db.listing_data.update_one(filter, newvalues)


                return json_util.dumps(userInfo)
            return jsonify({"type": "listing_id", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def get_listings(self, headers):
        # check if the user exists
        requester = db.userbase_data.find_one({"session_id": headers['token']})
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

    def get_all_users(self, headers):
        query = {
            "isAdmin": {"$ne": True}, 
            "isVerified": {"$ne": False} 
        }
        projection = {"_id": 0, "username": 1, "email": 1}

        users_cursor = db.userbase_data.find(query, projection)
        users = list(users_cursor)
        return json_util.dumps(users)

     

        

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
        requester = db.userbase_data.find_one({"session_id": userData['token']})
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
    def hold_listing(self, userData):
        
        # check if the user exists
        user = db.userbase_data.find_one({"session_id": userData['token']})
        # check if the listing exists
        provider_user = db.userbase_data.find_one({"listings.listing_id": userData["listingId"]})
        user_listings = provider_user.get('listings')

        now = datetime.datetime.now()
        start_time = now.strftime("%H:%M:%S")


        if user:
                db.userbase_data.update_one({"email": user['email']}, {"$set": {"pre_booking_time": start_time}})
                db.userbase_data.update_one({"email": user['email']}, {"$set": {"current_listing_id": userData["listingId"]}})
                db.userbase_data.update_one({"email": user['email']}, {"$set": {"current_listing_no": userData["listingNo"]}})
                db.userbase_data.update_one({"email": user['email']}, {"$set": {"carNumberPlate": userData["carNumberPlate"]}})
                # listing no to book 
                listing_no = userData["listingNo"] 
                user_listings[listing_no].update({'is_active': "False"})
                filter = {"listings.listing_id": userData["listingId"]}
                newvalues = {"$set" : {'listings': user_listings}}
                db.userbase_data.update_one(filter, newvalues)
                filter = {"listing_id": userData["listingId"]}
                newvalues = {"$set" : user_listings[listing_no]}
                db.listing_data.update_one(filter, newvalues)
                self.timer = threading.Timer(600, User.timer_thread, args=(User, userData,))
                self.timer.start()
                return json_util.dumps("Pass")
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def timer_thread(self, userData): 
        # release listing 
        User.release_listing(self, userData)




    # puts listing on page
    def release_listing(self, userData):
        self.timer.cancel()
        # print(userData)
        # check if the user exists
        
        user = db.userbase_data.find_one({"session_id": userData['token']})

        # check if the listing exists
        provider_user = db.userbase_data.find_one({"listings.listing_id": userData["listingId"]})
        user_listings = provider_user.get('listings')


        if user:
                listing_no = userData["listingNo"] 
                user_listings[listing_no].update({'is_active': "True"})
                db.userbase_data.update_one({"email": user['email']}, {"$set": {"pre_booking_time": ""}})
                filter = {"listings.listing_id": userData["listingId"]}
                newvalues = {"$set" : {'listings': user_listings}}
                db.userbase_data.update_one(filter, newvalues)
                filter = {"listing_id": userData["listingId"]}
                newvalues = {"$set" : user_listings[listing_no]}
                db.listing_data.update_one(filter, newvalues)
                return json_util.dumps("Pass")
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def getClosestListings(self, headers, distance): 
        latitude = 0
        longitude = 0
        latitude = float(headers['lat'])
        longitude = float(headers['lon'])
        closestListings = []
        for listing in db.listing_data.find({}): 
            listing_lat = 0
            listing_long = 0
            if 'latitude' not in listing.keys() or 'longitude' not in listing.keys(): 
                listing_lat, listing_long = helper.calcLatLong(listing['address'])
            else:
                listing_lat = listing["latitude"]
                listing_long = listing["longitude"]

            if listing['is_active'] == "True" and helper.calculateDistance(latitude, listing_lat, longitude, listing_long) <= distance: 
                now = int(datetime.datetime.now().timestamp() * 1000)
                start = int(datetime.datetime.strptime(listing['start_date'][:-1]+'+00:00', "%Y-%m-%dT%H:%M:%S.%f%z").timestamp() * 1000)
                end = int(datetime.datetime.strptime(listing['end_date'][:-1]+'+00:00', "%Y-%m-%dT%H:%M:%S.%f%z").timestamp() * 1000)
                # maybe update the expired listing as is_active = false in both listingDb and userDb
                if start <= now and now <= end:
                    closestListings.append(listing)
        return json_util.dumps(closestListings)
      
    def create_booking(self, userData):
        if self.timer:
            self.timer.cancel()
        # check if the user exists
        # print(userData)
        user = db.userbase_data.find_one({"session_id": userData['token']})

        # check if the listing exists
        provider_user = db.userbase_data.find_one({"listings.listing_id": userData["listingId"]})
        user_listings = provider_user.get('listings')
        booking_list = user["recentBookings"]

        listing_no = userData["listingNo"]

        listing_booking_list = user_listings[listing_no]["recentBookings"]

        now = datetime.datetime.now()
        start_time = now.strftime("%H:%M:%S")
        today = str(date.today())

        booking = {
            "address": user_listings[listing_no]["address"],
            "listing_id": userData["listingId"],
            "recentbooking_no": len(user["recentBookings"]),
            "date": today,
            "start_time": start_time,
            "end_price": "",
            "feedback": "",
            "end_image_url": "", 
            "total_time": "",
            "in_end_booking_phase": False,
            "payment_id": "",
            "carNumberPlate": userData["carNumberPlate"],
        }
        self.notifs(db, provider_user, user_listings[listing_no]["address"], today)
        ##bookingFound = [i for i in booking_list if i["listing_id"] == userData["listingId"]]
        ##bookingFoundv2 = [i for i in listing_booking_list if i["listing_id"] == userData["listingId"]]

        if user:
            booking_list.append(booking)
            user_listings[listing_no].update({'is_active': "False"})
            db.userbase_data.update_one({"email": user['email']}, {"$set": {"pre_booking_time": ""}})
            filter = {'email': user['email']}
            newvalues = {"$set" : {'recentBookings': booking_list}}
            db.userbase_data.update_one(filter, newvalues)
            booking.update({"email": user['email']})
            del booking["recentbooking_no"]
            listing_booking_list.append(booking)
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
        user = db.userbase_data.find_one({"session_id": headers['token']})
        # check if the listing exists
        provider_user = db.userbase_data.find_one({"listings.listing_id": userData["listingId"]})
        user_listings = provider_user.get('listings')
        booking_list = user["recentBookings"]
        if user:
            listing_no = userData["listingNo"]
            listing_booking_list = user_listings[listing_no]["recentBookings"]
            end_price = math.ceil(int(userData["totalTime"])/3600) * int(user_listings[listing_no]["price"])
            discounted_price = self.apply_promo_code(end_price, userData["promoCode"])
            booking = {
                    "end_price": discounted_price,
                    "feedback": userData["feedback"],
                    "end_image_url": userData["endImageUrl"], 
                    "total_time": userData["totalTime"],
                    "in_end_booking_phase": False
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
            listing_booking_list[-1].update(booking)
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
        listings = db.listing_data.find({})
        listingResults = []
        
        # regex
        pattern = re.compile(re.escape(userData['query']), re.IGNORECASE)
        
        for listing in listings: 
            if pattern.search(listing['address']) and listing['is_active'] == "True":
                now = int(datetime.datetime.now().timestamp() * 1000)
                start = int(datetime.datetime.strptime(listing['start_date'][:-1]+'+00:00', "%Y-%m-%dT%H:%M:%S.%f%z").timestamp() * 1000)
                end = int(datetime.datetime.strptime(listing['end_date'][:-1]+'+00:00', "%Y-%m-%dT%H:%M:%S.%f%z").timestamp() * 1000)
                # maybe update the expired listing as is_active = false in both listingDb and userDb
                if start <= now and now <= end:
                    listingResults.append(listing) 
    
        return json_util.dumps(listingResults)

    
    def addPaymentMethod(self, userData):
        user = db.userbase_data.find_one({"session_id": userData['token']})
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
        user = db.userbase_data.find_one({"session_id": userData['token']})
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
        user = db.userbase_data.find_one({"session_id": userData['token']})

        # user = db.userbase_data.find_one({"email": userData['email']})
        if user:
            is_admin = user.get('isAdmin', False)
            if is_admin:
                return jsonify({"type": "User", "error": "Admin Account"}), 402
            account = stripe.Account.retrieve(user['payOut_id'])
            if not account.payouts_enabled:
                return jsonify({"type": "User", "error": "Please provide or update provider details"}), 402

            return jsonify({"stripe_connected":user["is_stripe_connected"]})
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    def allCardList(self, userData):
        user = db.userbase_data.find_one({"session_id": userData['token']})

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
        user = db.userbase_data.find_one({"session_id": headers['token']})

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
        user = db.userbase_data.find_one({"session_id": headers['token']})
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
        user = db.userbase_data.find_one({"session_id": userData['token']})

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

    def get_specific_listing(self, headers):
        # user should be able to view listing before login in
        # check if the user exists
        user = db.userbase_data.find_one({"session_id": headers['token']})

        # check if the listing exists

        listing_data = db.listing_data.find_one({"listing_id": headers["listingId"]})
        if user: 
            listing_data['booked_previously'] = False
            listing_data['has_liked'] = False
            for listing in user['recentBookings']: 
                if listing['listing_id'] == headers['listingId']: 
                    listing_data['booked_previously'] = True
                    if any(liked_listing['listing_id'] == headers["listingId"] for liked_listing in user['liked_listings']):
                        listing_data['has_liked'] = True
                    break
        return json_util.dumps(listing_data)

    def get_pre_booking_time(self, headers):
        # check if the user exists
        user = db.userbase_data.find_one({"session_id": headers['token']})

        return json_util.dumps(user["pre_booking_time"])
    
    def get_booking_time(self, headers):
        # check if the user exists

        user = db.userbase_data.find_one({"session_id": headers['token']})
        booking_list = user["recentBookings"]

        return json_util.dumps(booking_list[-1]["start_time"])
    
    def apply_promo_code(self, booking_price, promo_code):

            if promo_code and promo_code.isalnum():
                #the last two digits 
                
                with open("/Users/adydaddy/capstone-project-3900w09a_parkify/server/promoCodes.txt", "r") as file: 
                    for promo in file: 
                        if promo_code == promo.strip():
                            print(promo_code[-2:])
                            discount_percentage = int(promo_code[-2:]) 
                            discounted_price = booking_price - (booking_price * discount_percentage / 100)
                            return discounted_price
                return booking_price
            else:
                return booking_price
            
    def update_user(self, userData, headers):
        # check if the user exists
        requester = db.userbase_data.find_one({"session_id": headers['token']})
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
                "profile_picture": userData['profile_picture'] 
            }
            userInfo.update(newuser)
            filter = {'email': userInfo['email']}
            newvalues = {"$set" : userInfo}
            db.userbase_data.update_one(filter, newvalues)
            return json_util.dumps(userInfo)
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

    def create_dispute(self, userData, headers):
        # check if the user exists
        user = db.userbase_data.find_one({"session_id": headers['token']})
        if user:
            dispute = {
                "dispute_id": uuid.uuid4().hex,
                "address": userData['address'],
                "date": userData['date'],
                "end_price": userData['end_price'],
                "total_time": userData['total_time'],
                "start_time": userData['start_time'],
                "dispute_by": userData['dispute_by'],
                "dispute_against": userData["dispute_against"],
                "dispute_message": userData["dispute_message"], 
                "dispute_image": userData['dispute_images'],
                "resolved": False 
            }
            print(dispute)
            db.disputes.insert_one(dispute)
            return jsonify({"message": "Dispute successfully created"}), 200
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
    
    def resolve_dispute(self, userData, headers):
        user = db.userbase_data.find_one({"session_id": headers['token']})

        if user:
            dispute = {
                "resolved": True 
            }
            dispute_id = userData['dispute_id']
            filter = {'dispute_id': dispute_id}
            newvalues = {"$set": dispute}
            db.disputes.update_one(filter, newvalues)
            return jsonify({"message": "Dispute successfully resolved"}), 200
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

            

    def get_email(self, headers):
        provider_user = db.userbase_data.find_one({"listings.listing_id": headers["listingId"]})
        return json_util.dumps(provider_user['email'])
    
    def get_disputes(self, headers):
        user = db.userbase_data.find_one({"session_id": headers['token']})
        if user: 
            disputes = db.disputes.find()
            disputes_list = list(disputes)  
            return json_util.dumps(disputes_list)
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402
        
    # this function is never used along with its route
    def get_recentBookings(self, headers):
        # check if the user exists
        user = db.userbase_data.find_one({"email": headers['email']})
        # check if the listing exists
        user_listings = user.get('listings')
        listingFound = [i for i in user_listings if i["listing_id"] == headers["listingId"]]

        listing = db.userbase_data.find_one(
            {"listings.listing_id": headers["listingId"]},
            {"listings.$": 1}
        )

        recent_bookings = listing.get('listings', [])[0].get('recentBookings', [])

        if user:
            if listingFound:
                return json_util.dumps(recent_bookings)
            return jsonify({"type": "listing_id", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    
    def like(self, userData, headers):
        # Check if the user exists
        #print("Email", headers['email'])
        user = db.userbase_data.find_one({"session_id": headers['token']})
        if user:
            chk = False 
            liked_listings = user['liked_listings']
            user_recent_bookings = user.get('recentBookings')
            for listing in user_recent_bookings: 
                if listing['listing_id'] == userData['listingId']: 
                    liked_listings.append(listing)
                    chk = True
                    break

            if chk == True: 
                db.userbase_data.update_one({"email": user['email']}, {"$set": {"liked_listings": liked_listings}})
                provider_user = db.userbase_data.find_one({"listings.listing_id": userData["listingId"]})
                user_listings = provider_user.get('listings')
                for listing in user_listings: 
                    if listing['listing_id'] == userData['listingId']: 
                        listing['likes'] += 1
                db.userbase_data.update_one({"listings.listing_id": userData["listingId"]}, {"$set": {"listings": user_listings}})
                # Check if the listing exists
                listing = db.listing_data.find_one({"listing_id": userData["listingId"]})
                if listing: 
                    db.listing_data.update_one({"_id": listing["_id"]}, {"$inc": {"likes": 1}})
                
                
            #listing_found = [i for i in user_recent_bookings if i["listing_id"] == userData["listingId"]]
            
            return jsonify({"message": "liked"}), 200
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    
    def dislike(self, userData, headers):
        user = db.userbase_data.find_one({"session_id": headers['token']})
        if user:
            chk = False 
            liked_listings = user['liked_listings']
            user_recent_bookings = user.get('recentBookings')
            for listing in user_recent_bookings: 
                if listing['listing_id'] == userData['listingId']: 
                    liked_listings.remove(listing)
                    chk = True
                    break
            if chk == True: 
                db.userbase_data.update_one({"email": user['email']}, {"$set": {"liked_listings": liked_listings}})
                provider_user = db.userbase_data.find_one({"listings.listing_id": userData["listingId"]})
                user_listings = provider_user.get('listings')
                for listing in user_listings: 
                    if listing['listing_id'] == userData['listingId']: 
                        listing['likes'] -= 1
                        if listing['likes'] < 0: 
                            listing['likes'] = 0
                db.userbase_data.update_one({"listings.listing_id": userData["listingId"]}, {"$set": {"listings": user_listings}})
                # Check if the listing exists
                listing = db.listing_data.find_one({"listing_id": userData["listingId"]})
                if listing: 
                    if listing.get("likes", 0) > 0: 
                        db.listing_data.update_one({"_id": listing["_id"]}, {"$inc": {"likes": -1}})
            return jsonify({"message": "disliked"}), 200
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    
    def timerPersistence(self, headers):
        user = db.userbase_data.find_one({"session_id": headers['token']})
        if user:
            if user['pre_booking_time'] != "":
                return jsonify({"result": "prebooking", "listingId": user['current_listing_id'], "listingNo": user['current_listing_no'], "carNumberPlate": user['carNumberPlate']}), 200
            elif len(user['recentBookings']) != 0:
                if user['recentBookings'][-1]['in_end_booking_phase'] == True:
                    return jsonify({"result": "endbooking", "listingId": user['current_listing_id'], "listingNo": user['current_listing_no'], "timer": user['timer']}), 200
                if user['recentBookings'][-1]['total_time'] == "":
                    return jsonify({"result": "booking", "listingId": user['current_listing_id'], "listingNo": user['current_listing_no']}), 200
                else:
                    return jsonify({"result": "none"}), 200
            else:
                return jsonify({"result": "none"}), 200
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402

    def saveTimer(self, userData, headers):
        user = db.userbase_data.find_one({"session_id": headers['token']})
        if user:
            db.userbase_data.update_one({"session_id": headers['token']}, {"$set": {"timer": userData["timer"]}})
            if user['recentBookings']:
                last_booking_index = len(user['recentBookings']) - 1
                update_field = f"recentBookings.{last_booking_index}.in_end_booking_phase"
                db.userbase_data.update_one(
                    {"session_id": headers['token']},
                    {"$set": {update_field: True}}
                )
            return json_util.dumps("Pass")
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402
    
    
    def notifs(self, db, provider_user, address, date):
        # Check if provider_user exists
        notification_message = f"Your listing {address} has been booked."
        if provider_user:
            # Push notification_message to the notifications array
            db.userbase_data.update_one(
                {"_id": provider_user["_id"]},
                {
                    "$push": {
                        "notifications": {
                            "title": address,
                            "description": notification_message,
                            "date": date 
                        }
                    }
                }
            )
        else:
            print("Provider user not found.")
    
    def getNotifs(self, headers):
        user = db.userbase_data.find_one({"session_id": headers['token']})
        if user:
            notifications = user.get("notifications", [])
            return json_util.dumps(notifications)
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402