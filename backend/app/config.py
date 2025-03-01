import os

class Config:
    """Flask configuration settings."""
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
    DEBUG = True  # Set to False in production
