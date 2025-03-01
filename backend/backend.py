# backend.py
from flask import Flask
import asyncio
import threading
import time
from app import create_app  # Assuming you have a create_app function
from app.script import updateTransactions, get_latest_location

# Function to run the async task in a background thread
def run_async_background():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    while True:
        try:
            # Get latest location data
            latest_loc = get_latest_location()
            
            # If it's a tuple (jsonify response with status code), extract the data
            if isinstance(latest_loc, tuple):
                # No transactions found, use empty dict
                latest_loc = {}
            
            # Run the update once
            loop.run_until_complete(updateTransactions(latest_loc))
            
            # Sleep before the next check
            time.sleep(30)  # Check every 30 seconds
            
        except Exception as e:
            print(f"Error in background task: {e}")
            time.sleep(60)  # Wait a bit longer if there's an error

if __name__ == "__main__":
    # Start background thread
    background_thread = threading.Thread(target=run_async_background, daemon=True)
    background_thread.start()
    
    # Create and run the Flask app
    app = create_app()
    app.run(debug=True)