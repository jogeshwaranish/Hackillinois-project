import pandas as pd
import numpy as np
import os
import requests
import json

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



