document.addEventListener("DOMContentLoaded", async () => {

    const output = document.getElementById("output");

    const result = await chrome.storage.local.get("pageText");
    const text = (result.pageText || "").toLowerCase();

    let score = 0;

    // Risk rules
    if (text.includes("sell")) score += 30;
    if (text.includes("third-party")) score += 20;
    if (text.includes("biometric")) score += 40;
    if (text.includes("location")) score += 20;
    if (text.includes("retain indefinitely")) score += 20;

    if (score > 100) score = 100;

    setTimeout(() => {

        let color = "green";
        if (score > 60) color = "red";
        else if (score > 30) color = "orange";

        output.innerHTML =
            `<b style="color:${color}; font-size:18px;">
            Privacy Risk Score: ${score}/10
            </b><br><br>
            Automated policy analysis complete.`;

    }, 1200);
});