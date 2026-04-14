import requests

url = "http://127.0.0.1:5000/generate-single-answer"

data = {
    "question": "What problem are you solving?"
}

response = requests.post(url, json=data)

print(response.json())