import React, { useState, useEffect } from 'react';
import { StudentLayout } from '../../components/layout/StudentLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardCheck, Calendar, TrendingUp, AlertTriangle, BookOpen, ArrowRight, CheckCircle2, XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  INITIAL_TIMETABLE,
  STUDENT_DASHBOARD_STATS,
  STUDENT_SUBJECT_ATTENDANCE,
  INITIAL_ATTENDANCE_RECORDS,
  WEEKLY_ATTENDANCE_TREND,
} from '../../services/mockData';

const DAYS_ORDER = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const todayName = DAYS_ORDER[new Date().getDay()];
const todayDate = new Date().toISOString().slice(0, 10);

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const classId = user?.class_id || 'CS101';
  const studentId = user?.student_id || 'S1001';

  const todayClasses = INITIAL_TIMETABLE
    .filter((t) => t.class_id === classId && t.day_of_week === todayName)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const recentRecords = INITIAL_ATTENDANCE_RECORDS
    .filter((r) => r.student_id === studentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const stats = STUDENT_DASHBOARD_STATS;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  // Low attendance subjects
  const lowAttendance = STUDENT_SUBJECT_ATTENDANCE.filter((s) => s.percentage < 75);

  return (
    <StudentLayout
      title={`Hello, ${user?.name?.split(' ')[0] || 'Student'}!`}
      subtitle={`${user?.class_name || 'B.Tech CS 1st Year'} · ${todayDate}`}
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${stats.overall_attendance_percentage}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ value: 1.5, isPositive: true }}
          color="violet"
        />
        <StatCard
          title="Classes Present"
          value={stats.present_count}
          icon={<CheckCircle2 className="w-5 h-5" />}
          trend={{ value: 0, isPositive: true }}
          color="emerald"
        />
        <StatCard
          title="Classes Absent"
          value={stats.absent_count}
          icon={<XCircle className="w-5 h-5" />}
          trend={{ value: 0, isPositive: false }}
          color="red"
        />
        <StatCard
          title="Total Sessions"
          value={stats.total_sessions}
          icon={<ClipboardCheck className="w-5 h-5" />}
          trend={{ value: 0, isPositive: true }}
          color="blue"
        />
      </div>

      {/* Alerts */}
      {lowAttendance.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Low Attendance Warning</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              You have low attendance (&lt;75%) in: {lowAttendance.map((s) => s.subject_name).join(', ')}.
              Maintain minimum 75% to be eligible for exams.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Today's Classes</h3>
            <Badge variant="default" size="sm">{todayName.charAt(0) + todayName.slice(1).toLowerCase()}</Badge>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
            </div>
          ) : todayClasses.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No classes today.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayClasses.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800/60 shrink-0">
                    <span className="text-xs font-bold text-violet-700 dark:text-violet-300">{entry.start_time}</span>
                    <span className="text-[10px] text-violet-500">{entry.end_time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{entry.subject_name}</p>
                    <p className="text-xs text-slate-500 truncate">{entry.teacher_name} · {entry.room_number}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Subject-wise Attendance */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Subject Attendance</h3>
            <button
              onClick={() => navigate('/student/attendance')}
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
            >
              Details <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {STUDENT_SUBJECT_ATTENDANCE.map((s) => (
                <div key={s.subject_code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate pr-2">{s.subject_name}</span>
                    <span className={`font-bold shrink-0 ${s.percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {s.percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${s.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">{s.present_count}/{s.total_classes} classes attended</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Attendance Records */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Attendance</h3>
          <button
            onClick={() => navigate('/student/attendance')}
            className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
          >
            View All
          </button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
          </div>
        ) : recentRecords.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8 italic">No attendance records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="text-left pb-3 font-semibold">Date</th>
                  <th className="text-left pb-3 font-semibold">Subject</th>
                  <th className="text-left pb-3 font-semibold hidden sm:table-cell">Teacher</th>
                  <th className="text-right pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 text-slate-500 text-xs">{r.date}</td>
                    <td className="py-3 font-medium text-slate-900 dark:text-white">{r.subject_name}</td>
                    <td className="py-3 text-slate-500 text-xs hidden sm:table-cell">{r.teacher_name}</td>
                    <td className="py-3 text-right">
                      <Badge variant={r.status === 'PRESENT' ? 'success' : 'danger'} size="sm">
                        {r.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </StudentLayout>
  );
};
