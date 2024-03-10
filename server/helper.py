# first commit

from email.message import EmailMessage
import ssl
import smtplib
import random

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