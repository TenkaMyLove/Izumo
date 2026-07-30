import fs from 'fs';
import path from 'path';

// Memory fallback store for Vercel Serverless Function environment
let memoryStore: any = null;

function getAgendaData() {
  if (memoryStore) return memoryStore;
  const filePath = path.join(process.cwd(), 'data', 'agenda.json');
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      memoryStore = JSON.parse(content);
      return memoryStore;
    } catch (e) {
      console.error('Error reading agenda.json:', e);
    }
  }
  return {
    items: [],
    settings: {
      soundEnabled: true,
      volume: 0.8,
      syncCode: 'AG-9842',
      simulatedCurrentDate: new Date().toISOString().split('T')[0],
      customSoundData: null,
    },
  };
}

export default function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url = '', method = 'GET' } = req;
  const data = getAgendaData();

  // GET /api/health
  if (url.includes('/api/health') && method === 'GET') {
    return res.status(200).json({ status: 'ok', time: new Date().toISOString() });
  }

  // GET /api/data
  if (url.includes('/api/data') && method === 'GET') {
    return res.status(200).json({ items: data.items || [], settings: data.settings });
  }

  // GET /api/items
  if (url.includes('/api/items') && method === 'GET') {
    return res.status(200).json(data.items || []);
  }

  // POST /api/items
  if (url.includes('/api/items') && method === 'POST') {
    const body = req.body || {};
    const newItem = {
      ...body,
      id: body.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category: body.category || 'Anime',
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.items = data.items || [];
    data.items.unshift(newItem);
    return res.status(200).json({ success: true, item: newItem, settings: data.settings });
  }

  // PUT /api/items/:id
  if (url.includes('/api/items/') && method === 'PUT') {
    const id = url.split('/api/items/')[1]?.split('?')[0];
    const updated = req.body || {};
    let updatedItem: any = null;

    data.items = (data.items || []).map((it: any) => {
      if (it.id === id) {
        updatedItem = { ...it, ...updated, updatedAt: new Date().toISOString() };
        return updatedItem;
      }
      return it;
    });

    if (!updatedItem && id) {
      updatedItem = { id, ...updated, updatedAt: new Date().toISOString() };
    }

    return res.status(200).json({ success: true, item: updatedItem, settings: data.settings });
  }

  // DELETE /api/items/:id
  if (url.includes('/api/items/') && method === 'DELETE') {
    const id = url.split('/api/items/')[1]?.split('?')[0];
    data.items = (data.items || []).filter((it: any) => it.id !== id);
    return res.status(200).json({ success: true, id, settings: data.settings });
  }

  // POST /api/settings
  if (url.includes('/api/settings') && method === 'POST') {
    data.settings = { ...data.settings, ...(req.body || {}) };
    return res.status(200).json({ success: true, settings: data.settings });
  }

  // POST /api/rollover
  if (url.includes('/api/rollover') && method === 'POST') {
    const todayStr = req.body?.simulatedDate || new Date().toISOString().split('T')[0];
    const beforeCount = (data.items || []).length;
    data.items = (data.items || []).filter((item: any) => {
      if (!item.isDone) return true;
      const doneDate = item.doneAt ? item.doneAt.split('T')[0] : '';
      return doneDate >= todayStr;
    });
    const clearedCount = beforeCount - data.items.length;
    if (req.body?.simulatedDate) {
      data.settings.simulatedCurrentDate = req.body.simulatedDate;
    }
    return res.status(200).json({ success: true, items: data.items, settings: data.settings, clearedCount });
  }

  // POST /api/reset
  if (url.includes('/api/reset') && method === 'POST') {
    const filePath = path.join(process.cwd(), 'data', 'agenda.json');
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        memoryStore = JSON.parse(content);
      } catch (e) {
        console.error(e);
      }
    }
    const freshData = getAgendaData();
    return res.status(200).json({ success: true, items: freshData.items || [], settings: freshData.settings });
  }

  return res.status(200).json(data);
}
