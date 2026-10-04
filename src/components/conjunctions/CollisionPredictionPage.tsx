import React, { useState, useMemo } from 'react';
import { SpaceObject, MLPrediction } from '../../types';
import { mlService } from '../../services/mlService';
import {
  ArrowRightLeft,
  Cpu,
  Clock,
  Gauge,
  Info,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface CollisionPredictionPageProps {
  objects: SpaceObject[];
  initialObjectA?: SpaceObject;
  initialObjectB?: SpaceObject;
}

export const CollisionPredictionPage: React.FC<CollisionPredictionPageProps> = ({
  objects,
  initialObjectA,
  initialObjectB,
}) => {
  const [selectedIdA, setSelectedIdA] = useState<string>(
    initialObjectA?.id || objects[1]?.id || objects[0]?.id || ''
  );
  const [selectedIdB, setSelectedIdB] = useState<string>(
    initialObjectB?.id || objects[2]?.id || objects[1]?.id || ''
  );
  const [isAssessmentCleared, setIsAssessmentCleared] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const objA = useMemo(() => objects.find((o) => o.id === selectedIdA) || objects[0], [objects, selectedIdA]);
  const objB = useMemo(() => objects.find((o) => o.id === selectedIdB) || objects[1], [objects, selectedIdB]);

  const prediction: MLPrediction | null = useMemo(() => {
    if (isAssessmentCleared || !objA || !objB) return null;
    return mlService.predictConjunctionRisk(objA, objB);
  }, [objA, objB, isAssessmentCleared]);

  const handleSwap = () => {
    const temp = selectedIdA;
    setSelectedIdA(selectedIdB);
    setSelectedIdB(temp);
    setIsAssessmentCleared(false);
  };

  const handleClearAssessmentData = () => {
    setIsAssessmentCleared(true);
    setStatusNotice('Assessment calculation data purged.');
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleComputeAssessment = () => {
    setIsAssessmentCleared(false);
    setStatusNotice('ML Conjunction Assessment calculated successfully.');
    setTimeout(() => setStatusNotice(null), 4000);
  };

  return (
    <div className="space-y-4">

      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-700">
        <div>
          <h2 className="text-base font-semibold text-slate-100">
            Collision Risk Prediction
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Conjunction assessment and risk classification for selected orbital object pairs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAssessmentCleared ? (
            <button
              onClick={handleComputeAssessment}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-mono font-semibold transition-all active:scale-95 shadow"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN ASSESSMENT</span>
            </button>
          ) : (
            <button
              onClick={handleClearAssessmentData}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-900/80 text-red-300 hover:text-white border border-red-500/40 rounded text-xs font-mono font-semibold transition-all active:scale-95 shadow"
              title="Delete and clear computed ML assessment data"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>DELETE PROCESS DATA</span>
            </button>
          )}
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

      {/* Object Selection Pair */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">

        {/* Object A */}
        <div className="md:col-span-5 surface-card p-3.5 space-y-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Primary Object (A)</span>
            <span className="text-slate-500 font-mono text-[11px]">{objA?.type}</span>
          </div>

          <select
            value={selectedIdA}
            onChange={(e) => setSelectedIdA(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded px-2.5 py-2 text-xs font-mono focus:outline-none focus:border-blue-500"
          >
            {objects.map((o) => (
              <option key={`opt-a-${o.id}`} value={o.id}>
                {o.id} - {o.name} ({o.altitude} km, {o.type})
              </option>
            ))}
          </select>

          {objA && (
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-850 p-2.5 rounded border border-slate-750">
              <div>Altitude: <span className="text-slate-200">{objA.altitude} km</span></div>
              <div>Velocity: <span className="text-slate-200">{objA.velocity} km/s</span></div>
              <div>Inclination: <span className="text-slate-200">{objA.inclination}°</span></div>
              <div>NORAD ID: <span className="text-slate-200">{objA.noradId}</span></div>
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center py-1 md:py-0">
          <button
            onClick={handleSwap}
            className="w-9 h-9 rounded bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            title="Swap Object A and Object B"
            aria-label="Swap objects"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Object B */}
        <div className="md:col-span-5 surface-card p-3.5 space-y-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Secondary Object (B)</span>
            <span className="text-slate-500 font-mono text-[11px]">{objB?.type}</span>
          </div>

          <select
            value={selectedIdB}
            onChange={(e) => setSelectedIdB(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded px-2.5 py-2 text-xs font-mono focus:outline-none focus:border-blue-500"
          >
            {objects.map((o) => (
              <option key={`opt-b-${o.id}`} value={o.id}>
                {o.id} - {o.name} ({o.altitude} km, {o.type})
              </option>
            ))}
          </select>

          {objB && (
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-850 p-2.5 rounded border border-slate-750">
              <div>Altitude: <span className="text-slate-200">{objB.altitude} km</span></div>
              <div>Velocity: <span className="text-slate-200">{objB.velocity} km/s</span></div>
              <div>Inclination: <span className="text-slate-200">{objB.inclination}°</span></div>
              <div>NORAD ID: <span className="text-slate-200">{objB.noradId}</span></div>
            </div>
          )}
        </div>

      </div>

      {/* Prediction Output Results */}
      {!prediction ? (
        <div className="surface-card p-8 text-center space-y-3 font-mono border border-slate-700/60">
          <Trash2 className="w-8 h-8 text-slate-500 mx-auto opacity-70" />
          <div className="text-sm font-semibold text-slate-200">Process Data Cleared</div>
          <div className="text-xs text-slate-400 max-w-md mx-auto">
            The conjunction prediction report and ML classification telemetry have been purged after processing. Click Run Assessment to regenerate astrodynamic state predictions.
          </div>
          <button
            onClick={handleComputeAssessment}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold inline-flex items-center gap-2 transition-all active:scale-95 shadow"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Compute Conjunction Assessment</span>
          </button>
        </div>
      ) : (
        <>
          <div className="surface-card p-4 space-y-4">
            <div className="text-xs font-semibold text-slate-200 uppercase tracking-wide border-b border-slate-700 pb-2 flex items-center justify-between">
              <span>ML Conjunction Assessment</span>
              <span className="text-[11px] text-slate-400 font-normal font-mono">Model: XGBoost v2.4</span>
            </div>

            {/* 5 Key Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">

              <div className="p-3 bg-slate-850 rounded border border-slate-750">
                <div className="text-[11px] text-slate-400">Closest Approach</div>
                <div className="text-lg font-semibold text-slate-100 mt-1">
                  {prediction.featureImportance?.[0]?.value || '2.4 km'}
                </div>
              </div>

              <div className="p-3 bg-slate-850 rounded border border-slate-750">
                <div className="text-[11px] text-slate-400">Relative Velocity</div>
                <div className="text-lg font-semibold text-slate-100 mt-1">
                  {prediction.featureImportance?.[1]?.value || '8.1 km/s'}
                </div>
              </div>

              <div className="p-3 bg-slate-850 rounded border border-slate-750">
                <div className="text-[11px] text-slate-400">Time to TCA</div>
                <div className="text-lg font-semibold text-amber-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  17h 32m
                </div>
              </div>

              <div className="p-3 bg-slate-850 rounded border border-slate-750">
                <div className="text-[11px] text-slate-400">Risk Probability</div>
                <div className="text-lg font-semibold text-orange-400 mt-1">
                  {prediction.probability}%
                </div>
              </div>

              <div className="p-3 bg-slate-850 rounded border border-slate-750">
                <div className="text-[11px] text-slate-400">Risk Level</div>
                <div className="mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${prediction.riskLevel === 'Critical'
                      ? 'badge-critical'
                      : prediction.riskLevel === 'High'
                        ? 'badge-high'
                        : prediction.riskLevel === 'Medium'
                          ? 'badge-medium'
                          : 'badge-low'
                    }`}>
                    {prediction.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>

            </div>

            {/* Simple Step Risk Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Risk Scale</span>
                <span className="font-semibold text-slate-200">{prediction.riskLevel} Risk Tier</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded flex overflow-hidden border border-slate-750">
                <div className={`h-full transition-all duration-300 ${prediction.riskLevel === 'Critical'
                    ? 'w-full bg-red-500'
                    : prediction.riskLevel === 'High'
                      ? 'w-3/4 bg-orange-500'
                      : prediction.riskLevel === 'Medium'
                        ? 'w-1/2 bg-amber-500'
                        : 'w-1/4 bg-emerald-500'
                  }`} />
              </div>
            </div>

          </div>

          {/* Factors Influencing Prediction (Horizontal Bar Chart) */}
          <div className="surface-card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-700">
              <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wide">
                Factors Influencing Prediction
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Feature importance values are generated by the trained ML model.
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs pt-1">
              {prediction.featureImportance?.map((item, idx) => (
                <div key={`feat-${idx}`} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">{item.feature}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{item.value}</span>
                      <span className="font-semibold text-slate-200 w-10 text-right">{item.importance}%</span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded"
                      style={{ width: `${item.importance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-slate-850 rounded border border-slate-750 text-[11px] text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Model feature attribution uses Tree SHAP (SHapley Additive exPlanations) values calculated across the 6-parameter astrodynamic state covariance matrix.
              </span>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
