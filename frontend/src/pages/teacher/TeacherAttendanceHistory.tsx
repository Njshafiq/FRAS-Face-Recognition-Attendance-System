import React, { useState, useEffect } from 'react';
import { TeacherLayout } from '../../components/layout/TeacherLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { SearchFilter, FilterGroup } from '../../components/common/SearchFilter';
import { useAuth } from '../../context/AuthContext';
import { Eye, CheckCircle2, XCircle, History } from 'lucide-react';
import { INITIAL_SESSIONS, INITIAL_ATTENDANCE_RECORDS } from '../../services/mockData';
import { AttendanceSession, AttendanceRecord } from '../../types';

export const TeacherAttendanceHistory: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);

  const teacherId = user?.teacher_id || 'T101';
  const mySessions = INITIAL_SESSIONS.filter((s) => s.teacher_id === teacherId);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const subjects = [...new Set(mySessions.map((s) => s.subject_name))];
  const classes = [...new Set(mySessions.map((s) => s.class_name))];

  const filtered = mySessions.filter((s) => {
    const matchSearch =
      s.subject_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.class_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSubject = subjectFilter === 'ALL' || s.subject_name === subjectFilter;
    const matchClass = classFilter === 'ALL' || s.class_name === classFilter;
    const matchDate = !dateFilter || s.date === dateFilter;
    return matchSearch && matchSubject && matchClass && matchDate;
  }).sort((a, b) => b.id - a.id);

  const filterGroups: FilterGroup[] = [
    {
      key: 'subject', label: 'Subject', value: subjectFilter,
      options: subjects.map((s) => ({ label: s, value: s })),
    },
    {
      key: 'class', label: 'Class', value: classFilter,
      options: classes.map((c) => ({ label: c, value: c })),
    },
  ];

  const sessionRecords = selectedSession
    ? INITIAL_ATTENDANCE_RECORDS.filter((r) => r.session_id === selectedSession.id)
    : [];

  return (
    <TeacherLayout title="Attendance History" subtitle="Review your past attendance sessions">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sessions ({filtered.length})</h2>
          <p className="text-xs text-slate-500">Your attendance session history</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-xs text-slate-500 hover:text-slate-800">Clear</button>
          )}
        </div>
      </div>

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by subject or class..."
        filters={filterGroups}
        onFilterChange={(key, val) => {
          if (key === 'subject') setSubjectFilter(val);
          if (key === 'class') setClassFilter(val);
        }}
        onReset={() => { setSearchQuery(''); setSubjectFilter('ALL'); setClassFilter('ALL'); setDateFilter(''); }}
      />

      <Card>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No sessions found for the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="text-left pb-3 font-semibold">Date</th>
                  <th className="text-left pb-3 font-semibold">Subject</th>
                  <th className="text-left pb-3 font-semibold hidden sm:table-cell">Class</th>
                  <th className="text-right pb-3 font-semibold hidden md:table-cell">Total</th>
                  <th className="text-right pb-3 font-semibold">Present</th>
                  <th className="text-right pb-3 font-semibold hidden sm:table-cell">%</th>
                  <th className="text-right pb-3 font-semibold">Status</th>
                  <th className="text-right pb-3 font-semibold">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 text-slate-600 dark:text-slate-400 text-xs">{s.date}</td>
                    <td className="py-3 font-medium text-slate-900 dark:text-white">{s.subject_name}</td>
                    <td className="py-3 text-slate-500 hidden sm:table-cell text-xs">{s.class_name}</td>
                    <td className="py-3 text-right text-slate-500 hidden md:table-cell">{s.total_students}</td>
                    <td className="py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">{s.present_count}</td>
                    <td className="py-3 text-right hidden sm:table-cell">
                      <span className={`font-bold text-xs ${s.attendance_percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
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
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedSession(s)}
                        className="flex items-center gap-1.5 ml-auto text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Session Detail Modal */}
      {selectedSession && (
        <Modal
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
          title={`Session — ${selectedSession.subject_name}`}
          subtitle={`${selectedSession.class_name} · ${selectedSession.date} (${selectedSession.start_time}–${selectedSession.end_time})`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Present</span>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{selectedSession.present_count}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Absent</span>
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{selectedSession.absent_count}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Rate</span>
                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{selectedSession.attendance_percentage}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Records</h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                {sessionRecords.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">No individual records for this session.</p>
                ) : (
                  sessionRecords.map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl">
                      <div className="flex items-center gap-3">
                        {rec.status === 'PRESENT'
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          : <XCircle className="w-4 h-4 text-rose-500" />}
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{rec.student_name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{rec.student_id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={rec.status === 'PRESENT' ? 'success' : 'danger'} size="sm">{rec.status}</Badge>
                        {rec.confidence_score ? (
                          <p className="text-[10px] text-slate-400 mt-0.5">Conf: {rec.confidence_score}%</p>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </TeacherLayout>
  );
};
