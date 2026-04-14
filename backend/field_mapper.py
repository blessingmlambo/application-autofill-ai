def get_fixed_answer(question, company_context):
    q = question.lower().strip()

    founder_name = company_context.get("founder_name", "")
    email = company_context.get("email", "")
    phone = company_context.get("phone", "")
    company_name = company_context.get("company_name", "")
    website = company_context.get("website", "")

    if "your name" in q or "full name" in q or "founder name" in q or "applicant name" in q:
        return founder_name

    if "email" in q or "email address" in q:
        return email

    if "phone" in q or "contact number" in q or "mobile number" in q or "telephone" in q:
        return phone

    if "business name" in q or "company name" in q or "startup name" in q:
        return company_name

    if "website" in q or "business website" in q or "company website" in q:
        return website

    return None