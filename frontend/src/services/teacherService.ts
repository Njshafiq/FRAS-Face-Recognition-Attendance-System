import { Teacher } from '../types';
import { INITIAL_TEACHERS } from './mockData';

const STORAGE_KEY = 'fras_teachers';

const getStoredTeachers = (): Teacher[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TEACHERS));
    return INITIAL_TEACHERS;
  }
  return JSON.parse(data);
};

const saveTeachers = (teachers: Teacher[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
};

export const teacherService = {
  async getTeachers(): Promise<Teacher[]> {
    return getStoredTeachers();
  },

  async getTeacherById(id: string): Promise<Teacher | undefined> {
    const teachers = getStoredTeachers();
    return teachers.find((t) => t.teacher_id === id);
  },

  async createTeacher(teacher: Teacher): Promise<Teacher> {
    const teachers = getStoredTeachers();
    teachers.push(teacher);
    saveTeachers(teachers);
    return teacher;
  },

  async updateTeacher(id: string, updatedData: Partial<Teacher>): Promise<Teacher> {
    const teachers = getStoredTeachers();
    const index = teachers.findIndex((t) => t.teacher_id === id);
    if (index === -1) throw new Error('Teacher not found');
    
    teachers[index] = { ...teachers[index], ...updatedData };
    saveTeachers(teachers);
    return teachers[index];
  },

  async deleteTeacher(id: string): Promise<void> {
    const teachers = getStoredTeachers();
    const filtered = teachers.filter((t) => t.teacher_id !== id);
    saveTeachers(filtered);
  },

  async toggleTeacherStatus(id: string): Promise<Teacher> {
    const teachers = getStoredTeachers();
    const teacher = teachers.find((t) => t.teacher_id === id);
    if (!teacher) throw new Error('Teacher not found');
    return this.updateTeacher(id, { is_active: !teacher.is_active });
  }
};
