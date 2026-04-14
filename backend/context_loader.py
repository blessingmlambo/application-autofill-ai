import json
import os

def load_company_context():
    base_dir = os.path.dirname(__file__)
    file_path = os.path.join(base_dir, "data", "company_profile.json")

    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    return data

if __name__ == "__main__":
    context = load_company_context()
    print(context)