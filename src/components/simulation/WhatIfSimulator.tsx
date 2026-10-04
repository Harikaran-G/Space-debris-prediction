import React, { useState } from 'react';
import { SpaceObject, SimulationResult } from '../../types';
import { mlService } from '../../services/mlService';
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  TrendingDown,
  AlertTriangle,
  Fuel,
  Info,
  Trash2,
  CheckCircle2
} from 'lucide-react';

interface WhatIfSimulatorProps {
  objects: SpaceObject[];
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ objects }) => {
  const [targetId, setTargetId] = useState<string>(objects[2]?.id || objects[0]?.id || '');
  const [deltaAltitude, setDeltaAltitude] = useState<number>(12); // km
  const [deltaVelocity, setDeltaVelocity] = useState<number>(4.5); // m/s
  const [deltaInclination, setDeltaInclination] = useState<number>(0.15); // deg
  const [maneuverEpochMinutes, setManeuverEpochMinutes] = useState<number>(60); // min
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const targetObject = objects.find((o) => o.id === targetId) || objects[0];

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(() => {
    if (!targetObject) return null;
    return mlService.runWhatIfSimulation(targetObject, {
      targetObjectId: targetObject.id,
      deltaAltitude: 12,
      deltaVelocity: 4.5,
      deltaInclination: 0.15,
      burnDuration: 180,
      maneuverEpochMinutes: 60,
    });
  });

  const handleRunSimulation = () => {
    if (!targetObject) return;
    const result = mlService.runWhatIfSimulation(targetObject, {
      targetObjectId: targetObject.id,
      deltaAltitude,
      deltaVelocity,
      deltaInclination,
      burnDuration: 180,
      maneuverEpochMinutes,
    });
    setSimulationResult(result);
    setStatusNotice('Simulation processed successfully.');
    setTimeout(() => setStatusNotice(null), 3500);
  };

  const handleReset = () => {
    setDeltaAltitude(0);
    setDeltaVelocity(0);
    setDeltaInclination(0);
    if (targetObject) {
      setSimulationResult(
        mlService.runWhatIfSimulation(targetObject, {
          targetObjectId: targetObject.id,
          deltaAltitude: 0,
          deltaVelocity: 0,
          deltaInclination: 0,
          burnDuration: 0,
          maneuverEpochMinutes: 60,
        })
      );
    }
  };

  const handleDeleteSimulation = () => {
    setSimulationResult(null);
    setDeltaAltitude(0);
    setDeltaVelocity(0);
    setDeltaInclination(0);
    setStatusNotice('Simulation process data purged.');
    setTimeout(() => setStatusNotice(null), 3500);
  };

  return (
    <div className="space-y-4 font-mono text-xs">

      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-700">
        <div>
          <h2 className="text-base font-semibold text-slate-100 font-sans">
            Orbital What-If Simulation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Maneuver planning and delta-V parameter simulation for collision avoidance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {simulationResult && (
            <button
              onClick={handleDeleteSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/80 text-red-300 hover:text-white border border-red-500/40 rounded text-xs font-mono font-semibold transition-all active:scale-95 shadow"
              title="Delete and clear computed simulation process data"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>DELETE PROCESS DATA</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded text-[11px] self-start sm:self-auto font-sans">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulation Prototype</span>
          </div>
        </div>
      </div>

      {statusNotice && (
        <div className="p-2.5 bg-slate-850 border border-slate-700 text-slate-200 rounded text-xs font-mono flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{statusNotice}</span>
          </div>
          <button onClick={() => setStatusNotice(null)} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>
      )}

      {/* Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Maneuver Parameter Inputs */}
        <div className="surface-card p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-750 pb-2">
            <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wide">
              Parameters
            </h3>
            <button
              onClick={handleReset}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Select Spacecraft */}
          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 block">Space Object</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded p-2 text-xs focus:outline-none focus:border-blue-500"
            >
              {objects.map((o) => (
                <option key={`sim-opt-${o.id}`} value={o.id}>
                  {o.name} ({o.id}) - Risk: {o.riskProbability}%
                </option>
              ))}
            </select>
          </div>

          {/* Altitude */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Delta Altitude (Δh):</span>
              <span className="font-semibold text-slate-100">
                {deltaAltitude > 0 ? `+${deltaAltitude}` : deltaAltitude} km
              </span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              step={1}
              value={deltaAltitude}
              onChange={(e) => setDeltaAltitude(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded appearance-none"
            />
          </div>

          {/* Velocity */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Delta Velocity (Δv):</span>
              <span className="font-semibold text-slate-100">
                {deltaVelocity > 0 ? `+${deltaVelocity}` : deltaVelocity} m/s
              </span>
            </div>
            <input
              type="range"
              min={-30}
              max={30}
              step={0.5}
              value={deltaVelocity}
              onChange={(e) => setDeltaVelocity(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded appearance-none"
            />
          </div>

          {/* Inclination */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Delta Inclination (Δi):</span>
              <span className="font-semibold text-slate-100">
                {deltaInclination > 0 ? `+${deltaInclination}` : deltaInclination}°
              </span>
            </div>
            <input
              type="range"
              min={-1.5}
              max={1.5}
              step={0.05}
              value={deltaInclination}
              onChange={(e) => setDeltaInclination(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded appearance-none"
            />
          </div>

          {/* Time Horizon */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Time Horizon:</span>
              <span className="font-semibold text-amber-400">{maneuverEpochMinutes} min prior</span>
            </div>
            <input
              type="range"
              min={15}
              max={240}
              step={15}
              value={maneuverEpochMinutes}
              onChange={(e) => setManeuverEpochMinutes(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded appearance-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleRunSimulation}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run Simulation</span>
            </button>
            {simulationResult && (
              <button
                onClick={handleDeleteSimulation}
                className="px-3 py-2 bg-red-950/40 hover:bg-red-900/80 text-red-300 hover:text-white border border-red-500/40 rounded text-xs transition-colors"
                title="Delete simulation result"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Before vs After Risk Comparison */}
        <div className="lg:col-span-2 space-y-4">
          {!simulationResult ? (
            <div className="surface-card p-10 text-center space-y-3 font-mono border border-slate-700/60">
              <Trash2 className="w-8 h-8 text-slate-500 mx-auto opacity-70" />
              <div className="text-sm font-semibold text-slate-200">Simulation Data Cleared</div>
              <div className="text-xs text-slate-400 max-w-md mx-auto">
                No active maneuver assessment loaded. Adjust orbital delta parameters and click Run Simulation to compute post-burn conjunction kinematics.
              </div>
              <button
                onClick={handleRunSimulation}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold inline-flex items-center gap-2 transition-all active:scale-95 shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Compute Maneuver Simulation</span>
              </button>
            </div>
          ) : (
            <>
              <div className="surface-card p-4 space-y-3">
                <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wide border-b border-slate-750 pb-2">
                  Risk Comparison
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* Before */}
                  <div className="p-3.5 bg-slate-850 rounded border border-slate-750 space-y-2">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase">
                      Current Trajectory
                    </div>
                    <div className="text-2xl font-bold text-orange-400">
                      {simulationResult.originalRisk}%
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-750">
                      <div>Miss Distance: <strong className="text-slate-200">{simulationResult.originalDistance} km</strong></div>
                      <div>Altitude: <strong className="text-slate-200">{simulationResult.originalObject.altitude} km</strong></div>
                      <div>TCA: <strong className="text-slate-200">{simulationResult.originalTCA}</strong></div>
                    </div>
                  </div>

                  {/* After */}
                  <div className="p-3.5 bg-slate-850 rounded border border-slate-750 space-y-2">
                    <div className="text-[11px] text-slate-400 font-semibold uppercase flex items-center justify-between">
                      <span>Simulated Trajectory</span>
                      <span className="text-emerald-400 flex items-center gap-0.5 text-[10px]">
                        <TrendingDown className="w-3 h-3" /> Reduced
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {simulationResult.simulatedRisk}%
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-750">
                      <div>New Distance: <strong className="text-emerald-300">{simulationResult.simulatedDistance} km</strong></div>
                      <div>New Altitude: <strong className="text-slate-200">{simulationResult.simulatedObject.altitude} km</strong></div>
                      <div>New TCA: <strong className="text-slate-200">{simulationResult.simulatedTCA}</strong></div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Delta-V Budget & Clearance Margin */}
              <div className="surface-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-750 pb-2">
                  <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <Fuel className="w-4 h-4 text-blue-400" />
                    <span>Maneuver Feasibility</span>
                  </h3>
                  <span className="text-emerald-400 font-semibold text-xs">
                    {simulationResult.feasibility}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 bg-slate-850 rounded border border-slate-750">
                    <div className="text-slate-400 text-[10px]">Delta-V Cost</div>
                    <div className="text-sm font-semibold text-slate-100 mt-0.5">{simulationResult.fuelCostDeltaV} m/s</div>
                  </div>
                  <div className="p-2.5 bg-slate-850 rounded border border-slate-750">
                    <div className="text-slate-400 text-[10px]">Risk Delta</div>
                    <div className="text-sm font-semibold text-emerald-400 mt-0.5">
                      -{(simulationResult.originalRisk - simulationResult.simulatedRisk).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-850 rounded border border-slate-750">
                    <div className="text-slate-400 text-[10px]">Clearance Margin</div>
                    <div className="text-sm font-semibold text-slate-100 mt-0.5">
                      +{(simulationResult.simulatedDistance - simulationResult.originalDistance).toFixed(2)} km
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
};
