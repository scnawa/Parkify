#first commit 
import json
from json import dumps
from flask import Flask, request
from functools import wraps
from flask_cors import CORS
import config
from pymongo import MongoClient
import certifi
import helper
import stripe
from pymongo.server_api import ServerApi


# Accessing the database
ca = certifi.where()
cluster = "mongodb+srv://sarveshwanzare10:tj4R9si00EuyLo2t@userbase.i3dtjoy.mongodb.net/?retryWrites=true&w=majority&appName=userbase"
client = MongoClient(cluster, tlsCAFile=ca)
#client = MongoClient(cluster, server_api=ServerApi('1'))
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

@APP.route('/checkAdmin', methods = ['GET'])
def checkAdmin():
    userData = request.headers
    return config.User().checkAdmin(userData)
    

@APP.route('/signup', methods=['POST'])
def signup(): 
    userData = json.loads(request.data)
    return config.User().signup(userData)

@APP.route('/signup/verify', methods = ['POST'])
def verifyEmail(): 
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
def deleteAccount(): 
    userData = json.loads(request.data)
    return config.User().deleteAccount(userData)

@APP.route('/resetPass', methods = ['POST'])
def resetPass():
    userData = json.loads(request.data)
    return config.User().resetPass(userData)



APP.route('/resetPass', methods = ['POST'])
def resetPass():
    userData = json.loads(request.data)
    return config.User().resetPass(userData)


@APP.route('/create_listing', methods = ['PUT'])
def createListing(): 
    userData = json.loads(request.data)
    return config.User().createListing(userData)

@APP.route('/deactivate_listing', methods = ['POST'])
def deactivateListing(): 
    headers = request.headers

    userData = json.loads(request.data)
    return config.User().deactivateListing(userData, headers)

@APP.route('/activate_listing', methods = ['POST'])
def activateListing(): 
    headers = request.headers
    userData = json.loads(request.data)
    return config.User().activateListing(userData, headers)

@APP.route('/delete_listing', methods = ['DELETE'])
def deleteListing():
    headers = request.headers
    userData = json.loads(request.data)
    return config.User().deleteListing(userData, headers)

@APP.route('/update_listing', methods = ['POST'])
def updateListing(): 
    headers = request.headers
    userData = json.loads(request.data)
    return config.User().updateListing(userData, headers)

@APP.route('/get_listings', methods = ['GET'])
def getListings(): 
    headers = request.headers

    return config.User().getListings(headers)

@APP.route('/get_all_users', methods = ['GET'])
def getAllUsers(): 
    headers = request.headers

    return config.User().getAllUsers(headers)

@APP.route('/get_listing', methods = ['GET'])
def getListing(): 
    userData = request.headers
    return config.User().getListing(userData)

@APP.route('/getAllListings', methods = ['GET'])
def getAllListings(): 
    return config.User().getAllListings()

@APP.route('/getUserInfo', methods=['GET'])
def getUserInfo(): 
    userData = request.headers
    return config.User().getUserInfo(userData)


@APP.route('/closestListing', methods=['GET'])
def closestListing(): 
    userData = request.headers
    return config.User().getClosestListings(userData)

@APP.route('/hold_listing', methods = ['POST'])
def holdListing(): 
    userData = json.loads(request.data)
    return config.User().holdListing(userData)

@APP.route('/release_listing', methods = ['POST'])
def releaseListing(): 
    userData = json.loads(request.data)
    return config.User().releaseListing(userData)

@APP.route('/create_booking', methods = ['POST'])
def createBooking(): 
    userData = json.loads(request.data)
    return config.User().createBooking(userData)

@APP.route('/remove_recentbooking', methods = ['POST'])
def removeRecentBooking(): 
    userData = json.loads(request.data)
    return config.User().removeRecentBooking(userData)

@APP.route('/end_booking', methods = ['POST'])
def endBooking():
    headers = request.headers
    userData = json.loads(request.data)
    return config.User().endBooking(headers, userData)

@APP.route('/searchForSpace', methods = ['GET'])
def searchForSpace(): 
    userData = request.headers
    return config.User().searchForSpace(userData)

@APP.route('/filterByPriceAndDistance', methods = ['GET'])
def filterByPriceAndDistance(): 
    userData = request.headers
    return config.User().filterByPriceAndDistance(userData)

@APP.route('/addPaymentMethod', methods=['POST'])
def payBooking(): 
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

@APP.route('/getSpecificListing', methods = ['GET'])
def getSpecificListing(): 
    userData = request.headers
    return config.User().getSpecificListing(userData)

@APP.route('/getPreBookingTime', methods = ['GET'])
def getPreBookingTime(): 
    userData = request.headers
    return config.User().getPreBookingTime(userData)

@APP.route('/getBookingTime', methods = ['GET'])
def getBookingTime(): 
    userData = request.headers
    return config.User().getBookingTime(userData)

@APP.route('/updateUser', methods = ['POST'])
def updateUser(): 
    headers = request.headers
    userData = json.loads(request.data)
    return config.User().updateUser(userData, headers)
    
@APP.route('/createDispute', methods = ['POST'])
def createDispute(): 
    headers = request.headers
    userData = json.loads(request.data)
    return config.User().createDispute(userData, headers)

@APP.route('/getEmail', methods = ['GET'])
def getEmail(): 
    headers = request.headers
    return config.User().getEmail(headers)

@APP.route('/getDisputes', methods = ['GET'])
def getDisputes(): 
    headers = request.headers
    return config.User().getDisputes(headers)
    
@APP.route('/getRecentBookings', methods = ['GET'])
def getRecentBookings(): 
    userData = request.headers
    return config.User().getRecentBookings(userData)

@APP.route('/resolveDispute', methods = ['POST'])
def resolveDispute(): 
    headers = request.headers
    userData = json.loads(request.data)
    return config.User().resolveDispute(userData, headers)

@APP.route('/like', methods=['POST'])
def like():
    headers = request.headers
    userData = json.loads(request.data)
    return config.User().like(userData, headers)

@APP.route('/dislike', methods=['POST'])
def dislike():
    headers = request.headers
    userData = json.loads(request.data)
    return config.User().dislike(userData, headers)

@APP.route('/timerPersistence', methods=['GET'])
def timerPersistence():
    headers = request.headers
    return config.User().timerPersistence(headers)

@APP.route('/saveTimer', methods=['POST'])
def saveTimer():
    headers = request.headers
    userData = json.loads(request.data)
    return config.User().saveTimer(userData, headers)

@APP.route('/getNotifs', methods=['GET'])
def getNotifs():
    headers = request.headers
    return config.User().getNotifs(headers)

@APP.route('/recommendations', methods=['GET'])
def makeReco():
    headers = request.headers
    return config.User().makeReco(headers)

if __name__ == "__main__": 
    APP.run(port = config.port)