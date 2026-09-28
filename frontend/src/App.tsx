import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages — Public & Admin
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Teachers } from './pages/Teachers';
import { Subjects } from './pages/Subjects';
import { Classes } from './pages/Classes';
import { Timetable } from './pages/Timetable';
import { AttendanceSessions } from './pages/AttendanceSessions';
import { AttendanceHistory } from './pages/AttendanceHistory';
import { Settings } from './pages/Settings';

// Pages — Teacher
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherClasses } from './pages/teacher/TeacherClasses';
import { TeacherTimetable } from './pages/teacher/TeacherTimetable';
import { TeacherAttendanceStart } from './pages/teacher/TeacherAttendanceStart';
import { TeacherAttendanceHistory } from './pages/teacher/TeacherAttendanceHistory';
import { TeacherProfile } from './pages/teacher/TeacherProfile';

// Pages — Student
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentAttendance } from './pages/student/StudentAttendance';
import { StudentTimetable } from './pages/student/StudentTimetable';
import { StudentProfile } from './pages/student/StudentProfile';

/* ─── Route Guards ─────────────────────────────────────── */

const ProtectedRoute: React.FC<{
  children: React.ReactElement;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm font-sans">
        Loading FRAS Portal...
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    if (user.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['ADMIN']}>{children}</ProtectedRoute>
);

const TeacherRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['TEACHER']}>{children}</ProtectedRoute>
);

const StudentRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['STUDENT']}>{children}</ProtectedRoute>
);

/** Redirect to the right dashboard based on role */
const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm font-sans">
        Loading FRAS Portal...
      </div>
    );
  }

  if (user?.role === 'TEACHER') return <Navigate to="/teacher/dashboard" replace />;
  if (user?.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

/* ─── App ──────────────────────────────────────────────── */

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Root Landing Page */}
            <Route path="/" element={<Landing />} />

            {/* ── Admin Routes ── */}
            <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/students" element={<AdminRoute><Students /></AdminRoute>} />
            <Route path="/teachers" element={<AdminRoute><Teachers /></AdminRoute>} />
            <Route path="/subjects" element={<AdminRoute><Subjects /></AdminRoute>} />
            <Route path="/classes" element={<AdminRoute><Classes /></AdminRoute>} />
            <Route path="/timetable" element={<AdminRoute><Timetable /></AdminRoute>} />
            <Route path="/attendance/sessions" element={<AdminRoute><AttendanceSessions /></AdminRoute>} />
            <Route path="/attendance/history" element={<AdminRoute><AttendanceHistory /></AdminRoute>} />
            <Route path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />

            {/* ── Teacher Routes ── */}
            <Route path="/teacher/dashboard" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
            <Route path="/teacher/classes" element={<TeacherRoute><TeacherClasses /></TeacherRoute>} />
            <Route path="/teacher/timetable" element={<TeacherRoute><TeacherTimetable /></TeacherRoute>} />
            <Route path="/teacher/attendance/start" element={<TeacherRoute><TeacherAttendanceStart /></TeacherRoute>} />
            <Route path="/teacher/attendance/history" element={<TeacherRoute><TeacherAttendanceHistory /></TeacherRoute>} />
            <Route path="/teacher/profile" element={<TeacherRoute><TeacherProfile /></TeacherRoute>} />

            {/* ── Student Routes ── */}
            <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
            <Route path="/student/attendance" element={<StudentRoute><StudentAttendance /></StudentRoute>} />
            <Route path="/student/timetable" element={<StudentRoute><StudentTimetable /></StudentRoute>} />
            <Route path="/student/profile" element={<StudentRoute><StudentProfile /></StudentRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<ProtectedRoute><RootRedirect /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
