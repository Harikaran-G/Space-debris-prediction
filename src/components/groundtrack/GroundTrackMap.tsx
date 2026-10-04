import React, { useState, useMemo } from 'react';
import { SpaceObject } from '../../types';
import { MapPin, Clock, Satellite, Globe, X } from 'lucide-react';

interface GroundTrackMapProps {
  objects: SpaceObject[];
  selectedObject: SpaceObject | null;
  onSelectObject: (obj: SpaceObject) => void;
  onClose?: () => void;
}

export const GroundTrackMap: React.FC<GroundTrackMapProps> = ({
  objects,
  selectedObject,
  onSelectObject,
  onClose,
}) => {
  const [timeOffsetHours, setTimeOffsetHours] = useState<number>(0);
  const currentObject = selectedObject || objects[0];

  // Calculate sinusoidal sub-satellite ground track coordinates on a 2D Mercator canvas
  const groundTrackPoints = useMemo(() => {
    if (!currentObject) return [];
    const points: { lat: number; lon: number; x: number; y: number }[] = [];
    const inc = currentObject.inclination;
    const periodHours = (currentObject.period || 95) / 60;
    const earthRotationRate = 360 / 24; // 15 deg / hr

    // Calculate path for 2 full orbital revolutions
    for (let t = -periodHours; t <= periodHours * 2; t += 0.05) {
      // Latitude oscillates with orbital inclination
      const lat = Math.sin(((t + timeOffsetHours) / periodHours) * 2 * Math.PI) * inc;
      // Longitude drifts eastwards with orbital motion and westwards with Earth rotation
      const lonRaw = (currentObject.longitude + ((t + timeOffsetHours) / periodHours) * 360 - (t + timeOffsetHours) * earthRotationRate) % 360;
      const lon = lonRaw > 180 ? lonRaw - 360 : lonRaw < -180 ? lonRaw + 360 : lonRaw;

      // Map to percentage coordinates (0-100%)
      const x = ((lon + 180) / 360) * 100;
      const y = ((90 - lat) / 180) * 100;

      points.push({ lat, lon, x, y });
    }
    return points;
  }, [currentObject, timeOffsetHours]);

  // Current sub-satellite point position at given timeOffsetHours
  const currentPoint = groundTrackPoints[Math.floor(groundTrackPoints.length / 3)] || { x: 50, y: 50, lat: 0, lon: 0 };

  return (
    <div className="surface-card p-4 space-y-3 font-mono text-xs border border-slate-700">

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-slate-800 border border-slate-700 text-brand">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wide text-slate-100">
              2D Mercator Ground Track & Sub-Satellite Nadir Point
            </h3>
            <p className="text-[10px] text-slate-400">
              Orbital projection over Earth ground coordinates
            </p>
          </div>
        </div>

        {/* Spacecraft Select & Close */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Tracking:</span>
          <select
            value={currentObject?.id}
            onChange={(e) => {
              const found = objects.find((o) => o.id === e.target.value);
              if (found) onSelectObject(found);
            }}
            className="bg-slate-800 border border-slate-700 text-brand font-medium rounded px-2.5 py-1 text-xs focus:outline-none focus:border-brand"
          >
            {objects.map((o) => (
              <option key={`gt-${o.id}`} value={o.id} className="bg-slate-900 text-slate-200">
                {o.name} ({o.id})
              </option>
            ))}
          </select>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title="Close Ground Track Map"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2D World Map Container */}
      <div className="relative w-full h-80 bg-slate-900 rounded overflow-hidden border border-slate-700/80 shadow-inner">

        {/* Stylized Mercator World Map Vector Background */}
        <div className="absolute inset-0 opacity-40">
          <svg className="w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="250" x2="1000" y2="250" stroke="#4E4E50" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
            <line x1="500" y1="0" x2="500" y2="500" stroke="#4E4E50" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />

            {/* Equator & Tropic lines */}
            <line x1="0" y1="185" x2="1000" y2="185" stroke="#34343D" strokeWidth="0.5" strokeDasharray="2 4" />
            <line x1="0" y1="315" x2="1000" y2="315" stroke="#34343D" strokeWidth="0.5" strokeDasharray="2 4" />

            {/* Continents outlines (IN PIECES: #232328 fill with #4E4E50 / #6F2232 stroke) */}
            <path d="M150,100 Q220,90 280,140 Q250,220 180,240 Q130,160 150,100 Z" fill="#232328" stroke="#4E4E50" strokeWidth="1.2" />
            <path d="M220,260 Q300,270 290,380 Q250,450 210,360 Z" fill="#232328" stroke="#4E4E50" strokeWidth="1.2" />
            <path d="M480,90 Q580,80 570,160 Q490,160 480,90 Z" fill="#232328" stroke="#4E4E50" strokeWidth="1.2" />
            <path d="M480,180 Q590,180 580,320 Q500,340 470,240 Z" fill="#232328" stroke="#4E4E50" strokeWidth="1.2" />
            <path d="M600,100 Q880,90 850,220 Q700,240 600,160 Z" fill="#232328" stroke="#4E4E50" strokeWidth="1.2" />
            <path d="M750,300 Q880,290 860,390 Q760,400 750,300 Z" fill="#232328" stroke="#4E4E50" strokeWidth="1.2" />
          </svg>
        </div>

        {/* Orbit Ground Track Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {groundTrackPoints.map((pt, i) => {
            if (i === 0) return null;
            const prev = groundTrackPoints[i - 1];
            // Skip wrap-around discontinuities
            if (Math.abs(pt.x - prev.x) > 50) return null;
            return (
              <line
                key={`gt-line-${i}`}
                x1={prev.x}
                y1={prev.y}
                x2={pt.x}
                y2={pt.y}
                stroke="#C3073F"
                strokeWidth="1.5"
                strokeOpacity={0.9}
                strokeDasharray={i % 2 === 0 ? "2 1" : undefined}
              />
            );
          })}
        </svg>

        {/* Current Spacecraft Position Marker */}
        {currentObject && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10"
            style={{ left: `${currentPoint.x}%`, top: `${currentPoint.y}%` }}
          >
            <div className="relative group">
              <div className="w-5 h-5 rounded-full bg-brand/25 border border-brand flex items-center justify-center text-brand">
                <Satellite className="w-3 h-3" />
              </div>
              <div className="absolute left-6 top-0 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-[10px] text-slate-100 whitespace-nowrap shadow-lg">
                <div className="font-bold text-brand">{currentObject.name}</div>
                <div className="text-slate-400">Lat: {currentPoint.lat.toFixed(1)}° | Lon: {currentPoint.lon.toFixed(1)}°</div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Time Progression Slider: 0h, +2h, +4h, +6h, +12h, +24h */}
      <div className="p-3 bg-slate-800 rounded border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Clock className="w-4 h-4 text-brand" />
          <span className="text-slate-300 font-medium">Orbital Timeline Progression:</span>
          <span className="text-amber-400 font-bold">{timeOffsetHours === 0 ? 'CURRENT TIME (T+0)' : `T+${timeOffsetHours} HOURS`}</span>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {[0, 2, 4, 6, 12, 24].map((hours) => (
            <button
              key={`hour-${hours}`}
              onClick={() => setTimeOffsetHours(hours)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${timeOffsetHours === hours
                  ? 'bg-slate-700 text-brand font-semibold border border-brand/50'
                  : 'bg-slate-850 text-slate-400 border border-slate-700 hover:text-slate-200'
                }`}
            >
              {hours === 0 ? 'NOW' : `+${hours}h`}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
