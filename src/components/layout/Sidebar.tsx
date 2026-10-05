import React from 'react';
import {
  LayoutDashboard,
  Globe2,
  Database,
  ShieldAlert,
  Bell,
  BarChart3,
  Cpu,
  SlidersHorizontal,
  Settings,
  Rocket,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export type TabId = 
  | 'dashboard'
  | 'map'
  | 'tracking'
  | 'prediction'
  | 'alerts'
  | 'analytics'
  | 'model'
  | 'simulation'
  | 'settings';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
}

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  alertCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  alertCount = 3,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Orbital Map', icon: Globe2 },
    { id: 'tracking', label: 'Space Objects', icon: Database },
    { id: 'prediction', label: 'Predictions', icon: ShieldAlert },
    { 
      id: 'alerts', 
      label: 'Alerts', 
      icon: Bell, 
      badge: alertCount > 0 ? alertCount : undefined, 
      badgeColor: 'bg-red-500/10 text-red-400 border border-red-500/30' 
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'model', label: 'ML Model', icon: Cpu },
    { id: 'simulation', label: 'Simulation', icon: SlidersHorizontal },
  ];

  const handleItemClick = (id: TabId) => {
    onSelectTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:relative top-0 left-0 z-50 md:z-20 h-full bg-slate-900 border-r border-slate-700 flex flex-col justify-between shrink-0 transition-all duration-200 ease-in-out select-none overflow-hidden ${
          isMobileOpen
            ? 'translate-x-0 w-64 shadow-xl fixed inset-y-0 z-50'
            : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-16' : 'md:w-60'}`}
      >
        {/* Top Header */}
        <div className="flex flex-col shrink-0">
          <div className="h-12 flex items-center justify-between px-3.5 border-b border-slate-700">
            <div className={`flex items-center gap-2.5 overflow-hidden ${isCollapsed ? 'md:justify-center md:w-full' : ''}`}>
              {isCollapsed && !isMobileOpen ? (
                <span className="font-bold text-xs text-brand">SDA</span>
              ) : (
                <div className="flex flex-col">
                  <span className="font-semibold text-xs tracking-tight text-slate-100">
                    Space Debris
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Analyzer
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-200 rounded text-xs"
              aria-label="Close Sidebar"
            >
              ✕
            </button>
          </div>

          {/* Navigation Items - Compact single-page fit */}
          <nav className="p-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-brand font-semibold border-l-2 border-brand rounded-l-none'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  } ${isCollapsed ? 'md:justify-center md:px-2' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand' : 'text-slate-400'}`} />

                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate text-left flex-1">
                      {item.label}
                    </span>
                  )}

                  {(!isCollapsed || isMobileOpen) && item.badge && (
                    <span
                      className={`px-1.5 py-0.2 text-[10px] font-mono rounded ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {isCollapsed && !isMobileOpen && item.badge && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Settings & System Status */}
        <div className="p-2 border-t border-slate-700 space-y-1 shrink-0">
          {/* Settings Tab */}
          <button
            onClick={() => handleItemClick('settings')}
            title={isCollapsed ? 'Settings' : undefined}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-brand font-semibold border-l-2 border-brand rounded-l-none'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            } ${isCollapsed ? 'md:justify-center md:px-2' : ''}`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>Settings</span>}
          </button>

          {/* System Status */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-2.5 py-1.5 text-[11px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-750 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand inline-block"></span>
                <span>System Online</span>
              </div>
              <span className="text-[10px] text-slate-400">v2.4</span>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex w-full items-center justify-center p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 text-xs"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <span>»</span> : <span>«</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
