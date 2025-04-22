# 📚 SnapNote.AI — Chrome Extension for AI-Powered Lecture Summarization

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Built With](https://img.shields.io/badge/Built_with-FastAPI%20%7C%20JavaScript%20%7C%20LLMs-9cf)
![Users](https://img.shields.io/badge/Used_by-300%2B_students-success)

SnapNote.AI is a **Chrome extension** that automatically summarizes lecture segments from the [UMN Unite](https://media.unite.umn.edu/) platform based on where your video is paused or playing. It gives students instant, AI-generated summaries and supports real-time Q&A using OpenRouter-hosted LLaMA models through a secure FastAPI backend.

---

## 🚀 Features

- 🎯 Summarizes **3-minute lecture segments** based on your current video timestamp
- ⚡ Powered by **LLaMA models** via [OpenRouter](https://openrouter.ai)
- 🔒 CORS-locked FastAPI relay server ensures only extension-origin requests
- 🧠 Human-like summaries designed to mimic top-student notes
- 📥 Summaries are cached locally for fast access and navigation
- 🗂️ PDF/Docx export and full Q&A engine --- coming soon

---

## 🧩 Installation

1. Clone or download the repo  
2. Open Chrome → `chrome://extensions` → Enable **Developer Mode**  
3. Click **Load unpacked** → Select the `snapnote-extension` directory  
4. Navigate to [UMN Unite](https://media.unite.umn.edu/), start a video  
5. Click the 🧠 **Summarize Lecture** button!

---

## ⚙️ Tech Stack

| Frontend        | Backend        | AI Model         |
|-----------------|----------------|------------------|
| Chrome Extension (JS + CSS) | FastAPI (Python) | LLaMA via OpenRouter |

---

## 🔐 Security

- All backend requests are restricted via `CORS` to only accept messages from the verified extension origin.
- Environment variables (`OPENROUTER_API_KEY`, `MODEL_NAME`) are stored securely server-side and never exposed to the frontend.

---

## 🌐 Live Demo

→ [SnapNote Backend (Live)](https://snapnote-fa9s.onrender.com/summarize)  
→ [Unlisted Chrome Web Store (optional)](https://chrome.google.com/webstore/detail/your-extension-id)

---

## 📈 Roadmap

- [x] Chunked lecture summarization (live)
- [x] Caching and navigation between past summaries
- [ ] 🎤 Q&A mode from cached lecture context
- [ ] 🧾 Export summaries as PDF/Docx
- [ ] 📊 Usage metrics dashboard
- [ ] Extension Store Publishing

---

## 🧠 Sample Prompt (Used Internally)

```json
{
  "role": "system",
  "content": "You are an intelligent assistant helping students understand lectures. Summarize the professor’s explanations into clear, concise notes that sound like they’re written by a top student. This segment may continue from earlier. Keep it coherent."
}
