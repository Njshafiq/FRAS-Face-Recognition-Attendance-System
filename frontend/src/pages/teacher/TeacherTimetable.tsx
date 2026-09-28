import React, { useState, useEffect } from 'react';
import { TeacherLayout } from '../../components/layout/TeacherLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { INITIAL_TIMETABLE } from '../../services/mockData';
import { TimetableEntry, DayOfWeek } from '../../types';

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday',
};

const TODAY_DAY = DAYS[new Date().getDay() === 0 ? 0 : new Date().getDay() - 1] as DayOfWeek;

export const TeacherTimetable: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'weekly' | 'today'>('today');

  const teacherId = user?.teacher_id || 'T101';
  const myTimetable = INITIAL_TIMETABLE.filter((t) => t.teacher_id === teacherId);

  const getEntriesForDay = (day: DayOfWeek): TimetableEntry[] =>
    myTimetable
      .filter((t) => t.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const todayEntries = getEntriesForDay(TODAY_DAY);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const EntryCard = ({ entry }: { entry: TimetableEntry }) => (
    <div className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
      <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/60 shrink-0">
        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{entry.start_time}</span>
        <span className="text-[10px] text-emerald-500">↓</span>
        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{entry.end_time}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{entry.subject_name}</p>
        <p className="text-xs text-slate-500 truncate">{entry.class_name}</p>
        <div className="flex items-center gap-3 mt-1">
          {entry.room_number && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <MapPin className="w-3 h-3" /> {entry.room_number}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            {(() => {
              const [h, m] = entry.start_time.split(':').map(Number);
              const [h2, m2] = entry.end_time.split(':').map(Number);
              return `${(h2 * 60 + m2) - (h * 60 + m)} min`;
            })()}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <TeacherLayout
      title="My Timetable"
      subtitle="Your weekly teaching schedule"
    >
      {/* View toggle */}
      <div className="flex gap-2">
        {(['today', 'weekly'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              view === v
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300'
            }`}
          >
            {v === 'today' ? "Today's Classes" : 'Full Week'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
      ) : view === 'today' ? (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {DAY_LABELS[TODAY_DAY] || 'Today'}
            </h3>
            <Badge variant="default" size="sm">{todayEntries.length} sessions</Badge>
          </div>
          {todayEntries.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No classes today. Enjoy your day off!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayEntries.map((entry) => <EntryCard key={entry.id} entry={entry} />)}
            </div>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {DAYS.map((day) => {
            const entries = getEntriesForDay(day);
            return (
              <Card key={day}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{DAY_LABELS[day]}</h3>
                    {day === TODAY_DAY && (
                      <Badge variant="success" size="sm">Today</Badge>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{entries.length} sessions</span>
                </div>
                {entries.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No classes scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {entries.map((entry) => <EntryCard key={entry.id} entry={entry} />)}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </TeacherLayout>
  );
};
