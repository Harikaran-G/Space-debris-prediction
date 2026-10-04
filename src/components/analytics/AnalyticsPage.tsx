import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  BarChart3,
  Calendar,
  Layers,
  Orbit,
  Activity,
  Gauge
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'ytd'>('30d');

  // 1. Population by Altitude Bands
  const altitudeData = [
    { band: '200-400 km', satellites: 135, debris: 1200 },
    { band: '400-600 km', satellites: 490, debris: 5340 },
    { band: '600-800 km', satellites: 205, debris: 4430 },
    { band: '800-1000 km', satellites: 75, debris: 1850 },
    { band: '1000+ km', satellites: 45, debris: 820 },
  ];

  // 2. Risk Distribution Donut Data
  const riskDonutData = [
    { name: 'Low Risk (<30%)', value: 72, count: 8964, color: '#10B981' },
    { name: 'Medium Risk (30-60%)', value: 21, count: 2614, color: '#F59E0B' },
    { name: 'High Risk (60-85%)', value: 6, count: 747, color: '#F97316' },
    { name: 'Critical Risk (>85%)', value: 1, count: 125, color: '#EF4444' },
  ];

  // 3. Close Approaches Over Time
  const closeApproachesOverTime = [
    { day: 'Sep 05', encounters: 28, critical: 1 },
    { day: 'Sep 10', encounters: 35, critical: 3 },
    { day: 'Sep 15', encounters: 42, critical: 2 },
    { day: 'Sep 20', encounters: 39, critical: 4 },
    { day: 'Sep 25', encounters: 31, critical: 1 },
    { day: 'Sep 30', encounters: 46, critical: 5 },
    { day: 'Oct 04', encounters: 37, critical: 3 },
  ];

  // 4. Relative Velocity by Inclination Delta
  const velocityByIncData = [
    { incDiff: '0°-10° (Coplanar)', avgVel: 1.8 },
    { incDiff: '10°-30°', avgVel: 4.5 },
    { incDiff: '30°-60°', avgVel: 7.8 },
    { incDiff: '60°-90° (Crossing)', avgVel: 10.9 },
    { incDiff: '90°-180° (Retrograde)', avgVel: 14.6 },
  ];

  // 5. Orbital Inclination Histogram
  const inclinationHistogram = [
    { band: '0°-30° (Equatorial)', count: 420 },
    { band: '30°-60° (Mid-inclination / ISS)', count: 4250 },
    { band: '60°-80° (Cosmos / Russian)', count: 3820 },
    { band: '80°-100° (Polar / Sun-Sync)', count: 3540 },
    { band: '100°+ (Retrograde)', count: 420 },
  ];

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Title & Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-700">
        <div>
          <h2 className="text-base font-semibold text-slate-100 font-sans">
            Orbital Environment Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Aggregated population distributions, encounter trends, and velocity kinematics.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1 bg-slate-850 p-1 rounded border border-slate-750 self-start sm:self-auto font-sans">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1" />
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: 'ytd', label: 'YTD' },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => setDateRange(d.id as any)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                dateRange === d.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Altitude Population & Risk Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Chart 1: Altitude */}
        <div className="surface-card p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-750 pb-2">
            <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wide">
              Object Population by Altitude
            </h3>
            <span className="text-[11px] text-slate-400 font-sans">LEO Shells</span>
          </div>
          <div className="h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={altitudeData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="band" stroke="#6B7280" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#6B7280" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Inter, sans-serif' }} />
                <Bar dataKey="satellites" name="Satellites" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="debris" name="Space Debris" fill="#F59E0B" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Risk Distribution Donut */}
        <div className="surface-card p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-750 pb-2">
            <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wide">
              Risk Distribution
            </h3>
            <span className="text-[11px] text-slate-400 font-sans">12,450 Objects</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3 flex-1">
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {riskDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              {riskDonutData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-1.5 bg-slate-850 rounded border border-slate-750">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 truncate">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-100 shrink-0 ml-1">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Close Approaches Timeline & Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Chart 3: Close Approaches */}
        <div className="surface-card p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-750 pb-2">
            <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wide">
              Close Approaches Over Time
            </h3>
            <span className="text-[11px] text-slate-400 font-sans">&lt; 5.0 km Filter</span>
          </div>
          <div className="h-52 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={closeApproachesOverTime} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="day" stroke="#6B7280" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#6B7280" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Inter, sans-serif' }} />
                <Line type="monotone" dataKey="encounters" name="Total Approaches" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="critical" name="High Risk (<1km)" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Relative Velocity vs Crossing Angle */}
        <div className="surface-card p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-750 pb-2">
            <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wide">
              Relative Velocity
            </h3>
            <span className="text-[11px] text-slate-400 font-sans">Crossing Angle Impact</span>
          </div>
          <div className="h-52 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityByIncData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="incDiff" stroke="#6B7280" tick={{ fontSize: 9.5, fontFamily: 'monospace' }} />
                <YAxis stroke="#6B7280" unit=" km/s" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip />
                <Bar dataKey="avgVel" name="Avg Velocity (km/s)" fill="#F97316" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Orbital Inclination Histogram */}
      <div className="surface-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-750 pb-2">
          <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wide">
            Orbital Inclination Distribution
          </h3>
          <span className="text-[11px] text-slate-400 font-sans">Object Density by Inclination</span>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inclinationHistogram} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="band" stroke="#6B7280" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis stroke="#6B7280" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip />
              <Bar dataKey="count" name="Objects Count" fill="#3B82F6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
