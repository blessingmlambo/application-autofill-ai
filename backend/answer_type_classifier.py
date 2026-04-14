def classify_question(question):
    q = question.lower().strip()

    short_patterns = [
        "industry",
        "sector",
        "stage",
        "startup stage",
        "business stage",
        "location",
        "city",
        "country",
        "target market",
        "target audience",
        "website",
        "linkedin",
        "company name",
        "business name",
        "email",
        "phone",
        "contact number",
        "founder name"
    ]

    long_patterns = [
        "what problem",
        "problem are you solving",
        "what are you solving",
        "describe your startup",
        "tell us about your startup",
        "tell us about your company",
        "what does your company do",
        "what do you do",
        "why now",
        "why this idea",
        "why are you applying",
        "why do you want to join",
        "traction",
        "progress",
        "what makes you different",
        "competitive advantage",
        "why this team",
        "founder story",
        "how it works",
        "business model",
        "impact"
    ]

    for pattern in short_patterns:
        if pattern in q:
            return "short_text"

    for pattern in long_patterns:
        if pattern in q:
            return "long_text"

    return "fallback"