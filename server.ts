import express from 'express';
import path from 'path';
import fs from 'fs';
import { AgendaItem, AppSettings } from './src/types';
import { getInitialSeedData } from './src/utils/seedData';
import { isDoneItemExpired, getTodayDateString } from './src/utils/dateUtils';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'agenda.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load or initialize local data
function loadStoredData(): { items: AgendaItem[]; settings: AppSettings } {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed.items && parsed.settings) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading agenda.json, fallback to seed data:', e);
  }
  const seed = getInitialSeedData();
  saveStoredData(seed.items, seed.settings);
  return seed;
}

function saveStoredData(items: AgendaItem[], settings: AppSettings) {
  try {
    const data = { items, settings, updatedAt: new Date().toISOString() };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving agenda.json:', e);
  }
}

let { items: currentItems, settings: currentSettings } = loadStoredData();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get all data
  app.get('/api/data', (req, res) => {
    res.json({ items: currentItems, settings: currentSettings });
  });

  // Add item
  app.post('/api/items', (req, res) => {
    const newItem: AgendaItem = {
      ...req.body,
      id: req.body.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    currentItems.unshift(newItem);
    currentSettings.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    saveStoredData(currentItems, currentSettings);
    res.json({ success: true, item: newItem, settings: currentSettings });
  });

  // Update item
  app.put('/api/items/:id', (req, res) => {
    const { id } = req.params;
    const index = currentItems.findIndex((item) => item.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    currentItems[index] = {
      ...currentItems[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    currentSettings.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    saveStoredData(currentItems, currentSettings);
    res.json({ success: true, item: currentItems[index], settings: currentSettings });
  });

  // Delete item
  app.delete('/api/items/:id', (req, res) => {
    const { id } = req.params;
    currentItems = currentItems.filter((item) => item.id !== id);
    currentSettings.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    saveStoredData(currentItems, currentSettings);
    res.json({ success: true, id, settings: currentSettings });
  });

  // Update Settings
  app.post('/api/settings', (req, res) => {
    currentSettings = {
      ...currentSettings,
      ...req.body,
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    saveStoredData(currentItems, currentSettings);
    res.json({ success: true, settings: currentSettings });
  });

  // Perform Day Rollover (PRD 4.5)
  app.post('/api/rollover', (req, res) => {
    const todayStr = req.body.simulatedDate || getTodayDateString(currentSettings.simulatedCurrentDate);
    const beforeCount = currentItems.length;

    // Filter out items marked done on days before todayStr
    currentItems = currentItems.filter((item) => !isDoneItemExpired(item, todayStr));
    const clearedCount = beforeCount - currentItems.length;

    if (req.body.simulatedDate) {
      currentSettings.simulatedCurrentDate = req.body.simulatedDate;
    }

    currentSettings.lastSyncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    saveStoredData(currentItems, currentSettings);

    res.json({ success: true, clearedCount, items: currentItems, settings: currentSettings });
  });

  // Reset to Seed
  app.post('/api/reset', (req, res) => {
    const seed = getInitialSeedData();
    currentItems = seed.items;
    currentSettings = seed.settings;
    saveStoredData(currentItems, currentSettings);
    res.json({ success: true, items: currentItems, settings: currentSettings });
  });

  // Serve static files from dist directory in production / compiled binary mode
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        next();
      }
    });
  } else if (process.env.NODE_ENV !== 'production') {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('Vite dev server failed to load, running static fallback:', e);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    const url = `http://localhost:${PORT}`;
    console.log(`\n========================================`);
    console.log(`  ✨ Izumo Server & Desktop Window Active!`);
    console.log(`  🌐 URL: ${url}`);
    console.log(`========================================\n`);
  });
}

startServer();
