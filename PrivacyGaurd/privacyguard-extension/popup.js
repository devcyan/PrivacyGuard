document.addEventListener("DOMContentLoaded", async () => {
    const output = document.getElementById("output");

    try {
        // 1. Get the currently active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Ensure we actually have a tab and it's not a restricted chrome:// URL
        if (!tab || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
            throw new Error("Cannot analyze restricted browser pages.");
        }

        // 2. Inject a function to extract the text
        const injectionResults = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.body.innerText,
        });

        // 3. Get the result of the injected function
        const text = injectionResults[0].result || "";

        if (!text.trim()) {
            throw new Error("No readable text found on this page.");
        }

        // 4. Send to your local Flask server
        const response = await fetch("http://localhost:5000/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error("Server responded with an error.");
        }

        const result = await response.json();

        // 5. Display the results
        let riskClass = "risk-low";
        if (result.risk_score >= 70) {
            riskClass = "risk-high";
        } else if (result.risk_score >= 40) {
            riskClass = "risk-medium";
        }

        output.innerHTML = `
            <div class="card">
                <div class="${riskClass}">
                    Risk Score: ${result.risk_score}/100
                </div>
                <div class="section">
                    <b>Risk Level:</b> ${result.risk_level}
                </div>
                <div class="section">
                    <b>Summary:</b><br>
                    ${result.summary}
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Analysis Error:", error);
        output.innerHTML = `
            <div class="card">
                <div class="risk-high">
                    Analysis Failed
                </div>
                <div class="section">
                    ${error.message === "Failed to fetch" ? "Could not connect to AI server. Is your Flask backend running?" : error.message}
                </div>
            </div>
        `;
    }
});
