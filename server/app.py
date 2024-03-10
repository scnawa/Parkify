#first commit 
import sys
import json
from json import dumps
from flask import Flask, request, send_from_directory, session, redirect
from functools import wraps
from flask_cors import CORS
from error import InputError
import config
from pymongo import MongoClient
import certifi
import helper


# Accessing the database
ca = certifi.where()
cluster = "mongodb+srv://parkifybackendteam:hello123@userbase.zylv2bc.mongodb.net/?retryWrites=true&w=majority&appName=userbase"
client = MongoClient(cluster, tlsCAFile=ca)
db = client.userbase



def defaultHandler(err):
    response = err.get_response()
    print('response', err, err.get_response())
    response.data = dumps({
        "code": err.code,
        "name": "System Error",
        "message": err.get_description(),
    })
    response.content_type = 'application/json'
    return response

APP = Flask(__name__, static_folder = '../static')
CORS(APP)

APP.config['TRAP_HTTP_EXCEPTIONS'] = True
APP.register_error_handler(Exception, defaultHandler)

@APP.route('/')
def homePage(): 
    return "home"

@APP.route('/signup', methods=['POST'])
def signup(): 
    userData = json.loads(request.data)
    return config.User().signup(userData)

@APP.route('/signup/verify', methods = ['POST'])
def verify_email(): 
    userData = json.loads(request.data)
    username = config.User().getUsername(userData)
    return helper.sendVerificationEmail(userData['email'], username, 'verification')



@APP.route('/login', methods=['POST'])
def login(): 
    userData = json.loads(request.data)
    return config.User().login(userData)

@APP.route('/logout', methods = ['POST'])
def logout(): 
    userData = json.loads(request.data)
    return config.User().logout(userData)

@APP.route('/deleteAccount', methods = ['DELETE'])
def delete_account(): 
    userData = json.loads(request.data)
    return config.User().delete_account(userData)

@APP.route('/resetPass', methods = ['POST'])
def resetPass():
    userData = json.loads(request.data)
    return config.User().resetPass(userData)



APP.route('/resetPass', methods = ['POST'])
def resetPass():
    userData = json.loads(request.data)
    return config.User().resetPass(userData)


@APP.route('/create_listing', methods = ['PUT'])
def create_listing(): 
    userData = json.loads(request.data)
    return config.User().create_listing(userData)

@APP.route('/deactivate_listing', methods = ['POST'])
def deactivate_listing(): 
    headers = request.headers

    userData = json.loads(request.data)
    return config.User().deactivate_listing(userData, headers)

@APP.route('/activate_listing', methods = ['POST'])
def activate_listing(): 
    headers = request.headers
    userData = json.loads(request.data)
    return config.User().activate_listing(userData, headers)

@APP.route('/delete_listing', methods = ['DELETE'])
def delete_listing():
    headers = request.headers
    userData = json.loads(request.data)
    return config.User().delete_listing(userData, headers)

@APP.route('/update_listing', methods = ['POST'])
def update_listing(): 
    headers = request.headers
    userData = json.loads(request.data)
    return config.User().update_listing(userData, headers)

@APP.route('/get_listings', methods = ['GET'])
def get_listings(): 
    headers = request.headers

    return config.User().get_listings(headers)

@APP.route('/get_listing', methods = ['GET'])
def get_listing(): 
    userData = request.headers
    return config.User().get_listing(userData)



if __name__ == "__main__": 
    APP.run(port = config.port)