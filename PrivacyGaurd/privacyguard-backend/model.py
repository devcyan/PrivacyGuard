def predict_risk(text):
    text = text.lower()

    score = 0

    # Broader keyword matching
    keywords = {
        "sell": 25,
        "sell your information": 30,
        "third party": 20,
        "third parties": 20,
        "share": 15,
        "share your information": 25,
        "advertising": 15,
        "marketing": 10,
        "biometric": 30,
        "location": 15,
        "gps": 15,
        "retain": 10,
        "retain indefinitely": 20,
        "collect personal information": 15
    }

    for word, value in keywords.items():
        if word in text:
            score += value

    if score > 100:
        score = 100

    if score >= 70:
        level = "High Risk"
        summary = "High privacy risk detected. The policy includes serious data sharing or sensitive data usage."
    elif score >= 40:
        level = "Moderate Risk"
        summary = "Moderate privacy risk detected. Some concerning clauses were found."
    else:
        level = "Low Risk"
        summary = "Low privacy risk detected."

    return {
        "risk_score": score,
        "risk_level": level,
        "summary": summary
    }