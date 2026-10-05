import React, { useState, useMemo } from 'react';
import { SpaceObject } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { BarChart3 } from 'lucide-react';

type AltitudeFilterType = 'All' | 'Satellite' | 'Debris';

interface AltitudeDistributionChartProps {
  objects?: SpaceObject[];
}

export const AltitudeDistributionChart: React.FC<AltitudeDistributionChartProps> = ({ objects = [] }) => {
  const [filterType, setFilterType] = useState<AltitudeFilterType>('All');

  const rawData = useMemo(() => {
    const bands = [
      { band: '200-400 km', min: 200, max: 400 },
      { band: '400-600 km', min: 400, max: 600 },
      { band: '600-800 km', min: 600, max: 800 },
      { band: '800-1000 km', min: 800, max: 1000 },
      { band: '1000+ km', min: 1000, max: 100000 },
    ];

    return bands.map((b) => {
      const sats = objects.filter((o) => o.type === 'Satellite' && o.altitude >= b.min && o.altitude < b.max).length;
      const debs = objects.filter((o) => (o.type === 'Debris' || o.type === 'Rocket Body') && o.altitude >= b.min && o.altitude < b.max).length;
      return {
        band: b.band,
        satellites: sats,
        debris: debs,
        total: sats + debs
      };
    });
  }, [objects]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2.5 rounded surface-card border border-slate-700 font-mono text-xs shadow-xl">
          <div className="font-semibold text-slate-100 mb-1">Band: {label}</div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2" style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <span className="font-bold">{entry.value.toLocaleString()} objects</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="surface-card p-4 flex flex-col h-full">

      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-700">
        <div>
          <h3 className="font-semibold text-xs tracking-wide text-slate-100 uppercase">
            Orbital Altitude Shell Density
          </h3>
          <p className="text-[10px] text-slate-400">
            LEO object population density categorized by altitude bands
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded border border-slate-700 font-mono text-[10px]">
          {(['All', 'Satellite', 'Debris'] as AltitudeFilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${filterType === type
                  ? 'bg-slate-700 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              {type === 'All' ? 'ALL OBJECTS' : type === 'Satellite' ? 'SATELLITES' : 'DEBRIS'}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-48 w-full flex-1 pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rawData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#233941" />
            <XAxis
              dataKey="band"
              stroke="#8EBDBA"
              tick={{ fontSize: 9.5, fontFamily: '"Roboto", sans-serif' }}
            />
            <YAxis
              stroke="#8EBDBA"
              tick={{ fontSize: 10, fontFamily: '"Roboto", sans-serif' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: '"Roboto", sans-serif', paddingTop: '6px' }}
            />

            {(filterType === 'All' || filterType === 'Satellite') && (
              <Bar
                dataKey="satellites"
                name="Satellites"
                fill="#38BDF8"
                radius={[3, 3, 0, 0]}
              />
            )}

            {(filterType === 'All' || filterType === 'Debris') && (
              <Bar
                dataKey="debris"
                name="Space Debris"
                fill="#F59E0B"
                radius={[3, 3, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
