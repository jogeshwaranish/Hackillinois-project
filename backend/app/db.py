from flask import Flask
from flask_pymongo import pymongo
import os
from dotenv import load_dotenv
import pymongo.collation
import pymongo.collection
load_dotenv()

CONNECTION_STRING = os.getenv("mongodb_uri")
client = pymongo.MongoClient(CONNECTION_STRING)
db = client.get_database("Data")
user_collection = pymongo.collection.Collection(db, "coords")

purchases = client.get_database("Truck")
purchases_collection = pymongo.collection.Collection(purchases, "transactions")