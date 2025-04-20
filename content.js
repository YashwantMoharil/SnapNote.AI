// Updated content.js for preserving summary state on close
let allChunks = [];
let cachedSummaries = [];
let currentChunkIndex = 0;

function extractAllChunks(chunkSize = 1500) {
  const spans = document.evaluate(
    '//*[@data-testid="transcript_list"]/div/div/div/span',
    document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );

  const fullText = [];
  for (let i = 0; i < spans.snapshotLength; i++) {
    const span = spans.snapshotItem(i);
    if (span && span.textContent.trim()) {
      fullText.push(span.textContent.trim());
    }
  }

  const joined = fullText.join(' ');
  const chunks = [];
  for (let i = 0; i < joined.length; i += chunkSize) {
    chunks.push(joined.slice(i, i + chunkSize));
  }
  return chunks;
}

function callLLM(transcript) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: "summarize", transcript },
      (response) => resolve(response.summary || response.error || "⚠️ No summary returned.")
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
    <div style="margin-top: 10px;">
      <button id="prev-summary" class="umn-qa-button" disabled>⏮️ Prev</button>
      <button id="next-summary" class="umn-qa-button">▶️ Next</button>
    </div>
  `;

  document.body.appendChild(panel);
  document.getElementById("close-summary").onclick = () => {
    panel.style.display = "none";
  };

  const output = document.getElementById("summary-output");
  const prevBtn = document.getElementById("prev-summary");
  const nextBtn = document.getElementById("next-summary");

  async function showChunk(index) {
    output.innerText = "⏳ Summarizing...";
    if (cachedSummaries[index]) {
      output.innerText = cachedSummaries[index];
    } else {
      const summary = await callLLM(allChunks[index]);
      cachedSummaries[index] = summary;
      output.innerText = summary;
    }
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === allChunks.length - 1;
  }

  prevBtn.onclick = () => {
    if (currentChunkIndex > 0) {
      currentChunkIndex--;
      showChunk(currentChunkIndex);
    }
  };

  nextBtn.onclick = () => {
    if (currentChunkIndex < allChunks.length - 1) {
      currentChunkIndex++;
      showChunk(currentChunkIndex);
    }
  };

  showChunk(currentChunkIndex);
}

function injectSummaryButton() {
  const btn = document.createElement("button");
  btn.id = "summary-button";
  btn.innerText = "🧠 Summarize Lecture";
  btn.className = "umn-summarize-btn";
  document.body.appendChild(btn);

  btn.addEventListener("click", () => {
    if (!allChunks.length) {
      allChunks = extractAllChunks();
      cachedSummaries = [];
      currentChunkIndex = 0;
    }
    showSummaryPanel();
  });
}

const observer = new MutationObserver(() => {
  const transcriptContainer = document.querySelector('[data-testid="transcript_list"]');
  if (transcriptContainer && !document.getElementById("summary-button")) {
    injectSummaryButton();
  }
});
observer.observe(document.body, { childList: true, subtree: true });
