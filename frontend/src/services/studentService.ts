import { Student } from '../types';
import { INITIAL_STUDENTS } from './mockData';

const STORAGE_KEY = 'fras_students';

const getStoredStudents = (): Student[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
    return INITIAL_STUDENTS;
  }
  return JSON.parse(data);
};

const saveStudents = (students: Student[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
};

export const studentService = {
  async getStudents(): Promise<Student[]> {
    return getStoredStudents();
  },

  async getStudentById(id: string): Promise<Student | undefined> {
    const students = getStoredStudents();
    return students.find((s) => s.student_id === id);
  },

  async createStudent(student: Omit<Student, 'created_at'>): Promise<Student> {
    const students = getStoredStudents();
    const newStudent: Student = {
      ...student,
      created_at: new Date().toISOString().split('T')[0],
    };
    students.push(newStudent);
    saveStudents(students);
    return newStudent;
  },

  async updateStudent(id: string, updatedData: Partial<Student>): Promise<Student> {
    const students = getStoredStudents();
    const index = students.findIndex((s) => s.student_id === id);
    if (index === -1) throw new Error('Student not found');
    
    students[index] = { ...students[index], ...updatedData };
    saveStudents(students);
    return students[index];
  },

  async deleteStudent(id: string): Promise<void> {
    const students = getStoredStudents();
    const filtered = students.filter((s) => s.student_id !== id);
    saveStudents(filtered);
  },

  async toggleStudentStatus(id: string): Promise<Student> {
    const students = getStoredStudents();
    const student = students.find((s) => s.student_id === id);
    if (!student) throw new Error('Student not found');
    return this.updateStudent(id, { is_active: !student.is_active });
  }
};
