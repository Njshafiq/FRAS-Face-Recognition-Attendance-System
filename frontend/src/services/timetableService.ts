import { TimetableEntry } from '../types';
import { INITIAL_TIMETABLE } from './mockData';

const STORAGE_KEY = 'fras_timetable';

const getStoredTimetable = (): TimetableEntry[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TIMETABLE));
    return INITIAL_TIMETABLE;
  }
  return JSON.parse(data);
};

const saveTimetable = (timetable: TimetableEntry[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timetable));
};

export const timetableService = {
  async getTimetable(): Promise<TimetableEntry[]> {
    return getStoredTimetable();
  },

  async getTimetableById(id: number): Promise<TimetableEntry | undefined> {
    const entries = getStoredTimetable();
    return entries.find((e) => e.id === id);
  },

  async createTimetableEntry(entry: Omit<TimetableEntry, 'id'>): Promise<TimetableEntry> {
    const entries = getStoredTimetable();
    const newId = entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1;
    const newEntry: TimetableEntry = {
      ...entry,
      id: newId
    };
    entries.push(newEntry);
    saveTimetable(entries);
    return newEntry;
  },

  async updateTimetableEntry(id: number, updatedData: Partial<TimetableEntry>): Promise<TimetableEntry> {
    const entries = getStoredTimetable();
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Timetable entry not found');
    
    entries[index] = { ...entries[index], ...updatedData };
    saveTimetable(entries);
    return entries[index];
  },

  async deleteTimetableEntry(id: number): Promise<void> {
    const entries = getStoredTimetable();
    const filtered = entries.filter((e) => e.id !== id);
    saveTimetable(filtered);
  }
};
