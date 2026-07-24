import { AgendaItem, AppSettings } from '../types';
import { getTodayDateString } from './dateUtils';

export function getInitialSeedData(): { items: AgendaItem[]; settings: AppSettings } {
  const todayStr = getTodayDateString(); // e.g. 2026-07-23
  
  // Calculate relative dates for rich initial showcase
  const [y, m, d] = todayStr.split('-').map(Number);
  
  const formatDate = (offsetDays: number) => {
    const dt = new Date(y, m - 1, d + offsetDays);
    const yr = dt.getFullYear();
    const mo = String(dt.getMonth() + 1).padStart(2, '0');
    const dy = String(dt.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${dy}`;
  };

  const yesterdayStr = formatDate(-1);
  const tomorrowStr = formatDate(1);
  const in3DaysStr = formatDate(3);
  const in5DaysStr = formatDate(5);

  const initialItems: AgendaItem[] = [
    {
      id: 'item-1',
      title: 'Chainsaw Man Season 2 - Episode 4',
      category: 'Anime',
      dueDate: todayStr,
      notes: 'Airs on Crunchyroll at 21:00 JST. Peak climax episode!',
      link: 'https://crunchyroll.com',
      isDone: false,
      isWatched: false,
      recurrence: 'weekly',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item-2',
      title: 'Solo Leveling Ragnarok - Chapter 42',
      category: 'Manhwa',
      dueDate: todayStr,
      notes: 'New raw scan & scanlation release expected on Kakao/Asura.',
      link: 'https://asuracomic.net',
      isDone: false,
      isWatched: true, // Marked watched
      recurrence: 'weekly',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item-3',
      title: 'Data Structures Assignment 3: Binary Trees',
      category: 'Deadline',
      dueDate: yesterdayStr, // Overdue
      notes: 'Submit PDF report and C++ source code to University Portal.',
      link: 'https://canvas.instructure.com',
      isDone: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item-4',
      title: 'Omniscient Reader\'s Viewpoint - Chapter 218',
      category: 'Manhwa',
      dueDate: in3DaysStr,
      notes: 'Demon King selection arc continues.',
      link: 'https://webtoons.com',
      isDone: false,
      isWatched: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item-5',
      title: 'Frieren Season 2 Announcement Stream',
      category: 'Anime',
      dueDate: in5DaysStr,
      notes: 'Special livestream event on YouTube.',
      link: 'https://youtube.com',
      isDone: false,
      isWatched: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item-6',
      title: 'Renew ISP High-Speed Internet Bill',
      category: 'Other',
      dueDate: todayStr,
      notes: 'Pay via banking app before midnight to avoid speed throttle.',
      link: 'https://myaccount.isp.com',
      isDone: true, // Done today -> stays greyed out today, disappears tomorrow
      doneAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item-7',
      title: 'Prepare Midterm Exam Notes for Operating Systems',
      category: 'Deadline',
      dueDate: in5DaysStr,
      notes: 'Focus on Memory Management, Virtual Memory & Page Replacement.',
      link: '',
      isDone: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const initialSettings: AppSettings = {
    startupSoundEnabled: true,
    customSoundName: 'Izumo Startup Sound Cue (Tenka.mp3)',
    autoStartWindows: true,
    syncCode: 'AG-9842',
    lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    simulatedCurrentDate: todayStr,
  };

  return { items: initialItems, settings: initialSettings };
}
