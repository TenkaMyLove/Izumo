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
      console.error(e);
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

  // GET /api/data
  if (url.includes('/api/data') && method === 'GET') {
    return res.status(200).json(data);
  }

  // GET /api/items
  if (url.includes('/api/items') && method === 'GET') {
    return res.status(200).json(data.items || []);
  }

  // POST /api/items
  if (url.includes('/api/items') && method === 'POST') {
    const newItem = req.body;
    data.items = data.items || [];
    data.items.unshift(newItem);
    return res.status(200).json(newItem);
  }

  // PUT /api/items/:id
  if (url.includes('/api/items/') && method === 'PUT') {
    const id = url.split('/api/items/')[1]?.split('?')[0];
    const updated = req.body;
    data.items = (data.items || []).map((it: any) => (it.id === id ? { ...it, ...updated } : it));
    return res.status(200).json(updated);
  }

  // DELETE /api/items/:id
  if (url.includes('/api/items/') && method === 'DELETE') {
    const id = url.split('/api/items/')[1]?.split('?')[0];
    data.items = (data.items || []).filter((it: any) => it.id !== id);
    return res.status(200).json({ success: true, id });
  }

  // POST /api/settings
  if (url.includes('/api/settings') && method === 'POST') {
    data.settings = { ...data.settings, ...req.body };
    return res.status(200).json(data.settings);
  }

  return res.status(200).json(data);
}
