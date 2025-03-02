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
    

def initialize_openai() -> OpenAI:
    """Initialize the OpenAI client."""
    openai_api_key=os.getenv("openai-key")
    return OpenAI(api_key=openai_api_key)

client = initialize_openai()

@main_bp.route("/gpt4", methods=["GET"])
def gpt4_summary():
    try:        
        transactions = list(db.purchases.purchases_collection.find({}, {"_id": 0}))

        # Convert transactions into a summarized text format (limit size if necessary)
        transactions_text = "\n".join([str(txn) for txn in transactions[:50]])  # Limit to 50 to avoid token overload
        
        # Prepare GPT-4 request
        response = client.chat.completions.create(
            model= "gpt-4o",
            messages= [
                {"role": "system", "content": "You are a data analyst summarizing food truck trends in a concise and engaging way."},
                {"role": "user", "content": f"""Hey! ✋ Here's your latest food truck trend breakdown:

                - **Top Sellers**: What items are consistently leading sales? Any new trends emerging? 🍽️
                - **Peak Hours**: When is the highest demand, and are there shifts in customer behavior? ⏰
                - **Notable Trends**: Any surprising patterns in pricing, location preference, or seasonal shifts? 📊

                Keep it professional yet engaging, and make sure it's under 100 words. Here’s the transaction data:

                {transactions_text}"""}
            ]
        
        )
        summary = response.choices[0].message.content.strip()
        print (summary);

        return jsonify({"summary": summary}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Function to register the Blueprint with the main app
def register_routes(app):
    app.register_blueprint(main_bp)
