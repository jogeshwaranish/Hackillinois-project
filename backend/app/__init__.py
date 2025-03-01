from flask import Flask
from flask_cors import CORS
from .routes import register_routes  # Import a function to register routes
from .config import Config  # Import configuration settings

def create_app():
    """Factory function to create and configure the Flask app."""
    app = Flask(__name__)
    
    # Load configuration from config.py
    app.config.from_object(Config)
    
    # Enable CORS (Cross-Origin Resource Sharing) for frontend-backend communication
    CORS(app)

    # Register routes from the routes module
    register_routes(app)

    return app
