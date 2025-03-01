from flask import Blueprint, jsonify

# Create a Blueprint
main_bp = Blueprint("main", __name__)

@main_bp.route("/",)
def hello():
    return jsonify({"message": "Hello from Flask!"})

# Function to register the Blueprint with the main app
def register_routes(app):
    app.register_blueprint(main_bp)
