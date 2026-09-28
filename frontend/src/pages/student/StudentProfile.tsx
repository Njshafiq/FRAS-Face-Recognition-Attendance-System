import React, { useState, useEffect } from 'react';
import { StudentLayout } from '../../components/layout/StudentLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Phone, School, BookOpen, Camera,
  Edit3, Save, X, MapPin, Shield, CheckCircle2
} from 'lucide-react';
import { STUDENT_SUBJECT_ATTENDANCE } from '../../services/mockData';

export const StudentProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    });
    setIsEditing(false);
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'ST';

  return (
    <StudentLayout title="My Profile" subtitle="View and edit your personal information">
      {/* Saved banner */}
      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-medium animate-fadeInFast">
          <CheckCircle2 className="w-4 h-4" />
          Profile updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Avatar + ID card */}
        <div className="space-y-4">
          <Card className="text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-500 to-purple-400 text-white flex items-center justify-center text-2xl font-extrabold shadow-lg mx-auto">
                {initials}
              </div>
              <button
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 transition-colors"
                title="Change avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>

            <div className="mt-3 flex flex-col gap-1.5">
              <Badge variant="default" size="sm" className="w-fit mx-auto">
                <School className="w-3 h-3 mr-1" />
                {user?.class_name || 'B.Tech CS 1st Year'}
              </Badge>
              <Badge variant="success" size="sm" className="w-fit mx-auto">Student</Badge>
            </div>

            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                icon={<Edit3 className="w-3.5 h-3.5" />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <div className="mt-4 flex gap-2">
                <Button variant="primary" size="sm" className="flex-1 bg-violet-600 hover:bg-violet-500" icon={<Save className="w-3.5 h-3.5" />} onClick={handleSave}>Save</Button>
                <Button variant="outline" size="sm" className="flex-1" icon={<X className="w-3.5 h-3.5" />} onClick={handleCancel}>Cancel</Button>
              </div>
            )}
          </Card>

          {/* Student ID card */}
          <Card>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Student Details</h4>
            <div className="space-y-3 text-sm">
              {[
                { icon: <User className="w-4 h-4 text-violet-500" />, label: 'Student ID', value: user?.student_id || 'S1001' },
                { icon: <School className="w-4 h-4 text-sky-500" />, label: 'Class', value: user?.class_name || 'B.Tech CS 1st Year' },
                { icon: <BookOpen className="w-4 h-4 text-emerald-500" />, label: 'Department', value: user?.department || 'Computer Science' },
                { icon: <Shield className="w-4 h-4 text-amber-500" />, label: 'Section', value: user?.section || 'A' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">{item.icon}</div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT: Editable info + attendance summary */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5">Personal Information</h3>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { field: 'name', label: 'Full Name', icon: <User className="w-4 h-4" />, type: 'text' },
                  { field: 'email', label: 'Email Address', icon: <Mail className="w-4 h-4" />, type: 'email' },
                  { field: 'phone', label: 'Phone Number', icon: <Phone className="w-4 h-4" />, type: 'tel' },
                  { field: 'address', label: 'Address', icon: <MapPin className="w-4 h-4" />, type: 'text' },
                ].map(({ field, label, icon, type }) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                    {isEditing ? (
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
                        <input
                          type={type}
                          value={(formData as any)[field]}
                          onChange={(e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }))}
                          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-violet-300 dark:border-violet-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-slate-900 dark:text-white py-2.5 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
                        {(formData as any)[field] || <span className="text-slate-400 italic">Not set</span>}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Attendance Summary */}
          <Card>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Attendance Summary</h3>
            <div className="space-y-3">
              {STUDENT_SUBJECT_ATTENDANCE.map((s) => (
                <div key={s.subject_code} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{s.subject_name}</p>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${s.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-sm font-extrabold ${s.percentage >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {s.percentage}%
                    </span>
                    <p className="text-[10px] text-slate-400">{s.present_count}/{s.total_classes}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
};
