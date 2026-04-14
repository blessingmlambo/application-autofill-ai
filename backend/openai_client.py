import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def build_prompt(question, company_context, answer_type):
    if answer_type == "short_text":
        return f"""
You are helping complete startup and entrepreneurship application forms.

Answer the question using the company context below.
Keep the answer short, direct, and factual.
Prefer 2 sentences or a very short answer.
Do not invent facts.

Company Context:
{company_context}

Question:
{question}
"""

    if answer_type == "long_text":
        return f"""
You are helping complete startup and entrepreneurship application forms.

Answer the question using the company context below.
Write a strong, clear, professional answer.
Keep it concise but thoughtful, around 3 to 7 sentences unless the question clearly needs less.
Do not invent facts.
Do not use bullet points unless the question strongly suggests a list.

Company Context:
{company_context}

Question:
{question}
"""

    return f"""
You are helping complete startup and entrepreneurship application forms.

Use the company context below to answer the question clearly, truthfully, and concisely.
Do not invent facts.
If the context is insufficient, use only what is provided and keep the answer conservative.

Company Context:
{company_context}

Question:
{question}
"""


def generate_answer(question, company_context, answer_type="fallback"):
    prompt = build_prompt(question, company_context, answer_type)

    response = client.responses.create(
        model="gpt-5.4",
        input=prompt
    )

    return response.output_text


if __name__ == "__main__":
    sample_question = "What problem are you solving?"
    sample_context = {
        "company_name": "Genius UP",
        "problem": "Many students struggle academically because they lack structure, accountability, and targeted support.",
        "solution": "We provide structured academic support through tutoring, academic coaching, and student success systems."
    }

    answer = generate_answer(sample_question, sample_context, "long_text")
    print(answer)