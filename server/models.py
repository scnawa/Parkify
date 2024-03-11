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

class User: 
    def signup(self, userData): 
        user = { 
            "username": userData['username'], 
            "password": userData['password'],
            "listings": userData["listings"], # one list of dictionaries of different listings
            "creditCards" : userData['creditCards'], 
            "email" : userData["email"], 
            "session_id": [],
            "isVerified" : False
        }
        user['password'] = pbkdf2_sha256.encrypt(
            user['password'])
        #user = db.userbase_data.find_one(userData[])
        if db.userbase_data.find_one({"email": userData['email']}): 
            return jsonify({'type': "email", "error": "Email already in use"}), 400 

        if db.userbase_data.insert_one(user):
            # debugging 
            return json_util.dumps(user)

        return jsonify({'type': "system error", "error": "Signup failed due to unforeseen circumstances"}), 400
    
    def getUsername(self, userData): 
        user = db.userbase_data.find_one({"email": userData['email']})
        if user: 
            return user['username']
        return jsonify({"type": "email", "error": "User Does Not Exist"}), 402

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
                "is_active": 'False' 
            }

            user_listings = user['listings']
            user_listings.append(listing)
            filter = {'email': user['email']}
            newvalues = {"$set" : {'listings': user_listings}}
            db.userbase_data.update_one(filter, newvalues)
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
        listingFound = [i for i in user_listings if i["listing_id"] == userData["listings"]["listing_id"]]

        if user:
            if listingFound:
                listing_no = userData["listings"]["listing_no"] 
                return json_util.dumps(user_listings[listing_no])
            return jsonify({"type": "listing_id", "error": "Listing Does Not Exist"}), 402
        return jsonify({"type": "User", "error": "User Does Not Exist"}), 402


