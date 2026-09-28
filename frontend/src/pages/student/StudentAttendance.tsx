import React, { useState, useEffect } from 'react';
import { StudentLayout } from '../../components/layout/StudentLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { ClipboardCheck, CheckCircle2, XCircle, AlertTriangle, Filter } from 'lucide-react';
import {
  STUDENT_SUBJECT_ATTENDANCE,
  INITIAL_ATTENDANCE_RECORDS,
} from '../../services/mockData';
import { AttendanceRecord } from '../../types';

export const StudentAttendance: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  const studentId = user?.student_id || 'S1001';

  const myRecords: AttendanceRecord[] = INITIAL_ATTENDANCE_RECORDS
    .filter((r) => r.student_id === studentId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const subjects = [...new Set(myRecords.map((r) => r.subject_name))];

  const filtered = subjectFilter === 'ALL'
    ? myRecords
    : myRecords.filter((r) => r.subject_name === subjectFilter);

  const totalPresent = myRecords.filter((r) => r.status === 'PRESENT').length;
  const totalAbsent = myRecords.filter((r) => r.status === 'ABSENT').length;
  const overallPct = myRecords.length > 0
    ? Math.round((totalPresent / myRecords.length) * 100)
    : 0;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <StudentLayout
      title="My Attendance"
      subtitle="Subject-wise attendance breakdown and history"
    >
      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Overall', value: `${overallPct}%`, color: overallPct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
          { label: 'Present', value: totalPresent, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Absent', value: totalAbsent, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
          { label: 'Sessions', value: myRecords.length, color: 'text-slate-900 dark:text-white', bg: 'bg-slate-50 dark:bg-slate-800' },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-2xl ${s.bg} border border-slate-100 dark:border-slate-800 text-center`}>
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Subject-wise attendance bars */}
      <Card>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5">Subject-wise Attendance</h3>
        <div className="space-y-5">
          {STUDENT_SUBJECT_ATTENDANCE.map((s) => (
            <div key={s.subject_code}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.subject_name}</p>
                  <p className="text-xs text-slate-500">{s.teacher_name}</p>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className={`text-base font-extrabold ${s.percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {s.percentage}%
                  </span>
                  <p className="text-[10px] text-slate-400">{s.present_count}/{s.total_classes}</p>
                </div>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${s.percentage >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-pink-400'}`}
                  style={{ width: `${s.percentage}%` }}
                />
              </div>
              {s.percentage < 75 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Below 75% minimum · Need {Math.ceil((0.75 * s.total_classes - s.present_count) / 0.25)} more attendance
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Attendance Log */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Attendance Log</h3>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900 dark:text-white"
            >
              <option value="ALL">All Subjects</option>
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="text-left pb-3 font-semibold">Date</th>
                  <th className="text-left pb-3 font-semibold">Subject</th>
                  <th className="text-left pb-3 font-semibold hidden sm:table-cell">Teacher</th>
                  <th className="text-right pb-3 font-semibold hidden md:table-cell">Confidence</th>
                  <th className="text-right pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 text-xs text-slate-600 dark:text-slate-400">{r.date}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {r.status === 'PRESENT'
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          : <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                        <span className="font-medium text-slate-900 dark:text-white">{r.subject_name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-xs text-slate-500 hidden sm:table-cell">{r.teacher_name}</td>
                    <td className="py-3 text-right text-xs text-slate-500 hidden md:table-cell">
                      {r.confidence_score ? `${r.confidence_score}%` : '—'}
                    </td>
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
