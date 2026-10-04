import React, { useState } from 'react';
import { SpaceObject, Conjunction } from '../../types';
import { OrbitalCanvas } from '../3d/OrbitalCanvas';
import {
  Satellite,
  Trash2,
  Orbit,
  TrendingUp,
  ShieldAlert,
  History,
  Info,
  Compass,
  CheckCircle2,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ObjectDetailsViewProps {
  object: SpaceObject;
  allObjects: SpaceObject[];
  conjunctions: Conjunction[];
  onBack?: () => void;
  onSelectAnotherObject?: (obj: SpaceObject) => void;
}

type TabType = 'overview' | 'orbit' | 'prediction' | 'risk' | 'history';

export const ObjectDetailsView: React.FC<ObjectDetailsViewProps> = ({
  object,
  allObjects,
  conjunctions,
  onSelectAnotherObject,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const relevantConjunctions = conjunctions.filter(
    (c) => c.objectA.id === object.id || c.objectB.id === object.id
  );

  const historyData = [
    { date: 'Sep 28', altitude: object.altitude + 0.4, risk: Math.max(5, object.riskProbability - 25) },
    { date: 'Sep 30', altitude: object.altitude + 0.2, risk: Math.max(8, object.riskProbability - 15) },
    { date: 'Oct 02', altitude: object.altitude + 0.1, risk: Math.max(12, object.riskProbability - 8) },
    { date: 'Oct 04 (Now)', altitude: object.altitude, risk: object.riskProbability },
  ];

  const futureData = [
    { epoch: 'Now', altitude: object.altitude },
    { epoch: '+30d', altitude: object.altitude - 0.2 },
    { epoch: '+60d', altitude: object.altitude - 0.5 },
    { epoch: '+180d', altitude: object.altitude - 1.8 },
    { epoch: '+1y', altitude: object.altitude - 4.2 },
  ];

  return (
    <div className="space-y-4 font-mono">
      
      {/* Top Banner & Header */}
      <div className="glass-panel-glow rounded-xl p-3.5 sm:p-4 border border-cyan-500/30 shadow-glass">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border shrink-0 ${
              object.type === 'Satellite'
                ? 'bg-blue-950/80 border-blue-500/40 text-blue-400'
                : 'bg-amber-950/80 border-amber-500/40 text-amber-400'
            }`}>
              {object.type === 'Satellite' ? <Satellite className="w-5 h-5 sm:w-6 sm:h-6" /> : <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-orbitron font-bold text-slate-100">
                  {object.name}
                </h1>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  object.riskLevel === 'Critical'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/60'
                    : object.riskLevel === 'High'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/60'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/60'
                }`}>
                  {object.riskLevel.toUpperCase()} RISK ({object.riskProbability}%)
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                <span>ID: <strong className="text-cyan-300">{object.id}</strong></span>
                <span>•</span>
                <span>NORAD: <strong className="text-slate-200">{object.noradId}</strong></span>
                <span>•</span>
                <span className="truncate max-w-xs">{object.origin || 'Unknown'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="bg-space-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center text-xs">
              <div className="text-[10px] text-slate-500">Altitude</div>
              <div className="text-slate-100 font-bold">{object.altitude} km</div>
            </div>
            <div className="bg-space-950 px-3 py-1.5 rounded-lg border border-slate-800 text-center text-xs">
              <div className="text-[10px] text-slate-500">Period</div>
              <div className="text-cyan-300 font-bold">{object.period} min</div>
            </div>
          </div>

        </div>

        {/* Tab Navigation (Horizontally scrollable on mobile) */}
        <div className="flex items-center gap-1.5 pt-3 overflow-x-auto pb-1 no-scrollbar flex-nowrap">
          {[
            { id: 'overview', label: 'Overview', icon: Info },
            { id: 'orbit', label: 'Orbit 3D', icon: Orbit },
            { id: 'prediction', label: 'Prediction', icon: TrendingUp },
            { id: 'risk', label: 'Conjunction Risk', icon: ShieldAlert },
            { id: 'history', label: 'History', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-850 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          <div className="glass-panel rounded-xl p-4 space-y-3">
            <div className="text-xs font-orbitron font-bold text-cyan-300 flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Orbit className="w-4 h-4" />
              Keplerian Orbital Elements (SGP4 State Vector)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded bg-space-950/70 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Semi-Major Axis (a)</span>
                <span className="text-slate-100 font-bold">{object.semiMajorAxis} km</span>
              </div>
              <div className="p-2.5 rounded bg-space-950/70 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Eccentricity (e)</span>
                <span className="text-slate-100 font-bold">{object.eccentricity.toFixed(5)}</span>
              </div>
              <div className="p-2.5 rounded bg-space-950/70 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Inclination (i)</span>
                <span className="text-slate-100 font-bold">{object.inclination.toFixed(2)}°</span>
              </div>
              <div className="p-2.5 rounded bg-space-950/70 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Orbital Period (T)</span>
                <span className="text-slate-100 font-bold">{object.period} minutes</span>
              </div>
              <div className="p-2.5 rounded bg-space-950/70 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">RAAN (Ω)</span>
                <span className="text-slate-100 font-bold">{object.raan.toFixed(1)}°</span>
              </div>
              <div className="p-2.5 rounded bg-space-950/70 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Arg of Perigee (ω)</span>
                <span className="text-slate-100 font-bold">{object.argPerigee.toFixed(1)}°</span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4 space-y-3">
            <div className="text-xs font-orbitron font-bold text-cyan-300 flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <Compass className="w-4 h-4" />
              Physical & Mission Metadata
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2.5 rounded bg-space-950/70 border border-slate-800">
                <span className="text-slate-400">Object Type:</span>
                <span className="text-slate-100 font-bold">{object.type}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded bg-space-950/70 border border-slate-800">
                <span className="text-slate-400">Estimated Size:</span>
                <span className="text-slate-100 font-bold">{object.estimatedSize}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded bg-space-950/70 border border-slate-800">
                <span className="text-slate-400">Radar Cross Section (RCS):</span>
                <span className="text-slate-100 font-bold">{object.rcs || 'Medium'}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded bg-space-950/70 border border-slate-800">
                <span className="text-slate-400">Apogee / Perigee:</span>
                <span className="text-cyan-300 font-bold">{object.apogee || object.altitude + 5} km / {object.perigee || object.altitude - 5} km</span>
              </div>
              <div className="flex justify-between p-2.5 rounded bg-space-950/70 border border-slate-800">
                <span className="text-slate-400">Launch Date:</span>
                <span className="text-slate-100">{object.launchDate || 'Undisclosed'}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: 3D Orbit */}
      {activeTab === 'orbit' && (
        <div className="glass-panel rounded-xl p-3 sm:p-4 h-[340px] sm:h-[420px] md:h-[480px] flex flex-col">
          <div className="text-xs font-orbitron font-bold text-slate-100 mb-2 flex items-center justify-between">
            <span>3D Orbit Trajectory</span>
            <span className="text-[10px] text-cyan-400 font-mono truncate max-w-[150px] sm:max-w-none">{object.name}</span>
          </div>
          <div className="flex-1 rounded-lg overflow-hidden border border-slate-800 relative">
            <OrbitalCanvas
              objects={allObjects}
              selectedObject={object}
              onSelectObject={(o) => onSelectAnotherObject?.(o)}
              conjunctions={relevantConjunctions}
              showOrbits={true}
              showPredictedPath={true}
            />
          </div>
        </div>
      )}

      {/* Tab 3: Future Prediction */}
      {activeTab === 'prediction' && (
        <div className="glass-panel rounded-xl p-4 space-y-3">
          <div className="text-xs font-orbitron font-bold text-cyan-300 pb-2 border-b border-slate-800">
            Atmospheric Drag Decay & 1-Year Horizon
          </div>
          <div className="h-44 sm:h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={futureData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="epoch" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" domain={['auto', 'auto']} tick={{ fontSize: 10, fontFamily: 'monospace' }} unit="km" />
                <Tooltip />
                <Line type="monotone" dataKey="altitude" name="Altitude (km)" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 4: Risk */}
      {activeTab === 'risk' && (
        <div className="glass-panel rounded-xl p-4 space-y-3">
          <div className="text-xs font-orbitron font-bold text-red-400 pb-2 border-b border-slate-800 flex items-center justify-between">
            <span>Conjunction Assessment</span>
            <span>{relevantConjunctions.length} Events</span>
          </div>
          {relevantConjunctions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              No active conjunction threats for this object.
            </div>
          ) : (
            <div className="space-y-2">
              {relevantConjunctions.map((c) => (
                <div key={c.id} className="p-3 rounded-lg bg-space-950 border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-100">
                      {c.objectA.name} <span className="text-red-400">⚡</span> {c.objectB.name}
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      Closest Approach: <strong className="text-slate-200">{c.closestApproachDistance} km</strong> • TCA: <strong className="text-amber-300">{c.timeToClosestApproach}</strong>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 ${
                    c.riskLevel === 'Critical'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/60'
                      : 'bg-orange-500/20 text-orange-400 border border-orange-500/60'
                  }`}>
                    {c.riskLevel.toUpperCase()} ({c.collisionProbability}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: History */}
      {activeTab === 'history' && (
        <div className="glass-panel rounded-xl p-4 space-y-3">
          <div className="text-xs font-orbitron font-bold text-cyan-300 pb-2 border-b border-slate-800">
            Historical Telemetry
          </div>
          <div className="h-44 sm:h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10, fontFamily: 'monospace' }} unit="%" />
                <Tooltip />
                <Line type="monotone" dataKey="risk" name="Risk %" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
};
