from flask import Blueprint, jsonify
from flask import request
from . import db
from flask import g
from app.script import updateTransactions, convert_to_geojson, unique_path
from openai import OpenAI
from dotenv import load_dotenv
import os
import pandas as pd
load_dotenv()
import json

# Create a Blueprint
main_bp = Blueprint("main", __name__)

@main_bp.route("/",)
def hello():
    return jsonify({"message": "Hello from Flask!"})


#test to insert data to the data base
# @main_bp.route("/")
# def test():
#     db.purchases.collection.insert_one({"name": "John"})
#     return "Connected to the data base!"

@main_bp.route("/location", methods=["POST"])
def location():
    data = request.get_json()  # Get JSON data from request
    print(data)
    lat = data["coords"]["latitude"]
    lon = data["coords"]["longitude"]
    existing_location = db.db.user_collection.find_one({"lat": lat, "lon": lon})
    latest_loc = {"lat": lat, "lon": lon}
    updateTransactions(latest_loc)

    if existing_location:
        return jsonify({"message": "Location already exists, no changes made"}), 200

    else:
        db.db.user_collection.insert_one({"lat": lat, "lon": lon})
        return jsonify({"message": "Location added successfully"}), 201

@main_bp.route("/geojson",methods=["GET"])
def geojson():
    transactions = list(db.purchases.purchases_collection.find())
    geojson_data = convert_to_geojson(transactions)
    # return jsonify({"message": "Hello from Flask!"})
    return jsonify(geojson_data), 201

@main_bp.route("/unique_path", methods=["GET"])
def uniquepath():
    set_of_paths = unique_path()  # returns a set with {lat, long}
    return jsonify({
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": list(set_of_paths),
      }
    }
  ]
}), 200
    
    
@main_bp.route("/optimal", methods=["GET"])
def optimal_route():
    transactions = list(db.purchases.purchases_collection.find())
    df = pd.DataFrame.from_dict(transactions, orient='columns')
    
    # Group by lat and lon, and aggregate the amount
    grouped_df = df.groupby(['lon', 'lat']).agg("sum", numeric_only=True).reset_index()
    
    # Sort the DataFrame by the sum of amounts (descending)
    sorted_df = grouped_df.sort_values('amount', ascending=False)
    
    # Create a set of coordinates as tuples in (lat, lon) order
    ranked_coords = []
    for rank, row in enumerate(sorted_df.itertuples(), start=1):
        # The coordinate will be saved as (lon, lat) and ranking is added as a field
        ranked_coords.append({
            "coordinate": [row.lon, row.lat],
            "standing": rank
        })
    
    return jsonify({
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
              "rankedCoordinates": ranked_coords
          },
          "geometry": {
            "type": "LineString",
            "coordinates": [entry["coordinate"] for entry in ranked_coords]
          }
        }
      ]
    }), 200
    

@main_bp.route("/gpt4", methods=["GET"])
def get_foodtruck_summary():
    transactions = list(db.purchases.purchases_collection.find({}, {"_id": 0}))  # Get transactions (exclude MongoDB _id)
    
    client = OpenAI(api_key=os.getenv("openai-key"))
    
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You summarize food truck transaction data"
                },
                {
                    "role": "user",
                    "content": f"Summarize this food truck transaction data in a human-friendly way:\n{json.dumps(transactions)}"
                }
            ]
        )
        
        # Access the response content correctly
        summary = completion.choices[0].message.content
        return jsonify({"summary": summary})

    except Exception as e:
        print(f"OpenAI API error: {str(e)}")  # Log the error for debugging
        return jsonify({"error": "Failed to fetch summary.", "details": str(e)}), 500

# Function to register the Blueprint with the main app
def register_routes(app):
    app.register_blueprint(main_bp)
