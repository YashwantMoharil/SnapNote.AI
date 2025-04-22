export {};
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize") {
    const transcript = request.transcript;

    fetch("https://snapnote-server-zv9u.onrender.com/summarize", {
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
    const { transcript, question } = request;
    const prompt = `Based on this lecture:\n\n${transcript}\n\nAnswer: ${question}`;

    fetch("https://snapnote-relay.onrender.com/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: prompt })
    })
    .then(res => res.json())
    .then(data => {
      const answer = data.summary || "⚠️ No answer returned.";
      sendResponse({ answer });
    })
    .catch(err => {
      console.error("❌ Q/A Relay Error:", err);
      sendResponse({ answer: `❌ Error: ${err.message}` });
    });

    return true;
  }
});
