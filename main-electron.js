import { app, BrowserWindow, Tray, Menu, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import './dist/server.cjs'; // Starts express backend server silently

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let tray = null;

function getBackupFilePath() {
  try {
    const baseDir = app.isPackaged ? app.getPath('userData') : (process.env.APPDATA ? path.join(process.env.APPDATA, 'Izumo') : process.cwd());
    const dataDir = path.join(baseDir, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return path.join(dataDir, 'agenda.json');
  } catch (e) {
    const fallbackDir = path.join(path.dirname(app.getPath('userData')), 'Izumo', 'data');
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    return path.join(fallbackDir, 'agenda.json');
  }
}

// Handle writing automatic data backup to local disk whenever synced from Vercel
ipcMain.on('save-local-backup', (event, data) => {
  try {
    const filePath = getBackupFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed to write backup to local disk agenda.json:', e);
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Izumo Desktop',
    icon: path.join(__dirname, 'public', 'app-icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  const REMOTE_URL = process.env.SYNC_URL || 'https://izumo-three.vercel.app';

  mainWindow.loadURL(REMOTE_URL).catch((err) => {
    console.warn('Failed to load remote sync URL, falling back to local server:', err);
    mainWindow.loadURL('http://localhost:3000');
  });

  // Minimize to tray on close
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
    return false;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'public', 'app-icon.jpg');
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Izumo',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    {
      label: 'Hide to Tray',
      click: () => {
        mainWindow?.hide();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit Izumo',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Izumo Desktop');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });
}

app.whenReady().then(() => {
  if (process.platform === 'win32' && app.isPackaged) {
    app.setLoginItemSettings({
      openAtLogin: true,
    });
  }
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep app running in tray per PRD specs
  }
});
