from flask import Flask
from flask_pymongo import pymongo
CONNECTION_STRING = "mongodb+srv://jb79:RPeYCG3MuzbMbUgX@foodtruck.kn66o.mongodb.net/?retryWrites=true&w=majority&appName=foodtruck"
client = pymongo.MongoClient(CONNECTION_STRING)
db = client.get_database('flask_mongodb_atlas')
user_collection = pymongo.collection.Collection(db, 'user_collection')