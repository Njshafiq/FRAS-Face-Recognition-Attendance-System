import React, { useState, useEffect } from 'react';
import { TeacherLayout } from '../../components/layout/TeacherLayout';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import { School, Users, BookOpen, Eye } from 'lucide-react';
import { INITIAL_TIMETABLE, INITIAL_STUDENTS, INITIAL_CLASSES } from '../../services/mockData';
import { ClassEntity } from '../../types';

export const TeacherClasses: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassEntity | null>(null);

  const teacherId = user?.teacher_id || 'T101';

  // Get unique class IDs assigned to this teacher
  const assignedClassIds = [...new Set(
    INITIAL_TIMETABLE
      .filter((t) => t.teacher_id === teacherId)
      .map((t) => t.class_id)
  )];

  const myClasses = INITIAL_CLASSES.filter((c) => assignedClassIds.includes(c.class_id));

  // Get subjects this teacher teaches per class
  const getSubjectsForClass = (classId: string) =>
    [...new Set(
      INITIAL_TIMETABLE
        .filter((t) => t.teacher_id === teacherId && t.class_id === classId)
        .map((t) => t.subject_name)
    )];

  const getStudentsForClass = (classId: string) =>
    INITIAL_STUDENTS.filter((s) => s.class_id === classId && s.is_active);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <TeacherLayout
      title="My Classes"
      subtitle="Classes assigned to you this academic year"
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : myClasses.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <School className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-base font-medium">No classes assigned</p>
          <p className="text-sm mt-1">Contact admin to assign classes.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myClasses.map((cls) => {
              const subjects = getSubjectsForClass(cls.class_id);
              const students = getStudentsForClass(cls.class_id);
              return (
                <Card key={cls.class_id} className="flex flex-col gap-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center">
                      <School className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <Badge variant={cls.is_active ? 'success' : 'danger'} size="sm">
                      {cls.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{cls.class_name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Section {cls.section} · {cls.department || 'Computer Science'} · {cls.academic_year}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                      {students.length} Students
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-sky-500" />
                      {subjects.length} Subject{subjects.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {subjects.map((subj) => (
                      <span
                        key={subj}
                        className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        {subj}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedClass(cls)}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-colors border border-emerald-100 dark:border-emerald-800/40"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Students
                  </button>
                </Card>
              );
            })}
          </div>

          {/* Student list modal */}
          {selectedClass && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedClass(null)}>
              <div
                className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[80vh] flex flex-col animate-scaleUpFast"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedClass.class_name}</h3>
                    <p className="text-xs text-slate-500">Student Roster — Section {selectedClass.section}</p>
                  </div>
                  <button
                    onClick={() => setSelectedClass(null)}
                    className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <div className="overflow-y-auto p-4 space-y-2">
                  {getStudentsForClass(selectedClass.class_id).map((st) => (
                    <div
                      key={st.student_id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{st.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{st.student_id}</p>
                        </div>
                      </div>
                      <Badge variant={st.face_registered ? 'success' : 'danger'} size="sm">
                        {st.face_registered ? 'Face ✓' : 'No Face'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </TeacherLayout>
  );
};
