from app import create_app
import asyncio
from app.script import updateTransactions
from flask import g

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
