import { User } from '../types';
import { setAuthToken, removeAuthToken, getAuthToken } from './apiConfig';

const MOCK_USERS: Record<string, User> = {
  admin: {
    id: 1,
    username: 'admin',
    name: 'System Administrator',
    email: 'admin@university.edu',
    role: 'ADMIN',
    phone: '+1 555-0100',
  },
  teacher: {
    id: 2,
    username: 'teacher',
    name: 'Dr. Robert Anderson',
    email: 'robert.a@university.edu',
    role: 'TEACHER',
    teacher_id: 'T101',
    department: 'Computer Science',
    designation: 'Associate Professor',
    phone: '+1 555-0192',
  },
  student: {
    id: 3,
    username: 'student',
    name: 'Alex Johnson',
    email: 'alex.j@student.edu',
    role: 'STUDENT',
    student_id: 'S1001',
    class_id: 'CS101',
    class_name: 'B.Tech CS 1st Year',
    department: 'Computer Science',
    year: '1st Year',
    section: 'A',
    phone: '9876543210',
  },
};

const MOCK_PASSWORDS: Record<string, string> = {
  admin: 'admin123',
  teacher: 'teacher123',
  student: 'student123',
};

const USER_STORAGE_KEY = 'fras_current_user';

export const authService = {
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const mockUser = MOCK_USERS[username];
    const mockPassword = MOCK_PASSWORDS[username];

    if (mockUser && (password === mockPassword || password.length >= 4)) {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token_' + Date.now();
      setAuthToken(mockToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
      return { token: mockToken, user: mockUser };
    }
    throw new Error('Invalid credentials. Try admin/admin123, teacher/teacher123, or student/student123');
  },

  logout(): void {
    removeAuthToken();
    localStorage.removeItem(USER_STORAGE_KEY);
    // Also clean old key
    localStorage.removeItem('fras_admin_user');
  },

  getCurrentUser(): User | null {
    const token = getAuthToken();
    if (!token) return null;

    // Try new key first
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch { /* ignore */ }
    }

    // Fallback to old key for backward compat
    const oldUserStr = localStorage.getItem('fras_admin_user');
    if (oldUserStr) {
      try {
        const old = JSON.parse(oldUserStr);
        // Migrate to new format
        const migrated: User = { ...old, role: old.role || 'ADMIN' };
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      } catch { /* ignore */ }
    }

    return null;
  },

  isAuthenticated(): boolean {
    return !!getAuthToken();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    if (!currentPassword || !newPassword) {
      throw new Error('Please fill in both current and new passwords.');
    }
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }
    return true;
  },

  async updateProfile(profileData: Partial<User>): Promise<boolean> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    // Merge with existing user data
    const updatedUser: User = { ...currentUser, ...profileData };
    
    // Save to localStorage
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  },
};
