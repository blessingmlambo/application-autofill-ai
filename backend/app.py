from flask import Flask, request, jsonify
from flask_cors import CORS

from context_loader import load_company_context
from openai_client import generate_answer
from field_mapper import get_fixed_answer
from answer_type_classifier import classify_question
from prewritten_matcher import get_prewritten_answer

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/generate-single-answer", methods=["POST"])
def generate_single_answer():
    try:
        data = request.get_json()
        question = data.get("question")

        if not question:
            return jsonify({"error": "Question is required"}), 400

        company_context = load_company_context()

        fixed_answer = get_fixed_answer(question, company_context)
        prewritten_answer = get_prewritten_answer(question)

        if fixed_answer is not None:
            answer = fixed_answer
        elif prewritten_answer is not None:
            answer = prewritten_answer
        else:
            answer_type = classify_question(question)
            answer = generate_answer(question, company_context, answer_type)

        return jsonify({
            "question": question,
            "answer": answer
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/generate-answers", methods=["POST"])
def generate_answers():
    try:
        data = request.get_json()
        fields = data.get("fields", [])

        if not fields:
            return jsonify({"error": "Fields are required"}), 400

        company_context = load_company_context()
        answers = []

        for field in fields:
            question = field.get("label", "").strip()
            field_id = field.get("fieldId")

            if not question:
                continue

            fixed_answer = get_fixed_answer(question, company_context)
            prewritten_answer = get_prewritten_answer(question)

            if fixed_answer is not None:
                answer = fixed_answer
            elif prewritten_answer is not None:
                answer = prewritten_answer
            else:
                answer_type = classify_question(question)
                answer = generate_answer(question, company_context, answer_type)

            answers.append({
                "fieldId": field_id,
                "question": question,
                "answer": answer
            })

        return jsonify({"answers": answers})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)