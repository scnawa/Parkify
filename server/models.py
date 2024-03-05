from passlib.hash import pbkdf2_sha256
class User: 
    def signup(self, userData): 
        consumer = {
                "username": userData['username'], 
                "password": userData['password'],
        }



        provider = { 
            "username": userData['username'], 
            "password": userData['password'],
            "userType" : userData["userType"],
            "listings": userData["listings"], # one list of dictionaries of different listings
            "creditCards" : userData['creditCards'], 
        }




'''
listing { 
address
price
image_url 
}



'''
