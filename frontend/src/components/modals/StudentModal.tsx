import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Student, ClassEntity } from '../../types';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Partial<Student>) => Promise<void>;
  student?: Student | null;
  classes: ClassEntity[];
  isLoading?: boolean;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  student,
  classes,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    student_id: '',
    name: '',
    class_id: '',
    email: '',
    phone: '',
    is_active: true,
    face_registered: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      // Ensure phone contains only digits (max 10) when opening edit modal
      const rawPhone = (student.phone || '').replace(/\D/g, '').slice(0, 10);
      setFormData({
        ...student,
        phone: rawPhone,
      });
    } else {
      setFormData({
        student_id: `S${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        class_id: classes[0]?.class_id || '',
        email: '',
        phone: '',
        is_active: true,
        face_registered: false,
      });
    }
    setErrors({});
  }, [student, isOpen, classes]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Restrict input to digits only and maximum 10 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: digitsOnly });
    
    // Live error clearing if valid
    if (digitsOnly.length === 10) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.phone;
        return copy;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.student_id?.trim()) errs.student_id = 'Student ID is required';
    if (!formData.name?.trim()) errs.name = 'Full Name is required';
    if (!formData.class_id) errs.class_id = 'Class selection is required';
    if (!formData.email?.trim()) errs.email = 'Email address is required';
    
    // Strict 10-digit phone number validation
    if (!formData.phone || formData.phone.length !== 10) {
      errs.phone = 'Phone number is required and must be exactly 10 digits';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const selectedClass = classes.find((c) => c.class_id === formData.class_id);
    onSave({
      ...formData,
      class_name: selectedClass?.class_name || formData.class_id,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={student ? 'Edit Student' : 'Add New Student'}
      subtitle={student ? `Updating records for ${student.student_id}` : 'Fill in student credentials and assigned class'}
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            {student ? 'Update Student' : 'Add Student'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Student ID *
            </label>
            <input
              type="text"
              value={formData.student_id || ''}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              disabled={!!student}
              placeholder="e.g. S1001"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60 text-slate-900 dark:text-slate-100"
            />
            {errors.student_id && <p className="text-xs text-rose-500 mt-1">{errors.student_id}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Alex Johnson"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assign Class *
            </label>
            <select
              value={formData.class_id || ''}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
            >
              <option value="">Select a Class</option>
              {classes.map((c) => (
                <option key={c.class_id} value={c.class_id}>
                  {c.class_name} ({c.class_id})
                </option>
              ))}
            </select>
            {errors.class_id && <p className="text-xs text-rose-500 mt-1">{errors.class_id}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="alex@student.edu"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100"
            />
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number (10 digits) *
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={formData.phone || ''}
              onChange={handlePhoneChange}
              placeholder="e.g. 9876543210"
              className={`w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border ${
                errors.phone ? 'border-rose-500 font-semibold' : 'border-slate-200 dark:border-slate-700'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-100 font-mono`}
            />
            {errors.phone ? (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.phone}</p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">Digits only, exactly 10 digits</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Face Registration Status
            </label>
            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.face_registered ?? false}
                  onChange={(e) => setFormData({ ...formData, face_registered: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                Face Dataset Captured & Registered
              </label>
            </div>
          </div>
        </div>

        {/* Student Account Status with explicit help text */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active ?? true}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
            />
            Student Account Active Status
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong>Active</strong> = current student eligible for face-recognition attendance sessions.
            <br />
            <strong>Inactive</strong> = student is no longer active, but all historical attendance records are strictly retained in PostgreSQL.
          </p>
        </div>
      </form>
    </Modal>
  );
};
