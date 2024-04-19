# Installation 

## Setup/Installation 

We recommend installing and testing our application on wsl or linux. 

1. Unzip the downloaded repo. 
2. Open the file and create two terminals. One will be used to run the frontend server; one will be used to run the backend server. 
3. For the frontend, in one terminal, cd to the frontend directory with the command “cd frontend/” 
    * Node is required. If you don’t have node installed on your system, check this website and follow the instructions for your OS: https://nodejs.org/en/download 
    * Use the command “npm install” to install required dependencies after installing node. 
4. For the backend, in the other terminal, cd to the backend directory with the command “cd server/” 
    * Use the command “pip3 install -r requirements.txt” to install required libraries. 
5. If you are on a linux os (or wsl), on the frontend terminal to start the frontend server use either the command “npm run start-linux” or “export HTTPS="true" && npm start”. If you are directly on windows (no wsl), use the command “($env:HTTPS = "true") -and (npm start)” instead 
6. Now on the backend terminal to start the backend server use the command “python3 app.py”. 
    * If you are having certificate issues here when you are trying to test the system and you are on a mac OS, then use finder to find the “Install Certificates.command”. Right click “Get Info”, then click open with “iTerm.app”. After this, double click ‘Install Certificates.command”.
7. The site is located at https://localhost:3000/ 

We recommend you use chrome for running the site. When you open the web for the first time, it will give you a warning since it is running on local host. You are getting a warning since the certificate does not match the ‘localhost’ domain and ‘localhost’ domain can’t be verified. 

## Initial Loading Page When Loading For the First Time

![Screen Shot 2024-04-19 at 11.44.35 pm](https://hackmd.io/_uploads/rJzUreg-R.png)

Click “advance” and click “continue to localhost(unsafe)”. 


After the above installation step, you can navigate our website now. 

## Backend and API service account
You can navigate to our API services and MongoDB database with the following websites: 

https://dashboard.stripe.com/dashboard 

https://www.mongodb.com/ 

## Stripe 

**Account name**: parkify3900@outlook.com 

**Password**: COMP3900stripe 

You need to use the Google MFA to login with these details. Please make sure the dashboard is on test mode when you are navigating the dashboard. 

![Screen Shot 2024-04-19 at 11.45.05 pm](https://hackmd.io/_uploads/ryGurleZ0.png)

The account is not fully activated so you can only use the testing card and testing data provided by stripe to test our website. And we can’t fully register our website since it requires us to register our business and provide real business details. 

The payment system is divided into the provider side and customer side.  
![Screen Shot 2024-04-19 at 11.45.42 pm](https://hackmd.io/_uploads/ByIcHexb0.png)

The customer and their payment related items (eg. Credit card added) will be stored in the customer account on the stripe. You can navigate to the customer related details on the sidebar “customer” field. 
 
And there are connected accounts for provider. Only a connected account has the ability to receive money from our platform through stripe. 

![Screen Shot 2024-04-19 at 11.46.02 pm](https://hackmd.io/_uploads/S1_irgl-R.png)

The status ”Restricted” means that users haven’t provided the details to become a provider so they can’t create listing or receive payment from stripe. More details of this will be given in the sections below (how to use the system). 

## MongoDB 

**Account name**: parkify.auth@gmail.com 

**Password**: COMP3900Project 

You can login in and observe our backend data on it by going on the collection titled “Parkify”. Click on database, collections, then click on one of the dbs. In order to log into the MongoDB account, you will need to sign into Gmail with the above credentials and on the login page, you will need to click on the “Gmail” button to sign in.  