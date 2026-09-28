import React, { useState, useEffect } from 'react';
import { TeacherLayout } from '../../components/layout/TeacherLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import {
  School,
  Calendar,
  ClipboardCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { INITIAL_TIMETABLE, INITIAL_SESSIONS, TEACHER_DASHBOARD_STATS } from '../../services/mockData';
import { TimetableEntry, AttendanceSession } from '../../types';

const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const today = new Date();
const todayName = DAYS[today.getDay()];

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const teacherId = user?.teacher_id || 'T101';

  // Filter timetable for this teacher
  const myTimetable: TimetableEntry[] = INITIAL_TIMETABLE.filter(
    (t) => t.teacher_id === teacherId
  );

  const todaySchedule: TimetableEntry[] = myTimetable
    .filter((t) => t.day_of_week === todayName)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  // Recent sessions by this teacher
  const mySessions: AttendanceSession[] = INITIAL_SESSIONS
    .filter((s) => s.teacher_id === teacherId)
    .sort((a, b) => b.id - a.id)
    .slice(0, 4);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const stats = TEACHER_DASHBOARD_STATS;

  return (
    <TeacherLayout
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'Teacher'}!`}
      subtitle="Here's your teaching overview for today"
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Classes"
          value={stats.assigned_classes}
          icon={School}
          color="emerald"
        />
        <StatCard
          title="Today's Sessions"
          value={todaySchedule.length}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Sessions Completed"
          value={stats.sessions_completed}
          icon={ClipboardCheck}
          color="purple"
        />
        <StatCard
          title="Today's Attendance"
          value={`${stats.todays_attendance_percentage}%`}
          icon={TrendingUp}
          change="+2.5%"
          changeType="positive"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Today's Schedule</h3>
            <Badge variant="default" size="sm">
              {todayName.charAt(0) + todayName.slice(1).toLowerCase()}
            </Badge>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : todaySchedule.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No sessions scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((entry) => {
                const session = mySessions.find(
                  (s) => s.timetable_id === entry.id && s.date === today.toISOString().slice(0, 10)
                );
                const status = session?.status || 'SCHEDULED';
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60"
                  >
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/60 shrink-0">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{entry.start_time}</span>
                      <span className="text-[10px] text-emerald-500 dark:text-emerald-400">{entry.end_time}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{entry.subject_name}</p>
                      <p className="text-xs text-slate-500 truncate">{entry.class_name} · {entry.room_number}</p>
                    </div>
                    <Badge
                      variant={status === 'COMPLETED' ? 'success' : status === 'IN_PROGRESS' ? 'warning' : 'default'}
                      size="sm"
                    >
                      {status === 'IN_PROGRESS' && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse mr-1" />}
                      {status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: 'Start Attendance', desc: 'Begin face recognition session', icon: <ClipboardCheck className="w-5 h-5" />, path: '/teacher/attendance/start', color: 'bg-emerald-600 hover:bg-emerald-500' },
                { label: 'View Timetable', desc: 'Check weekly schedule', icon: <Calendar className="w-5 h-5" />, path: '/teacher/timetable', color: 'bg-sky-600 hover:bg-sky-500' },
                { label: 'Attendance History', desc: 'Review past sessions', icon: <BookOpen className="w-5 h-5" />, path: '/teacher/attendance/history', color: 'bg-violet-600 hover:bg-violet-500' },
              ].map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl ${action.color} text-white transition-all hover:shadow-md active:scale-[0.98]`}
                >
                  {action.icon}
                  <div className="text-left">
                    <p className="text-sm font-semibold">{action.label}</p>
                    <p className="text-[11px] text-white/70">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto shrink-0" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Attendance */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Attendance Sessions</h3>
          <button
            onClick={() => navigate('/teacher/attendance/history')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            View All
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : mySessions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No attendance sessions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="text-left pb-3 font-semibold">Subject</th>
                  <th className="text-left pb-3 font-semibold hidden sm:table-cell">Class</th>
                  <th className="text-left pb-3 font-semibold hidden md:table-cell">Date</th>
                  <th className="text-right pb-3 font-semibold">Present</th>
                  <th className="text-right pb-3 font-semibold hidden sm:table-cell">%</th>
                  <th className="text-right pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {mySessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-medium text-slate-900 dark:text-white">{s.subject_name}</td>
                    <td className="py-3 text-slate-500 hidden sm:table-cell">{s.class_name}</td>
                    <td className="py-3 text-slate-500 hidden md:table-cell">{s.date}</td>
                    <td className="py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {s.present_count}/{s.total_students}
                    </td>
                    <td className="py-3 text-right hidden sm:table-cell">
                      <span className={`font-bold ${s.attendance_percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                        {s.attendance_percentage}%
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Badge
                        variant={s.status === 'COMPLETED' ? 'success' : s.status === 'IN_PROGRESS' ? 'warning' : 'default'}
                        size="sm"
                      >
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </TeacherLayout>
  );
};
