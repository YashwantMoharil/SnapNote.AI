chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize") {
    const transcript = request.transcript;

    fetch("https://snapnote-fa9s.onrender.com/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript })
    })
    .then(res => res.json())
    .then(data => {
      const summary = data.summary || "⚠️ No summary returned.";
      sendResponse({ summary });
    })
    .catch(err => {
      console.error("🔥 Relay API error:", err);
      sendResponse({ summary: `❌ Error: ${err.message}` });
    });

    return true;
  }

  if (request.action === "ask-question") {
   // to be implemented
  }
});
