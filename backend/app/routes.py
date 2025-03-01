from flask import Blueprint, jsonify
from flask import request
from . import db
from flask import g

# Create a Blueprint
main_bp = Blueprint("main", __name__)

# @main_bp.route("/",)
# def hello():
#     return jsonify({"message": "Hello from Flask!"})


#test to insert data to the data base
@main_bp.route("/")
def test():
    db.purchases.collection.insert_one({"name": "John"})
    return "Connected to the data base!"

@main_bp.route("/location", methods=["POST"])
def location():
    data = request.get_json()  # Get JSON data from request
    print(data)
    lat = data["coords"]["latitude"]
    lon = data["coords"]["longitude"]
    existing_location = db.db.user_collection.find_one({"lat": lat, "lon": lon})
    g.latest_loc = {"lat": lat, "lon": lon}

    if existing_location:
        return jsonify({"message": "Location already exists, no changes made"}), 200

    # Insert the new location
    db.db.user_collection.insert_one({"lat": lat, "lon": lon})
    return jsonify({"message": "Location added successfully"}), 201


# Function to register the Blueprint with the main app
def register_routes(app):
    app.register_blueprint(main_bp)
