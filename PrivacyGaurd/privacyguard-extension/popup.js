document.addEventListener("DOMContentLoaded", async () => {

    const output = document.getElementById("output");

    const data = await chrome.storage.local.get("pageText");
    const text = data.pageText || "";
    console.log(text);
    try {
        const response = await fetch("http://localhost:5000/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        });

        const result = await response.json();

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
        output.innerHTML = `
            <div class="card">
                <div class="risk-high">
                    Could not connect to AI server.
                </div>
                <div class="section">
                    Make sure backend is running.
                </div>
            </div>
        `;
    }

});