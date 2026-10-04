import React, { useState } from 'react';
import { RiskLevel } from '../../types';
import {
  SlidersHorizontal,
  RotateCcw,
  Orbit,
  MapPin,
  TrendingUp,
  Clock,
  Layers,
  Zap,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';

interface OrbitalMapControlsProps {
  objectTypeFilter: 'All' | 'Satellites' | 'Debris';
  onChangeObjectType: (type: 'All' | 'Satellites' | 'Debris') => void;
  riskFilter: RiskLevel | 'All';
  onChangeRiskFilter: (risk: RiskLevel | 'All') => void;
  maxAltitude: number;
  onChangeMaxAltitude: (alt: number) => void;
  timeOffsetHours: number;
  onChangeTimeOffset: (hours: number) => void;
  showOrbits: boolean;
  onToggleOrbits: () => void;
  showGroundTrack: boolean;
  onToggleGroundTrack: () => void;
  showPredictedPath: boolean;
  onTogglePredictedPath: () => void;
  showConjunctionLines: boolean;
  onToggleConjunctionLines: () => void;
  onResetView?: () => void;
}

export const OrbitalMapControls: React.FC<OrbitalMapControlsProps> = ({
  objectTypeFilter,
  onChangeObjectType,
  riskFilter,
  onChangeRiskFilter,
  maxAltitude,
  onChangeMaxAltitude,
  timeOffsetHours,
  onChangeTimeOffset,
  showOrbits,
  onToggleOrbits,
  showGroundTrack,
  onToggleGroundTrack,
  showPredictedPath,
  onTogglePredictedPath,
  showConjunctionLines,
  onToggleConjunctionLines,
  onResetView,
}) => {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  return (
    <div className="surface-card p-3 sm:p-3.5 border border-slate-700 text-xs font-mono space-y-3">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-brand" />
          <span className="font-semibold text-slate-100 uppercase tracking-wide text-xs">
            Orbital Controls & Filters
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onResetView && (
            <button
              onClick={onResetView}
              className="flex items-center gap-1 text-[11px] text-brand hover:text-[#DEF2F1] px-2 py-1 bg-slate-800 rounded border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}

          {/* Mobile Accordion Toggle */}
          <button
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className="md:hidden flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-brand border border-slate-700 text-xs font-bold"
          >
            <Filter className="w-3 h-3" />
            <span>{mobileExpanded ? 'Hide Filters' : 'Filters ▾'}</span>
          </button>
        </div>
      </div>

      {/* Filter Grid (Always visible on Desktop/Tablet, toggleable on Mobile) */}
      <div className={`${mobileExpanded ? 'block' : 'hidden md:grid'} grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3`}>
        
        {/* Object Type */}
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">
            Category Mode
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-800 p-1 rounded border border-slate-700 text-[11px]">
            {(['Satellites', 'All', 'Debris'] as const).map((type) => (
              <button
                key={type}
                onClick={() => onChangeObjectType(type)}
                className={`py-1.5 min-h-[36px] rounded font-medium text-center transition-colors ${
                  objectTypeFilter === type
                    ? 'bg-brand-500 text-[#FEFFFF] font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Threshold */}
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">
            Risk Tier
          </label>
          <div className="grid grid-cols-5 gap-0.5 bg-slate-800 p-1 rounded border border-slate-700 text-[10px]">
            {(['All', 'Low', 'Med', 'High', 'Crit'] as const).map((label, idx) => {
              const rMap: (RiskLevel | 'All')[] = ['All', 'Low', 'Medium', 'High', 'Critical'];
              const r = rMap[idx];
              return (
                <button
                  key={r}
                  onClick={() => onChangeRiskFilter(r)}
                  className={`py-1.5 min-h-[36px] rounded font-medium text-center transition-colors truncate ${
                    riskFilter === r
                      ? r === 'Critical'
                        ? 'bg-brand-500 text-[#FEFFFF] font-bold'
                        : r === 'High'
                        ? 'bg-brand-600 text-[#FEFFFF] font-semibold'
                        : 'bg-slate-700 text-[#FEFFFF] font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Altitude Range Slider */}
        <div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider mb-1">
            <span>Max Altitude</span>
            <span className="text-brand font-bold">{maxAltitude} km</span>
          </div>
          <input
            type="range"
            min={300}
            max={2000}
            step={50}
            value={maxAltitude}
            onChange={(e) => onChangeMaxAltitude(Number(e.target.value))}
            className="w-full accent-[#C3073F] cursor-pointer h-2 bg-slate-800 rounded appearance-none border border-slate-700"
          />
          <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
            <span>300 km</span>
            <span>1000 km</span>
            <span>2000 km</span>
          </div>
        </div>

        {/* Time Propagation Stepper */}
        <div>
          <label className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-brand" />
              Time Step
            </span>
            <span className="text-brand-300 font-bold">{timeOffsetHours === 0 ? 'NOW' : `+${timeOffsetHours}h`}</span>
          </label>
          <div className="grid grid-cols-5 gap-1 bg-slate-800 p-1 rounded border border-slate-700 text-[10px]">
            {[0, 1, 6, 12, 24].map((hours) => (
              <button
                key={hours}
                onClick={() => onChangeTimeOffset(hours)}
                className={`py-1.5 min-h-[36px] rounded font-medium text-center transition-colors ${
                  timeOffsetHours === hours
                    ? 'bg-brand-600 text-[#FEFFFF] font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {hours === 0 ? 'NOW' : `+${hours}h`}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Display Layer Toggles */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 border-t border-slate-700">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider mr-1 hidden sm:flex items-center gap-1">
          <Layers className="w-3 h-3 text-brand" /> Layers:
        </span>

        <button
          onClick={onToggleOrbits}
          className={`flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded text-[11px] font-medium transition-colors ${
            showOrbits
              ? 'bg-brand-700 text-[#FEFFFF] font-semibold border border-brand-500/50'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
          }`}
        >
          <Orbit className="w-3 h-3" />
          <span>Orbits</span>
        </button>

        <button
          onClick={onTogglePredictedPath}
          className={`flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded text-[11px] font-medium transition-colors ${
            showPredictedPath
              ? 'bg-brand-600 text-[#FEFFFF] font-semibold border border-brand-400/50'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3 h-3" />
          <span>Predicted</span>
        </button>

        <button
          onClick={onToggleConjunctionLines}
          className={`flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded text-[11px] font-medium transition-colors ${
            showConjunctionLines
              ? 'bg-brand-500 text-[#FEFFFF] font-semibold border border-brand-400/60'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>Beams</span>
        </button>

        <button
          onClick={onToggleGroundTrack}
          className={`flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded text-[11px] font-medium transition-colors ${
            showGroundTrack
              ? 'bg-brand-700 text-[#FEFFFF] font-semibold border border-brand-500/50'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
          }`}
        >
          <MapPin className="w-3 h-3" />
          <span>Ground Track</span>
        </button>
      </div>

    </div>
  );
};
