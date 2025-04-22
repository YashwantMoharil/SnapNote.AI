let cachedSummaries = JSON.parse(
  localStorage.getItem("snapnote-cache") || "{}"
);
let cachedKeys = JSON.parse(localStorage.getItem("snapnote-keys") || "[]");
const MAX_CACHE = 10;
let currentIndex = cachedKeys.length - 1;

function getTranscriptTuple(currMinute) {
  const minutes = [];
  for (let i = Math.max(0, currMinute - 7); i <= currMinute + 3; i++) {
    minutes.push(i);
  }

  const transcriptTexts = [];

  for (const min of minutes) {
    const xpath = `//div[contains(@class, "caption__caption-time") and contains(text(), "${min}:")]/following-sibling::div/span`;
    const iterator = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    );

    let node = iterator.iterateNext();
    while (node) {
      transcriptTexts.push(node.textContent.trim());
      node = iterator.iterateNext();
    }
  }

  return transcriptTexts.join(" ");
}

function getCurrentVideoMinute() {
  const slider = document.evaluate(
    "(//*[@aria-valuenow])[1]",
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (slider) {
    const seconds = parseInt(slider.getAttribute("aria-valuenow"), 10);
    return Math.floor(seconds / 60);
  }
  return null;
}

function callLLM(transcript) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: "summarize", transcript },
      (response) =>
        resolve(response.summary || response.error || "⚠️ No summary returned.")
    );
  });
}

function showSummaryPanel() {
  let panel = document.getElementById("summary-panel");
  if (panel) {
    panel.style.display = "block";
    return;
  }

  panel = document.createElement("div");
  panel.id = "summary-panel";
  panel.className = "umn-summary-box";

  panel.innerHTML = `
    <button id="close-summary" class="umn-close-btn">✖</button>
    <h3>🧠 Lecture Summarizer</h3>
    <div id="summary-output" class="umn-summary-output">Click ▶️ to begin summarizing.</div>
    <div style="margin-top: 10px; display: flex; gap: 8px;">
      <button id="prev-summary" class="umn-qa-button" disabled>⏮️ Prev</button>
      <button id="next-summary" class="umn-qa-button">▶️ Get summary from current time</button>
      <button id="forward-summary" class="umn-qa-button" disabled>⏭️ Next</button>
    </div>
  `;

  document.body.appendChild(panel);
  document.getElementById("close-summary").onclick = () => {
    panel.style.display = "none";
  };

  const output = document.getElementById("summary-output");
  const prevBtn = document.getElementById("prev-summary");
  const nextBtn = document.getElementById("next-summary");
  const forwardBtn = document.getElementById("forward-summary");

  function updateNavButtons() {
    prevBtn.disabled = currentIndex <= 0;
    forwardBtn.disabled = currentIndex >= cachedKeys.length - 1;
  }

  function displaySummary(index) {
    let key = cachedKeys[index];
    const summary = cachedSummaries[key];
    const range = key.split("-").map((m) => parseInt(m, 10));
    output.innerHTML = `<h4>${key}:00 to ${
      +key + 10
    }:00</h4><p>${summary}</p>`;
    currentIndex = index;
    updateNavButtons();
  }

  prevBtn.onclick = () => {
    if (currentIndex > 0) {
      displaySummary(currentIndex - 1);
    }
  };

  forwardBtn.onclick = () => {
    if (currentIndex < cachedKeys.length - 1) {
      displaySummary(currentIndex + 1);
    }
  };

  nextBtn.onclick = async () => {
    const minute = getCurrentVideoMinute();
    if (minute === null) return;

    const rangeStart = Math.max(0, minute - 7);
    const rangeEnd = minute + 3;
    const key = `${minute}`;

    nextBtn.innerText = `▶️ Get summary from ${minute}:00`;
    output.innerText = "⏳ Summarizing...";

    let displayKey = null;
    for (let offset = 0; offset <= 2; offset++) {
      const altKey = `${minute - offset}`;
      if (cachedSummaries[altKey]) {
        displayKey = altKey;
        break;
      }
    }

    if (displayKey) {
      const idx = cachedKeys.indexOf(key);
      displaySummary(idx);
    } else {
      const transcript = getTranscriptTuple(minute);
      const summary = await callLLM(transcript);
      cachedSummaries[key] = summary;
      cachedKeys.push(key);

      if (cachedKeys.length > MAX_CACHE) {
        const oldest = cachedKeys.shift();
        delete cachedSummaries[oldest];
      }

      localStorage.setItem("snapnote-cache", JSON.stringify(cachedSummaries));
      localStorage.setItem("snapnote-keys", JSON.stringify(cachedKeys));

      displaySummary(cachedKeys.length - 1);
    }
  };

  if (cachedKeys.length > 0) {
    displaySummary(cachedKeys.length - 1);
  }
}

function injectSummaryButton() {
  const btn = document.createElement("button");
  btn.id = "summary-button";
  btn.innerText = "🧠 Summarize Lecture";
  btn.className = "umn-summarize-btn";
  document.body.appendChild(btn);

  btn.addEventListener("click", () => {
    showSummaryPanel();
  });
}

const observer = new MutationObserver(() => {
  const transcriptContainer = document.querySelector(
    '[data-testid="transcript_list"]'
  );
  if (transcriptContainer && !document.getElementById("summary-button")) {
    injectSummaryButton();
  }
});
observer.observe(document.body, { childList: true, subtree: true });
