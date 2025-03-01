import pandas as pd
import numpy as np
import os
import requests
import json
from . import db
from flask import jsonify
import time
import asyncio


def get_merchants_purchases():
    url = "http://api.nessieisreal.com/merchants/67c282359683f20dd518c00b/purchases?key=6ec27d1e026837afbeec1914d11ceb58"
    response = requests.get(url)
    data = response.json()
    return data

def change_merchant_location(lat, lng):
    url = "http://api.nessieisreal.com/merchants/67c282359683f20dd518c00b?key=6ec27d1e026837afbeec1914d11ceb58"
    payload = {
        "geocode": {
            "lat": lat,
            "lng": lng
    }
    }
    response = requests.put(url, data=json.dumps(payload), headers={"content-type": "application/json"})
    data = response.json()
    return data

def get_latest_location():
    existing_location = db.db.user_collection.find_one(sort=[("_id", -1)])
    if existing_location:
        return existing_location
    return jsonify({"message": "no transactions"}), 200



async def updateTransactions(loc):
    latest_one = get_merchants_purchases()[-1]
    latest_one.update(loc)
    latest_one.update({"time":time.time()})

    existing_purchase = db.purchases.collection.find_one({"_id": latest_one['_id']})

    if existing_purchase:
        return jsonify({"message": "transaction already exists, no changes made"}), 200

    # Insert the new transaction
    db.purchases.collection.insert_one(latest_one)
    return jsonify({"message": "Transaction added successfully"}), 201

