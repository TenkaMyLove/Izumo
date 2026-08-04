# 🌸 Izumo — Anime & Task Companion

<p align="center">
  <img src="public/app-icon.png" width="120" height="120" alt="Izumo Icon" style="border-radius: 24px; box-shadow: 0 8px 16px rgba(0,0,0,0.3);" />
</p>

<p align="center">
  <b>A sleek, high-contrast, aesthetic desktop & mobile agenda companion tailored for anime releases, manhwa/manga updates, and daily productivity.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Electron-v43-47848F?style=flat-square&logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express" alt="Express" />
</p>

---

## ✨ Features

- **🌸 Anime & Manhwa Tracker**: Specialized tracking for anime episode releases and manhwa/manga chapter updates, with quick progress incrementing and status workflow.
- **📌 Priority Bento Dashboard**: Visual layout highlighting active, overdue, and today's priority items with vibrant high-contrast status cards.
- **📆 Upcoming Schedule View**: Date-grouped breakdown (Today, Tomorrow, Later) for upcoming releases and scheduled tasks.
- **📊 Status Workflow Board**: Kanban-style categorization across *Pending*, *In Progress*, *Done*, and *Paused/Archived*.
- **⚡ Automated Day Rollover**: Automatic cleanup of completed items from previous days, with custom date simulation for testing recurring tasks.
- **🔊 Custom Audio Cues**: Integrated Web Audio API sound engine with volume gain control and custom sound effects (`Tenka.mp3`).
- **🖥️ Desktop & Mobile View Modes**: Supports full-width desktop mode as well as responsive mobile shell views.
- **💻 Native Windows App**: Packaged with Electron, tray minimize support, and safe user data path handling.
- **💾 Persistent REST Backend**: Express server persisting agenda state in `%APPDATA%/Izumo/data/agenda.json` (or local `data/agenda.json` during dev) with REST API endpoints for seamless device synchronization.

---

## 🛠️ Built With

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Motion (Framer Motion)](https://motion.dev/), [Lucide Icons](https://lucide.dev/)
- **Backend / Server**: [Express](https://expressjs.com/), [Vite](https://vitejs.dev/), [esbuild](https://esbuild.github.io/), [tsx](https://github.com/privatenumber/tsx)
- **Desktop Environment**: [Electron](https://www.electronjs.org/), [Electron-Builder](https://www.electron.build/)

---

## 📂 Project Structure

```text
Izumo/
├── api/                   # Serverless / API integration handlers
├── data/                  # Persistent local data store (agenda.json)
├── dist/                  # Built frontend and server bundle outputs
├── public/                # Static assets & app icon
├── release/               # Packaged Electron binaries & installers
├── src/
│   ├── components/        # React components (Dashboard, Anime/Manhwa, Shells, Modals)
│   ├── utils/             # Sound utilities, date helpers, recurring task rules
│   ├── App.tsx            # Main application logic & API state manager
│   ├── index.css          # Tailwind CSS styles & animations
│   └── types.ts           # Shared TypeScript interfaces & types
├── main-electron.cjs      # Electron main process entry script
├── server.ts              # Express API server & Vite development middleware
├── Izumo.bat              # Batch launch script for Windows
├── Izumo.vbs              # Silent VBScript launcher for background execution
├── package.json           # Scripts, dependencies, and Electron-Builder configuration
└── vite.config.ts         # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
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

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express server with live Vite development middleware on port `3000`. |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`). |
| `npm run build` | Compiles the React frontend using Vite into `dist/`. |
| `npm run build:server` | Bundles `server.ts` into CJS output `dist/server.cjs` using esbuild. |
| `npm run start` | Runs the compiled production server (`node dist/server.cjs`). |
| `npm run electron:start` | Builds the app and launches it inside a native Electron window. |
| `npm run build:exe` | Builds the app and packages a standalone executable & installer via Electron-Builder. |

---

## 🖥️ Running as a Native Windows App

### Launching via Scripts:
- **`Izumo.bat`**: Double-click to start the Express server and launch the app in your browser or desktop window.
- **`Izumo.vbs`**: Runs `Izumo.bat` silently in the background without keeping a command prompt window visible.

### Building Standalone Executables:
```bash
npm run build:exe
```
Output files will be generated in the `release/` directory:
- `release/win-unpacked/Izumo.exe` (Portable Desktop App)
- `release/Izumo Setup 0.0.0.exe` (Windows NSIS Installer)

### Windows Startup & Data Storage:
- **User Data Storage**: Application state is stored in user profile space (`%APPDATA%\Izumo\data\agenda.json` on Windows) to prevent system directory (`system32`) permission issues during automatic startup or system reboots.
- **Auto-Launch Scoping**: Automatic startup at Windows login (`openAtLogin`) is safely scoped to installed production builds (`app.isPackaged`).

---

## 🔌 API Endpoints

The backend Express server provides RESTful endpoints for state management:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Server health check and current timestamp. |
| `GET` | `/api/data` | Fetches all agenda items and application settings. |
| `POST` | `/api/items` | Creates a new agenda or tracking item. |
| `PUT` | `/api/items/:id` | Updates an existing item by ID. |
| `DELETE` | `/api/items/:id` | Deletes an item by ID. |
| `POST` | `/api/settings` | Updates application settings (sound, theme, simulation date). |
| `POST` | `/api/rollover` | Triggers day rollover processing to clear completed past items. |
| `POST` | `/api/reset` | Resets all data back to initial seed data. |

---

<p align="center">Made with ❤️ for Anime & Task Productivity</p>
