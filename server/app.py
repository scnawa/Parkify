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


@APP.route('/create_listing', methods = ['POST'])
def create_listing(): 
    userData = json.loads(request.data)
    return config.User().create_listing(userData)


if __name__ == "__main__": 
    APP.run(port = config.port)