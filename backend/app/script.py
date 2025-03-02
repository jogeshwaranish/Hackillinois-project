import pandas as pd
import numpy as np
import os
import requests
import json
from . import db
from flask import jsonify
import time
import asyncio
import math

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
    existing_location = db.user_collection.find_one(sort=[("_id", -1)])
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


def unique_path():
    # Get all purchases
    unique_path = set()
    all_purchases = list(db.purchases.purchases_collection.find())
    all_purchases[0]['lat'] = float(all_purchases[0]['lat'])
    all_purchases[0]['lon'] = float(all_purchases[0]['lon'])
    unique_path.add((all_purchases[0]['lon'], all_purchases[0]['lat']))
    for i in range(len(all_purchases)):
        all_purchases[i]['lat'] = float(all_purchases[i]['lat'])
        all_purchases[i]['lon'] = float(all_purchases[i]['lon'])
        for j in range(i+1, len(all_purchases)):
            all_purchases[j]['lat'] = float(all_purchases[j]['lat'])
            all_purchases[j]['lon'] = float(all_purchases[j]['lon'])
            if not is_within_range(
                [all_purchases[i]['lat'], all_purchases[i]['lon']],
                [all_purchases[j]['lat'], all_purchases[j]['lon']],
                0.1
            ):
                unique_path.add((all_purchases[j]['lon'], all_purchases[j]['lat']))
    return unique_path

    
def haversine(coord1, coord2):
    """
    Calculate the distance in kilometers between two coordinates using the Haversine formula.
    """
    R = 6371  # Radius of the Earth in kilometers

    lat1, lon1 = math.radians(coord1[0]), math.radians(coord1[1])
    lat2, lon2 = math.radians(coord2[0]), math.radians(coord2[1])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c
    return distance

def is_within_range(coord1, coord2, max_distance_km):
  """
  Check if coord2 is within max_distance_km of coord1.
  """
  distance = haversine(coord1, coord2)
  return distance <= max_distance_km