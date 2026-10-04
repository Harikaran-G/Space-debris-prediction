import React from 'react';
import { SpaceObject, Conjunction } from '../../types';
import { 
  X, 
  Orbit, 
  ShieldAlert, 
  ExternalLink,
  Satellite,
  Trash2,
  Clock,
  Compass
} from 'lucide-react';

interface ObjectDetailsDrawerProps {
  object: SpaceObject | null;
  conjunctions: Conjunction[];
  isOpen: boolean;
  onClose: () => void;
  onViewFullDetails: (obj: SpaceObject) => void;
  onDeleteObject?: (id: string) => void;
}

export const ObjectDetailsDrawer: React.FC<ObjectDetailsDrawerProps> = ({
  object,
  conjunctions,
  isOpen,
  onClose,
  onViewFullDetails,
  onDeleteObject,
}) => {
  if (!isOpen || !object) return null;

  // Check if there is an active close approach involving this object
  const activeConjunction = conjunctions.find(
    (c) => c.objectA.id === object.id || c.objectB.id === object.id
  );

  return (
    <>
      {/* Backdrop on mobile */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-30 lg:hidden"
        aria-hidden="true"
      />

      {/* Right-Side Drawer - Opaque, Solid Background & Header */}
      <aside className="fixed lg:absolute top-0 right-0 z-40 h-full w-full sm:w-96 bg-[#1A1A1D] border-l border-slate-700 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header (Solid Opaque) */}
        <div>
          <div className="h-13 px-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-100 font-mono">
                {object.id}
              </span>
              <span className="text-xs text-slate-400">
                (NORAD {object.noradId})
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-700 transition-colors"
              aria-label="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-130px)] text-xs">
            
            {/* Title & Status Badge */}
            <div className="p-3 bg-slate-800 rounded border border-slate-700">
              <div className="text-sm font-semibold text-slate-100 mb-1">
                {object.name}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  {object.type === 'Satellite' ? <Satellite className="w-3.5 h-3.5 text-brand" /> : <Trash2 className="w-3.5 h-3.5 text-amber-400" />}
                  {object.type} • {object.orbitType}
                </span>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  object.riskLevel === 'Critical'
                    ? 'badge-critical'
                    : object.riskLevel === 'High'
                    ? 'badge-high'
                    : object.riskLevel === 'Medium'
                    ? 'badge-medium'
                    : 'badge-low'
                }`}>
                  {object.riskLevel.toUpperCase()} RISK
                </span>
              </div>
            </div>

            {/* Section 1: Orbital Parameters */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 border-b border-slate-700 pb-1">
                <Orbit className="w-3.5 h-3.5 text-brand" />
                <span>Orbital Parameters</span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2 bg-slate-800 rounded border border-slate-700">
                  <div className="text-[10px] text-slate-400">Altitude</div>
                  <div className="text-slate-100 font-semibold mt-0.5">{object.altitude} km</div>
                </div>
                <div className="p-2 bg-slate-800 rounded border border-slate-700">
                  <div className="text-[10px] text-slate-400">Velocity</div>
                  <div className="text-slate-100 font-semibold mt-0.5">{object.velocity} km/s</div>
                </div>
                <div className="p-2 bg-slate-800 rounded border border-slate-700">
                  <div className="text-[10px] text-slate-400">Inclination</div>
                  <div className="text-slate-100 font-semibold mt-0.5">{object.inclination}°</div>
                </div>
                <div className="p-2 bg-slate-800 rounded border border-slate-700">
                  <div className="text-[10px] text-slate-400">Eccentricity</div>
                  <div className="text-slate-100 font-semibold mt-0.5">{object.eccentricity.toFixed(4)}</div>
                </div>
                <div className="p-2 bg-slate-800 rounded border border-slate-700 col-span-2">
                  <div className="text-[10px] text-slate-400">Orbital Period</div>
                  <div className="text-slate-100 font-semibold mt-0.5">{object.period} minutes</div>
                </div>
              </div>
            </div>

            {/* Section 2: Risk Assessment */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 border-b border-slate-700 pb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Risk Assessment</span>
              </div>

              <div className="space-y-2 font-mono">
                <div className="flex justify-between p-2 bg-slate-800 rounded border border-slate-700">
                  <span className="text-slate-400">Probability:</span>
                  <span className="font-bold text-slate-100">{object.riskProbability}%</span>
                </div>

                {activeConjunction ? (
                  <>
                    <div className="flex justify-between p-2 bg-slate-800 rounded border border-slate-700">
                      <span className="text-slate-400">Closest Approach:</span>
                      <span className="font-bold text-slate-100">{activeConjunction.closestApproachDistance} km</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-800 rounded border border-slate-700">
                      <span className="text-slate-400">Relative Velocity:</span>
                      <span className="font-bold text-slate-100">{activeConjunction.relativeVelocity} km/s</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-800 rounded border border-slate-700">
                      <span className="text-slate-400">Time to Event:</span>
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {activeConjunction.timeToClosestApproach}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700 text-slate-400 text-[11px]">
                    No immediate critical close-approach conjunctions within 0.5 km.
                  </div>
                )}
              </div>
            </div>

            {/* Metadata info */}
            <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700 text-[11px] text-slate-400 space-y-1">
              <div>Origin: <span className="text-slate-200">{object.origin || 'N/A'}</span></div>
              <div>Estimated Size: <span className="text-slate-200">{object.estimatedSize}</span></div>
            </div>

          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-3 border-t border-slate-700 bg-slate-900 shrink-0 space-y-2">
          <button
            onClick={() => onViewFullDetails(object)}
            className="w-full py-2 bg-brand hover:bg-[#2B7A78] text-white font-semibold rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View Full Details</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {onDeleteObject && (
            <button
              onClick={() => {
                if (window.confirm(`Delete ${object.name} (${object.id}) from catalog?`)) {
                  onDeleteObject(object.id);
                  onClose();
                }
              }}
              className="w-full py-1.5 bg-red-950/40 hover:bg-red-900/70 border border-red-500/40 text-red-300 rounded text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Object from Catalog</span>
            </button>
          )}
        </div>

      </aside>
    </>
  );
};
