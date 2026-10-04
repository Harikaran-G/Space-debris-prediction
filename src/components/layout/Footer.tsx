import React from 'react';
import { AlertTriangle, Satellite, Cpu, Radio } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-space-950/95 border-t border-slate-800/80 px-4 lg:px-8 py-3 mt-auto text-xs text-slate-400 font-mono">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        
        {/* Scientific Disclaimer */}
        <div className="flex items-start gap-2 max-w-3xl">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-slate-400">
            <span className="font-semibold text-slate-300">SCIENTIFIC & OPERATIONAL DISCLAIMER:</span>{' '}
            Prediction results and risk assessments are model-based estimates generated via machine learning heuristics and should not be interpreted as certified operational collision-avoidance guidance. Real conjunction assessment requires validated orbital ephemeris, covariance ellipsoid integration, and direct coordination with official space operations centers (CSpOC, ESA ESOC, JAXA).
          </p>
        </div>

        {/* System telemetry tags */}
        <div className="flex items-center gap-4 text-[10px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            <span>ML ENGINE: XGBOOST v2.4</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Satellite className="w-3.5 h-3.5 text-brand-300" />
            <span>PROPAGATOR: SGP4/SDP4</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-brand-300 animate-pulse" />
            <span className="text-brand-300">EPOCH: 2026.277</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
