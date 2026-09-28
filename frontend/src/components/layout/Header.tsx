import React from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../notifications/NotificationBell';
import { ThemeToggle } from '../theme/ThemeToggle';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center h-16 px-4 sm:px-6 gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-150">
      {/* LEFT: Title section — grows to fill available space */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      {/* RIGHT: Controls — stays compact */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* PostgreSQL status badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
          <Database className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="hidden lg:inline">PostgreSQL 18</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        </div>

        {/* Refresh */}
        <button
          onClick={() => window.location.reload()}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Refresh Data"
          aria-label="Refresh page data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <NotificationBell />

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">
              {user?.name?.split(' ')[0] || user?.username || 'User'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
              {user?.role?.toLowerCase() || 'admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
