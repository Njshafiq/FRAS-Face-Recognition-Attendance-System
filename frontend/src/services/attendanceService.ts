import { 
  AttendanceSession, 
  AttendanceRecord, 
  DashboardStats, 
  AttendanceTrendItem, 
  SubjectAttendanceStat, 
  RecentActivityItem 
} from '../types';
import { 
  INITIAL_SESSIONS, 
  INITIAL_ATTENDANCE_RECORDS, 
  INITIAL_DASHBOARD_STATS, 
  WEEKLY_ATTENDANCE_TREND, 
  SUBJECT_ATTENDANCE_STATS, 
  RECENT_ATTENDANCE_ACTIVITY 
} from './mockData';

const SESSIONS_KEY = 'fras_sessions';
const RECORDS_KEY = 'fras_attendance_records';

const getStoredSessions = (): AttendanceSession[] => {
  const data = localStorage.getItem(SESSIONS_KEY);
  if (!data) {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(INITIAL_SESSIONS));
    return INITIAL_SESSIONS;
  }
  return JSON.parse(data);
};

const getStoredRecords = (): AttendanceRecord[] => {
  const data = localStorage.getItem(RECORDS_KEY);
  if (!data) {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
    return INITIAL_ATTENDANCE_RECORDS;
  }
  return JSON.parse(data);
};

export const attendanceService = {
  async getSessions(): Promise<AttendanceSession[]> {
    return getStoredSessions();
  },

  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    return getStoredRecords();
  },

  async getDashboardStats(): Promise<DashboardStats> {
    return INITIAL_DASHBOARD_STATS;
  },

  async getWeeklyAttendanceTrend(): Promise<AttendanceTrendItem[]> {
    return WEEKLY_ATTENDANCE_TREND;
  },

  async getSubjectAttendanceStats(): Promise<SubjectAttendanceStat[]> {
    return SUBJECT_ATTENDANCE_STATS;
  },

  async getRecentActivity(): Promise<RecentActivityItem[]> {
    return RECENT_ATTENDANCE_ACTIVITY;
  }
};
