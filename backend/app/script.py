import pandas as pd
import numpy as np
import os
import requests
import json

url = f"http://api.reimaginebanking.com/enterprise/merchants?key=6ec27d1e026837afbeec1914d11ceb58"
response = requests.get(url)
print(response.json())
