# first commit

from email.message import EmailMessage
import ssl
import smtplib
import random
import requests
from geopy.distance import geodesic
def generateCode():
    return str(random.randrange(100000, 999999))

def sendVerificationEmail(email, username, type):
    senderEmail = 'parkify.auth@gmail.com'
    senderPass = 'rvekzmdhtnwnonfk'
    verificationCode = generateCode()
    if type == 'verification':
        subject = 'Parkify - Account Verification'
        body = "Hi " + username + ",\nThank you for joining Parkify!\n\nYour verification code is: " + \
            verificationCode + "\n\nCheers,\nThe Parkify Team"
    elif type == 'recovery':
        subject = 'Parkify - Account Recovery'
        body = "Hi " + username + ",\n\nWe are sorry to hear that you have forgotten your password. Not to worry! Your verification code is: " + \
            verificationCode + "\n\nCheers,\nThe Parkify Team"

    emailMessageObj = EmailMessage()
    emailMessageObj['From'] = senderEmail
    emailMessageObj['To'] = email
    emailMessageObj['Subject'] = subject
    emailMessageObj.set_content(body)

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
        smtp.login(senderEmail, senderPass)
        smtp.sendmail(senderEmail, email, emailMessageObj.as_string())
    return verificationCode


def calcLatLong(address): 
    API_KEY = "44278b4afd944530a529b53bc76f7110"

    # Build the API URL
    url = f"https://api.geoapify.com/v1/geocode/search?text={address}&limit=1&apiKey={API_KEY}"

    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()

        result = data["features"][0]
        latitude = result["geometry"]["coordinates"][1]
        longitude = result["geometry"]["coordinates"][0]
        return latitude, longitude
    else:
        print(f"Request failed with status code {response.status_code}")



def calculateDistance(sourceLat, destLat, sourceLon, destLon): 
    return geodesic((sourceLat,sourceLon),(destLat, destLon)).kilometers