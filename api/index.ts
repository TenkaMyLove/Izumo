import fs from 'fs';
import path from 'path';

// Memory store dictionary per syncCode (multi-tenant room isolation)
const storesByCode: Record<string, { items: any[]; settings: any }> = {};

function extractSyncCode(req: any): string {
  const headerCode = req.headers?.['x-sync-code'] || req.headers?.['x-sync-id'];
  const queryCode = req.query?.code || req.query?.syncCode;
  const bodyCode = req.body?.syncCode;
  return (headerCode || queryCode || bodyCode || 'XX-1234').toString().trim().toUpperCase();
}

function getStoreForCode(syncCode: string) {
  const normalized = (syncCode || 'XX-1234').toString().trim().toUpperCase();
  if (!storesByCode[normalized]) {
    const filePath = path.join(process.cwd(), 'data', 'agenda.json');
    if (normalized === 'XX-1234' && fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        storesByCode[normalized] = {
          items: parsed.items || [],
          settings: { ...(parsed.settings || {}), syncCode: 'XX-1234' },
        };
        return storesByCode[normalized];
      } catch (e) {
        console.error('Error reading agenda.json:', e);
      }
    }

    storesByCode[normalized] = {
      items: [],
      settings: {
        soundEnabled: true,
        volume: 0.8,
        syncCode: normalized,
        simulatedCurrentDate: new Date().toISOString().split('T')[0],
        customSoundData: null,
      },
    };
  }
  return storesByCode[normalized];
}

export default function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-sync-code,x-sync-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url = '', method = 'GET' } = req;
  const syncCode = extractSyncCode(req);
  const data = getStoreForCode(syncCode);

  // GET /api/health
  if (url.includes('/api/health') && method === 'GET') {
    return res.status(200).json({ status: 'ok', syncCode, time: new Date().toISOString() });
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
      updatedAt: body.updatedAt || new Date().toISOString(),
    };
    data.items = data.items || [];
    const existingIndex = data.items.findIndex((it: any) => it && it.id === newItem.id);
    if (existingIndex !== -1) {
      data.items[existingIndex] = { ...data.items[existingIndex], ...newItem };
    } else {
      data.items.unshift(newItem);
    }
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
    data.settings = { ...data.settings, ...(req.body || {}), syncCode };
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
    const fresh = getStoreForCode(syncCode);
    return res.status(200).json({ success: true, items: fresh.items || [], settings: fresh.settings });
  }

  return res.status(200).json(data);
}
