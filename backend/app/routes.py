from flask import Blueprint, jsonify
from flask import request
from . import db

# Create a Blueprint
main_bp = Blueprint("main", __name__)

# @main_bp.route("/",)
# def hello():
#     return jsonify({"message": "Hello from Flask!"})


#test to insert data to the data base
@main_bp.route("/")
def test():
    db.db.collection.insert_one({"name": "John"})
    return "Connected to the data base!"

@main_bp.route("/location", methods=["POST"])
def location():
    data = request.get_json()  # Get JSON data from request
    print(data)  # Print to console
    return {"message": "Data received", "data": data}, 200


# Function to register the Blueprint with the main app
def register_routes(app):
    app.register_blueprint(main_bp)
