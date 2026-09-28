import React, { useState, useEffect } from 'react';
import { TeacherLayout } from '../../components/layout/TeacherLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useAuth } from '../../context/AuthContext';
import {
  User, Mail, Phone, Calendar, School, Award,
  MapPin, Shield, Key, CheckCircle2, Edit3,
  Save, X, Camera, Upload, Lock
} from 'lucide-react';

export const TeacherProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    department: user?.department || 'Computer Science',
    qualification: user?.qualification || 'M.Sc Computer Science',
    experience: user?.experience || '5 years',
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  const InfoRow = ({ icon: Icon, label, value, highlight = false }: {
    icon: React.ElementType,
    label: string,
    value: string,
    highlight?: boolean
  }) => (
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-lg ${highlight ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
        <Icon className={`w-4 h-4 ${highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{label}</p>
        <p className={`text-sm ${highlight ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
          {value}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <TeacherLayout title="My Profile" subtitle="Your personal and professional information">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout title="My Profile" subtitle="Your personal and professional information">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Personal Information</h3>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" size="sm" icon={<X className="w-3.5 h-3.5" />} onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />} onClick={handleSubmit}>
                      Save
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" icon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Department</label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option>Computer Science</option>
                        <option>Mathematics</option>
                        <option>Physics</option>
                        <option>Chemistry</option>
                        <option>Biology</option>
                        <option>English</option>
                        <option>History</option>
                        <option>Physical Education</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Highest Qualification</label>
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Teaching Experience</label>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </form>
              ) : (
                <>
                  <InfoRow icon={User} label="Full Name" value={user?.name || 'Not provided'} highlight />
                  <InfoRow icon={Mail} label="Email" value={user?.email || 'Not provided'} />
                  <InfoRow icon={Phone} label="Phone" value={user?.phone || 'Not provided'} />
                  <InfoRow icon={MapPin} label="Address" value={user?.address || 'Not provided'} />
                  <InfoRow icon={School} label="Department" value={formData.department} />
                  <InfoRow icon={Award} label="Qualification" value={formData.qualification} />
                  <InfoRow icon={Calendar} label="Experience" value={formData.experience} />
                </>
              )}
            </div>
          </Card>

          {/* Account Security */}
          <Card>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Account Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <Key className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Change Password</p>
                    <p className="text-xs text-slate-500">Update your login password</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" icon={<Lock className="w-3.5 h-3.5" />}>
                  Change
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Two‑Factor Authentication</p>
                    <p className="text-xs text-slate-500">Add an extra layer of security</p>
                  </div>
                </div>
                <Badge variant="default" size="sm">Disabled</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Stats & Quick Info */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name?.charAt(0) || 'T'}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <Camera className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name || 'Teacher'}</h4>
              <p className="text-xs text-slate-500 mt-1">{formData.department} Teacher</p>
              <Badge variant="success" size="sm" className="mt-2">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
          </Card>

          <Card>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Account Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Teacher ID</span>
                <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{user?.teacher_id || 'T101'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Account Created</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">2025-01-15</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Last Login</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Today, 08:45 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Active Sessions</span>
                <Badge variant="success" size="sm">1 Device</Badge>
              </div>
            </div>
          </Card>

          <Card>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h4>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-xs" icon={<Upload className="w-3.5 h-3.5" />}>
                Upload Profile Picture
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs" icon={<Edit3 className="w-3.5 h-3.5" />}>
                Update Bio
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs" icon={<Key className="w-3.5 h-3.5" />}>
                View Login History
              </Button>
              <Button variant="outline" className="w-full justify-start text-xs" icon={<Shield className="w-3.5 h-3.5" />}>
                Privacy Settings
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </TeacherLayout>
  );
};