# 🌸 Izumo — Anime & Task Companion

<p align="center">
  <img src="public/app-icon.png" width="120" height="120" alt="Izumo Icon" style="border-radius: 24px;" />
</p>

<p align="center">
  <b>A sleek, aesthetic desktop & mobile agenda companion tailored for anime, manhwa, and daily tasks.</b>
</p>

---

## ✨ Features

- **🌸 Anime & Manhwa Tracker**: Track episode releases, chapter updates, watched status, and auto-increment next episode titles.
- **📌 Priority Bento Dashboard**: Visual layout highlighting active, overdue, and today's priority items.
- **🔊 Custom Audio Notifications**: Built-in Web Audio sound effects with volume gain control (`Tenka.mp3`).
- **🖥️ Native Windows Desktop App**: Runs as a standalone Windows window using Electron with native Taskbar System Tray integration.
- **📱 Responsive Mobile Experience**: Automatic edge-to-edge view on mobile screens.
- **🔄 Live Device Sync**: Built-in sync state sharing across devices.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)

### 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TenkaMyLove/Izumo.git
   cd Izumo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in Development Mode:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🖥️ Running as a Native Desktop App

### Run Locally with Electron:
```bash
npm run build && npm run build:server && npm run electron:start
```

### Build Executable & Installer:
```bash
npm run build:exe
```
This generates the standalone executable at:
- `release/win-unpacked/Izumo.exe` (Portable Desktop App)
- `release/Izumo Setup 0.0.0.exe` (Windows Installer)

---

## 🛠️ Built With

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons
- **Backend / Server**: Express, Vite, esbuild
- **Desktop Packaging**: Electron, Electron-Builder

---

<p align="center">Made with ❤️ for Anime & Task Productivity</p>
