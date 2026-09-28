import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  School,
  CalendarDays,
  ClipboardCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  ScanLine,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [attendanceOpen, setAttendanceOpen] = useState(true);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Students', icon: Users, path: '/students' },
    { label: 'Teachers', icon: GraduationCap, path: '/teachers' },
    { label: 'Subjects', icon: BookOpen, path: '/subjects' },
    { label: 'Classes', icon: School, path: '/classes' },
    { label: 'Timetable', icon: CalendarDays, path: '/timetable' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`relative flex flex-col h-screen bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-sky-500 text-white shadow-lg shrink-0">
            <ScanLine className="w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-base tracking-wide text-white whitespace-nowrap">
                FRAS Admin
              </span>
              <span className="text-[10px] uppercase font-semibold text-primary-400 tracking-wider">
                Face Recog System
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle button */}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-900/40'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}

        {/* Attendance Collapsible Submenu */}
        <div>
          <button
            onClick={() => setAttendanceOpen(!attendanceOpen)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-slate-400 hover:text-slate-100 hover:bg-slate-800/60`}
          >
            <div className="flex items-center gap-3">
              <ClipboardCheck className="w-5 h-5 shrink-0 text-slate-400" />
              {!collapsed && <span>Attendance</span>}
            </div>
            {!collapsed && (
              <ChevronDown
                className={`w-4 h-4 transition-transform ${attendanceOpen ? 'rotate-180' : ''}`}
              />
            )}
          </button>

          {(attendanceOpen || collapsed) && (
            <div className={`mt-1 space-y-1 ${!collapsed ? 'pl-9' : 'pl-0'}`}>
              <NavLink
                to="/attendance/sessions"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600/30 text-primary-300 border-l-2 border-primary-500'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`
                }
              >
                {!collapsed ? 'Sessions' : <UserCheck className="w-4 h-4" />}
              </NavLink>
              <NavLink
                to="/attendance/history"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-600/30 text-primary-300 border-l-2 border-primary-500'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`
                }
              >
                {!collapsed ? 'History & Log' : <ClipboardCheck className="w-4 h-4" />}
              </NavLink>
            </div>
          )}
        </div>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
              isActive
                ? 'bg-primary-600 text-white shadow-md shadow-primary-900/40'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`
          }
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>

      {/* Bottom Admin Profile & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 shrink-0">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-2`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 text-primary-400 border border-slate-700 font-semibold text-xs shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {user?.name || 'Admin User'}
                </span>
                <span className="text-[10px] text-slate-500 truncate">
                  {user?.email || 'admin@university.edu'}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex justify-center p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
