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
        




        user = db.userbase_data.find_one(userData[])
        if db.userbase_data.insert_one(user):
            return json_util.dumps(user)







'''
listing { 
address
price
image_url 
}



'''
