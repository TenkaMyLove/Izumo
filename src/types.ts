export type AgendaCategory = 'Anime' | 'Manhwa' | 'Deadline' | 'Other';

export type ItemStatus = 'Overdue' | 'Due Today' | 'Upcoming' | 'Done';

export interface AgendaItem {
  id: string;
  title: string;
  category: AgendaCategory;
  dueDate: string; // YYYY-MM-DD
  notes?: string;
  link?: string;
  isDone: boolean;
  doneAt?: string | null; // ISO timestamp when marked done
  isWatched?: boolean; // For Anime & Manhwa categories
  recurrence?: 'none' | 'weekly' | 'monthly'; // For auto 1-time insertion recurring episodes/chapters
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  startupSoundEnabled: boolean;
  customSoundName?: string;
  customSoundData?: string; // base64 / data URL
  autoStartWindows: boolean;
  syncCode: string;
  lastSyncTime: string;
  simulatedCurrentDate?: string; // YYYY-MM-DD override for testing day rollover
}

export type ViewMode = 'dual' | 'desktop' | 'mobile' | 'tray-only';

export type ActiveTab = 'all' | 'anime-manhwa' | 'status' | 'settings';
