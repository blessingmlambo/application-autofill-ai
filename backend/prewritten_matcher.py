import json
import os


def load_prewritten_answers():
    base_dir = os.path.dirname(__file__)
    file_path = os.path.join(base_dir, "data", "prewritten_answers.json")

    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    return data.get("answers", [])


def get_prewritten_answer(question):
    q = question.lower().strip()
    answers = load_prewritten_answers()

    for item in answers:
        patterns = item.get("patterns", [])
        for pattern in patterns:
            if pattern in q:
                return item.get("answer")

    return None