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


def updateTransactions(loc):
    # Get all purchases
    all_purchases = get_merchants_purchases()
    
    if not all_purchases or len(all_purchases) == 0:
        print("No purchases found")
        return {"message": "No transactions to update"}
    
    new_transactions_added = 0
    
    # Process all transactions
    for transaction in all_purchases:
        # Get the original ID
        original_id = transaction.get("_id")
        if not original_id:
            continue
            
        # Check if this transaction already exists
        existing_purchase = db.purchases.purchases_collection.find_one({"trans_id": original_id})
        if existing_purchase:
            continue
        
        # Create a clean transaction object
        new_transaction = {
            "trans_id": original_id,
            "merchant_id": transaction.get("merchant_id"),
            "medium": transaction.get("medium"),
            "purchase_date": transaction.get("purchase_date"),
            "amount": transaction.get("amount"),
            "status": transaction.get("status"),
            "description": transaction.get("description"),
            "type": transaction.get("type"),
            "payer_id": transaction.get("payer_id"),
            "time": time.time()
        }
        
        # Add location data
        if loc and isinstance(loc, dict):
            new_transaction.update(loc)
        
        # Insert the new transaction
        db.purchases.purchases_collection.insert_one(new_transaction)
        new_transactions_added += 1
    
    if new_transactions_added > 0:
        return {"message": f"Added {new_transactions_added} new transactions"}
    else:
        return {"message": "No new transactions to add"}

def convert_to_geojson(transactions):
    """
    Convert transaction data to GeoJSON format for mapping.
    
    Args:
        transactions: List of transaction documents from MongoDB
        
    Returns:
        GeoJSON FeatureCollection containing transaction points
    """
    features = []
    
    for transaction in transactions:
        # Skip transactions without location data
        if 'lat' not in transaction or 'lon' not in transaction:
            continue
            
        # Create a GeoJSON Feature
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [float(transaction.get('lon')), float(transaction.get('lat'))]
            },
            "properties": {
                "trans_id": transaction.get('trans_id'),
                "merchant_id": transaction.get('merchant_id'),
                "amount": transaction.get('amount'),
                "purchase_date": transaction.get('purchase_date'),
                "status": transaction.get('status'),
                "description": transaction.get('description'),
                "type": transaction.get('type'),
                "time": transaction.get('time')
            }
        }
        
        features.append(feature)
    
    # Create the GeoJSON FeatureCollection
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    return geojson

