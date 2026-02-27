# 🛡️ PrivacyGuard AI

![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg)
![PyTorch](https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=flat&logo=PyTorch&logoColor=white)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**PrivacyGuard AI** is a locally hosted, machine learning-powered Chrome Extension designed to read, analyze, and score website privacy policies and terms of service in real-time. 

Instead of relying on rigid keyword matching, PrivacyGuard AI utilizes a **custom-trained PyTorch deep learning model** to understand the actual context of legal clauses. It distills 10,000-word legal documents into a simple 0-100 "Risk Score," empowering users to understand how their data is tracked, stored, and sold without spending hours reading legalese.

---

## ✨ Key Features

* **True Contextual AI:** Differentiates between negative and positive context. The model knows the difference between *"We will never sell your data"* and *"We sell your data to third-party brokers."*
* **On-Demand Execution (Zero Background Tracking):** Built on Chrome's Manifest V3. The extension remains completely asleep and consumes zero memory until you explicitly click the icon. 
* **100% Local Processing:** Your browsing data never leaves your machine. The frontend extension communicates exclusively with a local Flask API running on your own hardware.
* **Intelligent Text Chunking:** Privacy policies are massive. Our backend automatically chunks long webpage text to bypass standard NLP token limits (e.g., the 512-token limit of BERT-style models), ensuring the entire policy is scanned.
* **Instant Risk Summary:** Distills complex legal jargon into an easy-to-read metric (Low, Moderate, or High Risk) and provides a brief summary of the most alarming clauses found.

---

## 🧠 Model Architecture

This project replaces traditional rule-based algorithms with a custom PyTorch backend. 

* **Framework:** PyTorch & Hugging Face `transformers`
* **Approach:** Sequence Classification / NLP context analysis.
* **Pipeline:** 1. The frontend extracts the active tab's `document.body.innerText`.
  2. The text is sent via POST request to the local Flask API.
  3. The PyTorch model tokenizes the text, handles chunking for long documents, and runs inference.
  4. Logits are converted into a normalized 0-100 risk score and returned to the popup UI.

*(Note to developers: Place your custom trained `.pth` or `safetensors` model weights inside the `server/weights/` directory before running.)*

---

## 📂 Project Structure

```text
PrivacyGuard-AI/
│
├── extension/                  # Chrome Extension (Frontend)
│   ├── manifest.json           # V3 Configuration & permissions
│   ├── background.js           # Service worker
│   ├── popup.html              # Extension UI layout
│   └── popup.js                # Injection, extraction, and API calls
│
└── server/                     # Python AI Server (Backend)
    ├── app.py                  # Flask server and API routing
    ├── model.py                # PyTorch model loading, preprocessing, and inference
    ├── requirements.txt        # Python dependencies
    └── /weights                # Directory for your trained PyTorch models
