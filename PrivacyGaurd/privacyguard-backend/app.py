from flask import Flask, request, jsonify
from flask_cors import CORS
from model import predict_risk
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

app = Flask(__name__)
CORS(app)

# Original endpoint: Analyzes whatever text you send it
@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    text = data.get("text", "")
    result = predict_risk(text)
    return jsonify(result)

# New endpoint: Hunts down the privacy policy from a URL
@app.route("/analyze_site", methods=["POST"])
def analyze_site():
    data = request.get_json()
    base_url = data.get("url", "")

    if not base_url:
        return jsonify({"risk_score": 0, "risk_level": "Error", "summary": "No URL provided."})

    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        
        # 1. Fetch the homepage
        response = requests.get(base_url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        policy_url = None
        
        # 2. Hunt for the privacy policy link
        for a_tag in soup.find_all('a', href=True):
            text = a_tag.text.lower()
            href = a_tag['href'].lower()
            if 'privacy' in text or 'privacy' in href:
                # Convert relative links (like /privacy) to absolute links (https://site.com/privacy)
                policy_url = urljoin(base_url, a_tag['href'])
                break
        
        # 3. If we couldn't find a link, guess the most common URL
        if not policy_url:
            policy_url = urljoin(base_url, '/privacy')

        print(f"Targeting Privacy Policy at: {policy_url}")

        # 4. Fetch the actual privacy policy page
        policy_response = requests.get(policy_url, headers=headers, timeout=10)
        policy_soup = BeautifulSoup(policy_response.text, 'html.parser')
        
        # 5. Extract readable text (paragraphs and list items)
        paragraphs = policy_soup.find_all(['p', 'li'])
        extracted_text = " ".join([p.get_text() for p in paragraphs])

        if len(extracted_text) < 100:
            return jsonify({
                "risk_score": 0, 
                "risk_level": "Error", 
                "summary": f"Could not extract enough text from {policy_url}. The site might be blocking scrapers."
            })

        # 6. Feed the scraped text into your AI model
        result = predict_risk(extracted_text)
        
        # Add a note so the user knows which URL was actually analyzed
        result["summary"] = f"(Analyzed: {policy_url})<br><br>" + result.get("summary", "")
        
        return jsonify(result)

    except Exception as e:
        print(f"Scraping Error: {e}")
        return jsonify({
            "risk_score": 0,
            "risk_level": "Error",
            "summary": "Failed to connect to the website or find a privacy policy."
        })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
