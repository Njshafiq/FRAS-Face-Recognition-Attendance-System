import { Subject } from '../types';
import { INITIAL_SUBJECTS } from './mockData';

const STORAGE_KEY = 'fras_subjects';

const getStoredSubjects = (): Subject[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUBJECTS));
    return INITIAL_SUBJECTS;
  }
  return JSON.parse(data);
};

const saveSubjects = (subjects: Subject[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
};

export const subjectService = {
  async getSubjects(): Promise<Subject[]> {
    return getStoredSubjects();
  },

  async getSubjectByCode(code: string): Promise<Subject | undefined> {
    const subjects = getStoredSubjects();
    return subjects.find((s) => s.subject_code === code);
  },

  async createSubject(subject: Subject): Promise<Subject> {
    const subjects = getStoredSubjects();
    subjects.push(subject);
    saveSubjects(subjects);
    return subject;
  },

  async updateSubject(code: string, updatedData: Partial<Subject>): Promise<Subject> {
    const subjects = getStoredSubjects();
    const index = subjects.findIndex((s) => s.subject_code === code);
    if (index === -1) throw new Error('Subject not found');
    
    subjects[index] = { ...subjects[index], ...updatedData };
    saveSubjects(subjects);
    return subjects[index];
  },

  async deleteSubject(code: string): Promise<void> {
    const subjects = getStoredSubjects();
    const filtered = subjects.filter((s) => s.subject_code !== code);
    saveSubjects(filtered);
  },

  async toggleSubjectStatus(code: string): Promise<Subject> {
    const subjects = getStoredSubjects();
    const subject = subjects.find((s) => s.subject_code === code);
    if (!subject) throw new Error('Subject not found');
    return this.updateSubject(code, { is_active: !subject.is_active });
  }
};
