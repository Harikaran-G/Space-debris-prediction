import React, { useState } from 'react';
import { DataSourceInfo } from '../../types';
import {
  Settings,
  Database,
  Server,
  SlidersHorizontal,
  Bell,
  Save,
  CheckCircle,
  Info,
  Trash2,
  RotateCcw
} from 'lucide-react';

interface SettingsPageProps {
  dataSource: DataSourceInfo;
  onUpdateDataSource?: (info: DataSourceInfo) => void;
  onClearCatalog?: () => void;
  onResetCatalog?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  dataSource,
  onClearCatalog,
  onResetCatalog,
}) => {
  const [refreshInterval, setRefreshInterval] = useState('1s');
  const [coordinateSystem, setCoordinateSystem] = useState('ECI (Earth-Centered Inertial J2000)');
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000/api/v1');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Page Title & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-700">
        <div>
          <h2 className="text-base font-semibold text-slate-100 font-sans">
            System Settings & Telemetry Ingestion
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Data source configuration, coordinate reference frames, and REST API service endpoints.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-sans font-medium rounded text-xs transition-colors self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Settings</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded flex items-center gap-2 font-sans">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Settings saved. Propagator state updated.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Section 1: System Information & Data Quality */}
        <div className="surface-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-750 pb-2">
            <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
              <Database className="w-4 h-4 text-blue-400" />
              <span>Data Source Information</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Available
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-slate-850 rounded border border-slate-750">
              <span className="text-slate-400">Data Source:</span>
              <span className="text-slate-100 font-semibold">{dataSource.name}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-850 rounded border border-slate-750">
              <span className="text-slate-400">Objects Loaded:</span>
              <span className="text-slate-100 font-semibold">{dataSource.totalObjects.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-850 rounded border border-slate-750">
              <span className="text-slate-400">Last Updated:</span>
              <span className="text-slate-200">{dataSource.lastUpdated}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-850 rounded border border-slate-750">
              <span className="text-slate-400">Data Quality:</span>
              <span className="text-emerald-400 font-semibold">{dataSource.dataQuality}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-850 rounded border border-slate-750">
              <span className="text-slate-400">Data Coverage:</span>
              <span className="text-slate-200">{dataSource.coverage}</span>
            </div>
          </div>
        </div>

        {/* Section 2: REST API Endpoints */}
        <div className="surface-card p-4 space-y-3">
          <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wide border-b border-slate-750 pb-2 flex items-center gap-1.5">
            <Server className="w-4 h-4 text-blue-400" />
            <span>REST API Integration</span>
          </h3>

          <div className="space-y-3 pt-1">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">API Endpoint URL</label>
              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="p-2.5 bg-slate-850 rounded border border-slate-750 text-[11px] space-y-1 text-slate-400">
              <div className="text-slate-200 font-semibold mb-1">Configured Routes:</div>
              <div>GET <span className="text-slate-200">/api/objects</span> (State vectors)</div>
              <div>GET <span className="text-slate-200">/api/conjunctions</span> (Encounters)</div>
              <div>POST <span className="text-slate-200">/api/predictions</span> (ML model)</div>
              <div>POST <span className="text-slate-200">/api/simulation</span> (Delta-V maneuvers)</div>
            </div>
          </div>
        </div>

        {/* Section 3: Astrodynamics & Coordinates */}
        <div className="surface-card p-4 space-y-3">
          <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wide border-b border-slate-750 pb-2 flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <span>Astrodynamics Configuration</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Coordinate Reference Frame</label>
              <select
                value={coordinateSystem}
                onChange={(e) => setCoordinateSystem(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
              >
                <option>ECI (Earth-Centered Inertial J2000)</option>
                <option>ECEF (Earth-Centered Earth-Fixed WGS84)</option>
                <option>TEME (True Equator Mean Equinox / SGP4)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Telemetry Refresh Frequency</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="1s">1.0s (Real-time telemetry stream)</option>
                <option value="5s">5.0s (Standard polling)</option>
                <option value="30s">30.0s (Bandwidth saving)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Alarm Thresholds */}
        <div className="surface-card p-4 space-y-3">
          <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wide border-b border-slate-750 pb-2 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-blue-400" />
            <span>Alert Thresholds</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-slate-850 rounded border border-slate-750">
              <div>
                <div className="font-semibold text-slate-200">Audio Warning Chimes</div>
                <div className="text-[10px] text-slate-400">Play alert on &gt;85% risk conjunction</div>
              </div>
              <input
                type="checkbox"
                checked={audioAlerts}
                onChange={(e) => setAudioAlerts(e.target.checked)}
                className="w-4 h-4 accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="p-2.5 bg-slate-850 rounded border border-slate-750 text-[11px] text-slate-400">
              Operational rules flag all events with miss distance &lt; 0.5 km or collision probability &gt; 85% as Critical.
            </div>
          </div>
        </div>

        {/* Section 5: Data Lifecycle & Cache Purge */}
        <div className="surface-card p-4 space-y-3 lg:col-span-2">
          <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wide border-b border-slate-750 pb-2 flex items-center gap-1.5">
            <Trash2 className="w-4 h-4 text-red-400" />
            <span>Data Lifecycle & Telemetry Management</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-850 rounded border border-slate-750 space-y-2">
              <div className="text-slate-200 font-semibold text-xs">Purge Processed Data & Catalog</div>
              <p className="text-[11px] text-slate-400">
                Delete all imported space objects, active trajectories, and ML process outputs from memory.
              </p>
              {onClearCatalog && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete ALL telemetry and empty the catalog?')) {
                      onClearCatalog();
                    }
                  }}
                  className="px-3 py-1.5 bg-red-950/50 hover:bg-red-900/80 text-red-300 hover:text-white border border-red-500/40 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge All Ingested Data</span>
                </button>
              )}
            </div>

            <div className="p-3 bg-slate-850 rounded border border-slate-750 space-y-2">
              <div className="text-slate-200 font-semibold text-xs">Reset Baseline Space Catalog</div>
              <p className="text-[11px] text-slate-400">
                Restore the default 12 baseline high-fidelity satellites and trackable debris fragments.
              </p>
              {onResetCatalog && (
                <button
                  onClick={() => {
                    if (window.confirm('Reset catalog to baseline Space-Track dataset?')) {
                      onResetCatalog();
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-950/60 hover:bg-blue-900 text-blue-300 hover:text-white border border-blue-500/40 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Default Catalog</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
