import React, { useState, useMemo } from 'react';
import { AlertItem, RiskLevel, AlertStatus } from '../../types';
import {
  Bell,
  Search,
  CheckCircle,
  Eye,
  Clock,
  ArrowRight
} from 'lucide-react';

interface AlertCenterProps {
  alerts: AlertItem[];
  onUpdateStatus: (alertId: string, status: AlertStatus) => void;
  onViewTrajectory: (alert: AlertItem) => void;
  onViewDetails: (objectId: string) => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({
  alerts,
  onUpdateStatus,
  onViewTrajectory,
  onViewDetails,
}) => {
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<RiskLevel | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alt) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          alt.id.toLowerCase().includes(q) ||
          alt.objectAName.toLowerCase().includes(q) ||
          alt.objectBName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedRiskFilter !== 'All' && alt.riskLevel !== selectedRiskFilter) return false;
      return true;
    });
  }, [alerts, searchQuery, selectedRiskFilter]);

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-700">
        <div>
          <h2 className="text-base font-semibold text-slate-100 font-sans">
            Conjunction Alert Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Active close approaches, risk classifications, and operational investigation statuses.
          </p>
        </div>

        {/* Risk Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-850 p-1 rounded border border-slate-750 self-start sm:self-auto">
          {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRiskFilter(r)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                selectedRiskFilter === r
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <span className="text-slate-400 text-[11px] hidden sm:inline">
          Showing {filteredAlerts.length} conjunction alerts
        </span>
      </div>

      {/* Alert Table */}
      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            
            <thead className="bg-slate-850 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-750">
              <tr>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Object A</th>
                <th className="py-2.5 px-3">Object B</th>
                <th className="py-2.5 px-3">Distance</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-750/70">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                    <CheckCircle className="w-6 h-6 mx-auto text-emerald-500 mb-2 opacity-80" />
                    No active conjunction alerts match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => {
                  return (
                    <tr key={alert.id} className="hover:bg-slate-850/60 transition-colors">
                      
                      {/* Time */}
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        {new Date(alert.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                      </td>

                      {/* Object A */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => onViewDetails(alert.objectAId)}
                          className="font-medium text-amber-400 hover:underline"
                        >
                          {alert.objectAName}
                        </button>
                      </td>

                      {/* Object B */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => onViewDetails(alert.objectBId)}
                          className="font-medium text-blue-400 hover:underline"
                        >
                          {alert.objectBName}
                        </button>
                      </td>

                      {/* Distance */}
                      <td className="py-3 px-3 font-semibold text-slate-100">
                        {alert.closestApproach} km
                      </td>

                      {/* Risk */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          alert.riskLevel === 'Critical'
                            ? 'badge-critical'
                            : alert.riskLevel === 'High'
                            ? 'badge-high'
                            : 'badge-medium'
                        }`}>
                          {alert.riskLevel.toUpperCase()}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-3">
                        <select
                          value={alert.status}
                          onChange={(e) => onUpdateStatus(alert.id, e.target.value as AlertStatus)}
                          className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 text-[11px] focus:outline-none cursor-pointer"
                        >
                          <option value="New">New</option>
                          <option value="Investigating">Investigating</option>
                          <option value="Monitoring">Monitoring</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => onViewTrajectory(alert)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium transition-colors"
                        >
                          Trajectory
                        </button>
                        <button
                          onClick={() => onViewDetails(alert.objectAId)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded text-[11px] font-medium transition-colors"
                        >
                          Details
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
};
