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

class User: 
    def signup(self, userData): 
        user = { 
            "username": userData['username'], 
            "password": userData['password'],
            "listings": userData["listings"], # one list of dictionaries of different listings
            "creditCards" : userData['creditCards'], 
            "email" : userData["email"], 
            "session_id": []
        }
        user['password'] = pbkdf2_sha256.encrypt(
            user['password'])
        #user = db.userbase_data.find_one(userData[])
        if db.userbase_data.find_one({"email": userData['email']}): 
            return jsonify({'type': "email", "error": "Email already in use"}), 400 
        
        if db.userbase_data.find_one({"username": userData['username']}): 
            return jsonify({'type': "username", "error": "Email already in use"}), 400 
        
        if db.userbase_data.insert_one(user):
            return json_util.dumps(user)
        
        return jsonify({'type': "system error", "error": "Signup failed due to unforeseen circumstances"}), 400 
    

    def login(self, userData): 
        user = db.userbase_data.find_one({"email": userData['email']})
        if user: 
            if pbkdf2_sha256.verify(userData['password'], user['password']):
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
        #check if the user exists
        user = db.userbase_data.find_one({"email": userData['email']})
        listing = {
            "address": userData['listings']['address'],
            "price": userData['listings']['price'],
            "image_url": userData['listings']['image_url'], 
            "start_date": userData['listings']['start_date'],
            "end_date": userData['listings']['end_date'],
            "is_active": userData['listings']['is_active']
        }
        user_listings = user['listings']
        user_listings.append(listing)
        #user.update({'listings': user_listings})
        filter = {'email': user['email']}
        newvalues = {"$set" : {'listings': user_listings}}
        db.userbase_data.update_one(filter, newvalues)
        return json_util.dumps(user)

"""

listing: 
{
address: "123 abc lane"




}

"""



'''
listing { 
address
price
image_url 
}



'''
