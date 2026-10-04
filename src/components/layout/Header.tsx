import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Search,
  User,
  Menu,
  Bell,
  SlidersHorizontal
} from 'lucide-react';
import { DataSourceInfo } from '../../types';

interface HeaderProps {
  pageTitle: string;
  pageSubtitle: string;
  onSearch: (query: string) => void;
  searchQuery: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  dataSource: DataSourceInfo;
  onOpenSettings: () => void;
  onOpenMobileMenu?: () => void;
  onOpenAlerts?: () => void;
  alertCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  pageSubtitle,
  onSearch,
  searchQuery,
  onRefresh,
  isRefreshing,
  dataSource,
  onOpenSettings,
  onOpenMobileMenu,
  onOpenAlerts,
  alertCount = 3,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="shrink-0 z-30 w-full bg-slate-900 border-b border-slate-700 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">

        {/* Left: Mobile Toggle & Page Title/Subtitle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            aria-label="Toggle Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div>
            <h1 className="text-sm sm:text-base font-semibold text-slate-100 leading-tight">
              {pageTitle}
            </h1>
            <p className="text-[11px] text-slate-400 leading-tight hidden sm:block">
              {pageSubtitle}
            </p>
          </div>
        </div>

        {/* Right: Search, Last Updated Timestamp, Refresh, Notifications, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">

          {/* Global Search Bar */}
          <div className="relative w-40 sm:w-56 lg:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search objects, NORAD..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Last Updated info */}
          <div className="hidden lg:flex items-center text-xs text-slate-400 font-mono">
            <span>Last updated <strong className="text-slate-200">{currentTime || '14:40 UTC'}</strong></span>
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 rounded transition-colors active:scale-98 disabled:opacity-50"
            title="Refresh orbital catalog and risk predictions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Alerts / Notifications */}
          {onOpenAlerts && (
            <button
              onClick={onOpenAlerts}
              className="relative p-2 text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700 rounded transition-colors"
              title="View Conjunction Alerts"
            >
              <Bell className="w-3.5 h-3.5" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-[14px] rounded-full bg-brand-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {alertCount}
                </span>
              )}
            </button>
          )}

          {/* Settings Shortcut */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 border border-slate-700 rounded transition-colors hidden sm:flex"
            title="System Settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Operator Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
            <div className="w-7 h-7 rounded bg-slate-700 flex items-center justify-center text-slate-300 font-medium text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
