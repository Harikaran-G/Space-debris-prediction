import React from 'react';
import { Conjunction, SpaceObject } from '../../types';
import { 
  ArrowRight, 
  Clock, 
  Eye, 
  ShieldAlert
} from 'lucide-react';

interface CriticalConjunctionsProps {
  conjunctions: Conjunction[];
  onViewTrajectory: (conj: Conjunction) => void;
  onOpenDrawer: (obj: SpaceObject) => void;
}

export const CriticalConjunctions: React.FC<CriticalConjunctionsProps> = ({
  conjunctions,
  onViewTrajectory,
  onOpenDrawer,
}) => {
  return (
    <div className="surface-card p-4 flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-700">
        <div>
          <h3 className="font-semibold text-xs text-slate-100 uppercase tracking-wide">
            Critical Conjunctions
          </h3>
        </div>

        <span className="px-2 py-0.5 text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/30 rounded font-semibold">
          {conjunctions.length} High Risk
        </span>
      </div>

      {/* List */}
      <div className="space-y-2.5 overflow-y-auto max-h-[440px] pr-0.5 flex-1">
        {conjunctions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-mono text-xs bg-slate-850/60 border border-slate-800 rounded-lg flex flex-col items-center justify-center gap-2 h-full min-h-[220px]">
            <span className="font-semibold text-slate-300">No Critical Conjunctions</span>
            <span className="text-[11px] text-slate-500 max-w-xs">All orbital trajectories nominal or awaiting data ingestion.</span>
          </div>
        ) : (
          conjunctions.map((conj) => {
          return (
            <div
              key={conj.id}
              className="p-3 bg-slate-850 rounded border border-slate-750 hover:border-slate-650 transition-colors"
            >
              {/* Event Header & Risk Badge */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-mono text-slate-400 font-semibold truncate">
                  {conj.id}
                </span>
                <span
                  className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                    conj.riskLevel === 'Critical'
                      ? 'badge-critical'
                      : 'badge-high'
                  }`}
                >
                  {conj.riskLevel.toUpperCase()} • {conj.collisionProbability}%
                </span>
              </div>

              {/* Object Pair */}
              <div className="flex items-center gap-2 text-xs font-mono mb-2 py-1 px-2 bg-slate-800 rounded">
                <button
                  onClick={() => onOpenDrawer(conj.objectA)}
                  className="font-medium text-amber-400 hover:underline truncate text-left"
                >
                  {conj.objectA.name}
                </button>
                <span className="text-slate-500 shrink-0">→</span>
                <button
                  onClick={() => onOpenDrawer(conj.objectB)}
                  className="font-medium text-brand hover:underline truncate text-left"
                >
                  {conj.objectB.name}
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono mb-2.5">
                <div className="p-1.5 rounded bg-slate-800 border border-slate-750">
                  <div className="text-slate-400">Closest Approach</div>
                  <div className="text-xs font-semibold text-slate-100 mt-0.5">
                    {conj.closestApproachDistance < 1 
                      ? `${(conj.closestApproachDistance * 1000).toFixed(0)} m`
                      : `${conj.closestApproachDistance.toFixed(2)} km`}
                  </div>
                </div>
                <div className="p-1.5 rounded bg-slate-800 border border-slate-750">
                  <div className="text-slate-400">Rel Velocity</div>
                  <div className="text-xs font-semibold text-slate-100 mt-0.5">
                    {conj.relativeVelocity.toFixed(1)} km/s
                  </div>
                </div>
                <div className="p-1.5 rounded bg-slate-800 border border-slate-750">
                  <div className="text-slate-400">Time to TCA</div>
                  <div className="text-xs font-semibold text-amber-400 flex items-center justify-center gap-0.5 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {conj.timeToClosestApproach}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onViewTrajectory(conj)}
                  className="py-1.5 text-xs bg-brand hover:bg-[#2B7A78] text-white rounded font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>View Trajectory</span>
                </button>
                <button
                  onClick={() => onOpenDrawer(conj.objectA)}
                  className="py-1.5 text-xs bg-slate-750 hover:bg-slate-700 text-slate-200 border border-slate-650 rounded font-medium transition-colors"
                >
                  <span>Inspect Details</span>
                </button>
              </div>

            </div>
          );
        }))}
      </div>

    </div>
  );
};
