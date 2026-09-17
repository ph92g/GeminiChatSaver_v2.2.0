# GeminiChatSaver_v2.2.0
GeminiChatSaver is a lightweight and convenient extension that allows you to easily back up, store, and export your Google Gemini chat history to your computer.
# GeminiChatSaver - Save & Export Gemini Conversations

**GeminiChatSaver** is a powerful and lightweight browser extension designed to help users easily save, export, and manage their conversation history with Google Gemini. 

---

## 🚀 Key Features & Benefits

* **One-Click Chat Export:** Save full conversations or individual responses directly from the Google Gemini interface.
* **Multiple Output Formats:** Export chats to popular formats such as **Markdown (`.md`)**, **Plain Text (`.txt`)**, **HTML**, or **JSON** for easy backup, sharing, or editing.
* **Preserve Formatting:** Retains code snippets, lists, bold text, and math notation intact during export.
* **Local Storage & Privacy:** All data processing occurs locally within your browser. No conversation data is sent to third-party servers.
* **Clean & Modern UI:** Simple popup interface with options to customize export settings and download formats quickly.
* **Fast & Lightweight:** Minimal impact on browser performance with no background battery drain.

---

## 🌐 Supported Browsers

`GeminiChatSaver` is built using standard Manifest V3 web extensions architecture, making it compatible with all Chromium-based desktop browsers:

| Browser | Compatibility |
| :--- | :--- |
| **Google Chrome** | ✅ Fully Supported (v88+) |
| **Microsoft Edge** | ✅ Fully Supported |
| **Brave Browser** | ✅ Fully Supported |
| **Opera / Opera GX** | ✅ Fully Supported |
| **Vivaldi** | ✅ Fully Supported |

---

## 📁 Extension Structure

```
GeminiChatSaver/
├── manifest.json       # Extension metadata and permissions (Manifest V3)
├── content.js          # Content script interacting with Gemini web interface
├── background.js       # Background service worker for handling tasks
├── popup.html          # Extension popup UI layout
├── popup.js            # Logic for popup interactions and settings
├── styles.css          # Visual styling for the extension popup and injected UI
└── icon.png            # Extension icon
```

---

## 🛠️ Installation Guide (Developer / Unpacked Mode)

Since this extension can be installed manually from source:

1. **Download / Clone** this repository to your local computer.
2. Open your Chromium-based browser (e.g., Chrome) and go to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click on **Load unpacked** (*Tải tiện ích đã giải nén*).
5. Select the `GeminiChatSaver` directory containing `manifest.json`.
6. The extension icon will now appear in your browser toolbar!

---

## 📖 How to Use

1. Navigate to [Google Gemini](https://gemini.google.com).
2. Start or open any conversation.
3. Click the **GeminiChatSaver icon** in your extension toolbar or use the injected action buttons inside the Gemini chat page.
4. Select your preferred format (e.g., Markdown, Text, JSON) and click **Export / Save**.
5. Your chat file will be automatically generated and downloaded to your computer!

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
