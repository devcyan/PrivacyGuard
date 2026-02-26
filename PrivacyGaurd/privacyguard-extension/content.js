function extractText() {
    try {
        const text = document.body.innerText;
        chrome.storage.local.set({ pageText: text });
        console.log("Text stored successfully");
    } catch (error) {
        console.error("Extraction failed:", error);
    }
}

// Wait until full page load
window.addEventListener("load", () => {
    setTimeout(extractText, 1000);
});