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
        }
        user['password'] = pbkdf2_sha256.encrypt(
            user['password'])
        #user = db.userbase_data.find_one(userData[])
        if db.userbase_data.insert_one(user):
            return json_util.dumps(user)


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
