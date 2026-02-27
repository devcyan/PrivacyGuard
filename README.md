# PrivacyGuard

PrivacyGuard is a locally hosted, machine learning-powered Chrome Extension that analyzes website privacy policies and terms of service in real-time. It assigns a 0-100 "Risk Score" based on how a company handles user data, tracks locations, and shares information with third parties.

## 🚀 Features

* **On-Demand AI Scanning:** Prioritizes user privacy. The extension remains completely dormant and reads zero webpage data until the user explicitly clicks the analyze button.
* **Custom PyTorch Backend:** Replaces standard keyword matching with a custom-trained deep learning model to understand the actual context of legal clauses (e.g., distinguishing between "We *never sell* your data" and "We *sell* your data").
* **Local Processing:** The frontend extension communicates with a local Flask API, ensuring that webpage text is never sent to third-party corporate servers.
* **Risk Scoring:** Distills complex legal jargon into an easy-to-read metric (0-100) and provides a quick summary of the most concerning clauses.

## 📂 Project Structure

```text
PrivacyGuard/
│
├── extension/                  # Chrome Extension Frontend
│   ├── manifest.json           # Extension configuration & permissions
│   ├── background.js           # Service worker for background tasks
│   ├── popup.html              # UI layout for the extension popup
│   └── popup.js                # Injection, extraction, and API call logic
│
└── server/                     # Python/Flask Backend
    ├── app.py                  # Flask server and API routing
    ├── model.py                # PyTorch model loading, preprocessing, and inference
    ├── requirements.txt        # Python dependencies (Flask, PyTorch, etc.)
    └── /weights                # Directory for your trained .pth model files
