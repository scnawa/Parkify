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
import stripe


# Accessing the database
ca = certifi.where()
cluster = "mongodb+srv://parkifybackendteam:hello123@userbase.zylv2bc.mongodb.net/?retryWrites=true&w=majority&appName=userbase"
client = MongoClient(cluster, tlsCAFile=ca)
db = client.userbase

stripe.api_key = "sk_test_51OxR4GBZWJO5ZDijvkSWr3V71apvw6HNRDyoVJg6Z7zVRTjk78SHGFxTcn0oUJAEViWE35ppf9nlmeKN9aQsoFo500wUemOwNF"


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

@APP.route('/setupAdmin', methods = ['POST'])
def setupAdmin():
    userData = json.loads(request.data)
    return config.User().setupAdmin(userData)

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

@APP.route('/getAllListings', methods = ['GET'])
def get_all_listings(): 
    return config.User().get_all_listings()

@APP.route('/getUserInfo', methods=['GET'])
def getUserInfo(): 
    userData = request.headers
    return config.User().getUserInfo(userData)


@APP.route('/closestListing', methods=['GET'])
def closestListing(): 
    userData = request.headers
    return config.User().getClosestListings(userData)

@APP.route('/hold_listing', methods = ['POST'])
def hold_listing(): 
    userData = json.loads(request.data)
    return config.User().hold_listing(userData)

@APP.route('/release_listing', methods = ['POST'])
def release_listing(): 
    userData = json.loads(request.data)
    return config.User().release_listing(userData)

@APP.route('/create_booking', methods = ['POST'])
def create_booking(): 
    userData = json.loads(request.data)
    return config.User().create_booking(userData)

@APP.route('/remove_recentbooking', methods = ['POST'])
def remove_recentbooking(): 
    userData = json.loads(request.data)
    return config.User().remove_recentbooking(userData)

@APP.route('/end_booking', methods = ['POST'])
def end_booking(): 
    userData = json.loads(request.data)
    return config.User().end_booking(userData)

@APP.route('/searchForSpace', methods = ['GET'])
def searchForSpace(): 
    userData = request.headers
    return config.User().searchForSpace(userData)

@APP.route('/filterByPrice', methods = ['GET'])
def filterByPrice(): 
    userData = request.headers
    return config.User().filterByPrice(userData)

@APP.route('/addPaymentMethod', methods=['POST'])
def pay_booking(): 
    userData = request.headers
    return config.User().addPaymentMethod(userData)
@APP.route('/providerDetails', methods=['POST'])
def providerDetails(): 
    userData = request.headers
    return config.User().providerDetails(userData)
@APP.route('/userIsprovider', methods=['GET'])
def userIsprovider(): 
    userData = request.headers
    return config.User().userIsprovider(userData)
@APP.route('/allCardList', methods=['GET'])
def allCardList(): 
    userData = request.headers
    return config.User().allCardList(userData)
@APP.route('/setDefaultCard', methods=['POST'])
def setDefaultCard(): 
    headers = request.headers
    userData = json.loads(request.data)

    return config.User().setDefaultCard(headers, userData)
@APP.route('/removeCard', methods=['POST'])
def removeCard(): 
    headers = request.headers
    userData = json.loads(request.data)
    return config.User().removeCard(headers, userData)
@APP.route('/getDefaultCard', methods=['GET'])
def getDefaultCard(): 
    userData = request.headers
    return config.User().getDefaultCard(userData)

@APP.route('/testPay', methods=['GET'])
def testPay(): 
    userData = request.headers
    return config.User().testPay(userData)

# @APP.route('/providePaymentDetails', methods=['POST'])
# def pay_booking(): 
#     userData = request.headers
#     return config.User().providePaymentDetails(userData)

# @APP.route('/payment', methods=['POST'])
# def pay_booking(): 
#     userData = request.headers
#     return config.User().pay_booking(userData)
@APP.route('/getSpecificListing', methods = ['GET'])
def get_specific_listing(): 
    userData = request.headers
    return config.User().get_specific_listing(userData)

if __name__ == "__main__": 
    APP.run(port = config.port)