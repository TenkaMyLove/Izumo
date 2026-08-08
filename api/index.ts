import fs from 'fs';
import path from 'path';

// Memory store dictionary per syncCode (multi-tenant room isolation)
const storesByCode: Record<string, { items: any[]; settings: any }> = {};

// /tmp is writable on Vercel serverless — persists across WARM invocations within the same container
const TMP_DIR = '/tmp/izumo-data';

function getTmpPath(syncCode: string): string {
  const safe = syncCode.replace(/[^a-z0-9]/gi, '_').toUpperCase();
  return path.join(TMP_DIR, `${safe}.json`);
}

function persistToTmp(syncCode: string, store: { items: any[]; settings: any }): void {
  try {
    if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
    fs.writeFileSync(getTmpPath(syncCode), JSON.stringify({ ...store, updatedAt: new Date().toISOString() }), 'utf-8');
  } catch (_) {
    // /tmp write failure is non-fatal
  }
}

function loadFromTmp(syncCode: string): { items: any[]; settings: any } | null {
  try {
    const p = getTmpPath(syncCode);
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  } catch (_) {}
  return null;
}

function extractSyncCode(req: any): string {
  const headerCode = req.headers?.['x-sync-code'] || req.headers?.['x-sync-id'];
  const queryCode = req.query?.code || req.query?.syncCode;
  const bodyCode = req.body?.syncCode;
  return (headerCode || queryCode || bodyCode || 'XX-1234').toString().trim().toUpperCase();
}

function getStoreForCode(syncCode: string) {
  const normalized = (syncCode || 'XX-1234').toString().trim().toUpperCase();
  if (!storesByCode[normalized]) {
    // 1. Try /tmp first — survives warm restarts within the same Vercel container
    const tmpData = loadFromTmp(normalized);
    if (tmpData && Array.isArray(tmpData.items)) {
      storesByCode[normalized] = { items: tmpData.items, settings: tmpData.settings || {} };
      return storesByCode[normalized];
    }

    // 2. For default code only: try committed data/agenda.json fallback
    if (normalized === 'XX-1234') {
      const filePath = path.join(process.cwd(), 'data', 'agenda.json');
      if (fs.existsSync(filePath)) {
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
    }

    // 3. Fresh empty store (custom sync code cold-start)
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

/** Timestamp-aware merge: the item with the newer updatedAt wins. */
function mergeItems(serverItems: any[], incomingItems: any[]): any[] {
  const merged = new Map<string, any>(serverItems.map((i: any) => [i.id, i]));
  for (const incoming of incomingItems) {
    if (!incoming?.id) continue;
    const existing = merged.get(incoming.id);
    if (!existing) {
      merged.set(incoming.id, incoming);
    } else {
      const existingTs = new Date(existing.updatedAt || 0).getTime();
      const incomingTs = new Date(incoming.updatedAt || 0).getTime();
      if (incomingTs > existingTs) {
        merged.set(incoming.id, incoming);
      }
    }
  }
  return Array.from(merged.values());
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
    return res.status(200).json({ status: 'ok', syncCode, itemCount: data.items.length, time: new Date().toISOString() });
  }

  // GET /api/data
  if (url.includes('/api/data') && method === 'GET') {
    return res.status(200).json({ items: data.items || [], settings: data.settings, coldStart: data.items.length === 0 });
  }

  // GET /api/items
  if (url.includes('/api/items') && method === 'GET') {
    return res.status(200).json(data.items || []);
  }

  // POST /api/push-state — Bulk atomic state restore from client (used for cold-start recovery).
  // Client sends its full local backup; server merges using timestamps so newer edits always win.
  if (url.includes('/api/push-state') && method === 'POST') {
    const body = req.body || {};
    const incomingItems: any[] = Array.isArray(body.items) ? body.items : [];
    if (incomingItems.length > 0) {
      data.items = mergeItems(data.items, incomingItems);
      if (body.settings) {
        data.settings = { ...data.settings, ...body.settings, syncCode };
      }
      persistToTmp(syncCode, data);
    }
    return res.status(200).json({ success: true, items: data.items, settings: data.settings });
  }

  // POST /api/items — Add or upsert (timestamp-aware)
  if (url.includes('/api/items') && !url.includes('/api/items/') && method === 'POST') {
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
      const existingTs = new Date(data.items[existingIndex].updatedAt || 0).getTime();
      const incomingTs = new Date(newItem.updatedAt || 0).getTime();
      if (incomingTs >= existingTs) {
        data.items[existingIndex] = { ...data.items[existingIndex], ...newItem };
      }
    } else {
      data.items.unshift(newItem);
    }
    persistToTmp(syncCode, data);
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
      data.items.unshift(updatedItem);
    }

    persistToTmp(syncCode, data);
    return res.status(200).json({ success: true, item: updatedItem, settings: data.settings });
  }

  // DELETE /api/items/:id
  if (url.includes('/api/items/') && method === 'DELETE') {
    const id = url.split('/api/items/')[1]?.split('?')[0];
    data.items = (data.items || []).filter((it: any) => it.id !== id);
    persistToTmp(syncCode, data);
    return res.status(200).json({ success: true, id, settings: data.settings });
  }

  // POST /api/settings
  if (url.includes('/api/settings') && method === 'POST') {
    data.settings = { ...data.settings, ...(req.body || {}), syncCode };
    persistToTmp(syncCode, data);
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
    persistToTmp(syncCode, data);
    return res.status(200).json({ success: true, items: data.items, settings: data.settings, clearedCount });
  }

  // POST /api/reset
  if (url.includes('/api/reset') && method === 'POST') {
    data.items = [];
    data.settings = {
      soundEnabled: true,
      volume: 0.8,
      syncCode,
      simulatedCurrentDate: new Date().toISOString().split('T')[0],
      customSoundData: null,
    };
    persistToTmp(syncCode, data);
    return res.status(200).json({ success: true, items: [], settings: data.settings });
  }

  return res.status(200).json(data);
}
