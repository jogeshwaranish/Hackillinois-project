from flask import Flask
from flask_pymongo import pymongo
import os
from dotenv import load_dotenv
import pymongo.collation
import pymongo.collection
load_dotenv()

CONNECTION_STRING = "mongodb+srv://jb79:FrA4yX!Pc.jr.GN@datatruck.kn66o.mongodb.net/?retryWrites=true&w=majority&appName=datatruck"
client = pymongo.MongoClient(CONNECTION_STRING)
db = client.get_database('flask_mongodb_atlas')
user_collection = pymongo.collection.Collection(db, 'user_collection')

purchases = client.get_database("purchases")
purchases_collection = pymongo.collection.Collection(purchases, "purchases_collection")