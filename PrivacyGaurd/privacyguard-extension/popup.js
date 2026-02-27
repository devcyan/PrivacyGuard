document.addEventListener("DOMContentLoaded", () => {
    const output = document.getElementById("output");
    const btnPage = document.getElementById("btn-page");
    const btnSite = document.getElementById("btn-site");

    // Helper function to handle the UI and API calls
    async function runAnalysis(endpoint, payload) {
        output.innerHTML = `<div class="card status-text"> Analyzing... Please wait.</div>`;
        
        try {
            const response = await fetch(`http://localhost:5000/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error("Server responded with an error.");
            
            const result = await response.json();

            // --- NEW LOGIC: Handle Blocked Scraper / Errors gracefully ---
            if (result.risk_level === "Error") {
                output.innerHTML = `
                    <div class="card">
                        <div class="risk-high" style="font-size: 18px;"> Scan Blocked</div>
                        <div class="section">
                            The website blocked our automated scanner from reading its privacy policy in the background.
                        </div>
                        <div class="recommendation">
                            <b>Recommendation:</b> Please navigate to the website's Privacy Policy page manually and click <b>"Scan This Page"</b>.
                        </div>
                    </div>
                `;
                return; // Stop running the rest of the code so the 0/100 score doesn't show
            }

            // --- NORMAL LOGIC: Handle successful scans ---
            let riskClass = "risk-low";
            if (result.risk_score >= 70) riskClass = "risk-high";
            else if (result.risk_score >= 40) riskClass = "risk-medium";

            output.innerHTML = `
                <div class="card">
                    <div class="${riskClass}">Risk Score: ${result.risk_score}/100</div>
                    <div class="section"><b>Risk Level:</b> ${result.risk_level}</div>
                    <div class="section"><b>Summary:</b><br>${result.summary}</div>
                </div>
            `;
        } catch (error) {
            output.innerHTML = `
                <div class="card">
                    <div class="risk-high" style="font-size: 18px;"> Connection Error</div>
                    <div class="section">${error.message === "Failed to fetch" ? "Could not connect to the backend server. Is your Flask app running?" : error.message}</div>
                </div>
            `;
        }
    }

    // BUTTON 1: Analyze Current Page Text
    btnPage.addEventListener("click", async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
                throw new Error("Cannot analyze restricted browser pages.");
            }

            const injectionResults = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.body.innerText,
            });

            const text = injectionResults[0].result || "";
            if (!text.trim()) throw new Error("No readable text found on this page.");

            runAnalysis("analyze", { text: text });
        } catch (error) {
            output.innerHTML = `<div class="card"><div class="risk-high" style="font-size: 18px;"> Error</div><div class="section">${error.message}</div></div>`;
        }
    });

    // BUTTON 2: Automatically Find & Analyze Website Policy
    btnSite.addEventListener("click", async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
                throw new Error("Cannot analyze restricted browser pages.");
            }

            const urlObj = new URL(tab.url);
            const baseUrl = urlObj.origin;

            runAnalysis("analyze_site", { url: baseUrl });
        } catch (error) {
            output.innerHTML = `<div class="card"><div class="risk-high" style="font-size: 18px;"> Error</div><div class="section">${error.message}</div></div>`;
        }
    });
});
