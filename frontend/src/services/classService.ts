import { ClassEntity } from '../types';
import { INITIAL_CLASSES } from './mockData';

const STORAGE_KEY = 'fras_classes';

const getStoredClasses = (): ClassEntity[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CLASSES));
    return INITIAL_CLASSES;
  }
  return JSON.parse(data);
};

const saveClasses = (classes: ClassEntity[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
};

export const classService = {
  async getClasses(): Promise<ClassEntity[]> {
    return getStoredClasses();
  },

  async getClassById(id: string): Promise<ClassEntity | undefined> {
    const classes = getStoredClasses();
    return classes.find((c) => c.class_id === id);
  },

  async createClass(classItem: ClassEntity): Promise<ClassEntity> {
    const classes = getStoredClasses();
    classes.push(classItem);
    saveClasses(classes);
    return classItem;
  },

  async updateClass(id: string, updatedData: Partial<ClassEntity>): Promise<ClassEntity> {
    const classes = getStoredClasses();
    const index = classes.findIndex((c) => c.class_id === id);
    if (index === -1) throw new Error('Class not found');
    
    classes[index] = { ...classes[index], ...updatedData };
    saveClasses(classes);
    return classes[index];
  },

  async deleteClass(id: string): Promise<void> {
    const classes = getStoredClasses();
    const filtered = classes.filter((c) => c.class_id !== id);
    saveClasses(filtered);
  },

  async toggleClassStatus(id: string): Promise<ClassEntity> {
    const classes = getStoredClasses();
    const classItem = classes.find((c) => c.class_id === id);
    if (!classItem) throw new Error('Class not found');
    return this.updateClass(id, { is_active: !classItem.is_active });
  }
};
