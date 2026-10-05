import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { TrendingUp, Clock, Sparkles } from 'lucide-react';

type TimeRange = '6h' | '12h' | '24h' | '7d';

export const RiskTrendChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  // Datasets for different time horizons distinguishing observed vs predicted
  const datasetMap: Record<TimeRange, any[]> = {
    '6h': [
      { time: 'T-3h', observedRisk: 32, predictedRisk: null, isPrediction: false },
      { time: 'T-2h', observedRisk: 41, predictedRisk: null, isPrediction: false },
      { time: 'T-1h', observedRisk: 55, predictedRisk: null, isPrediction: false },
      { time: 'NOW', observedRisk: 78.4, predictedRisk: 78.4, isPrediction: false },
      { time: 'T+1h', observedRisk: null, predictedRisk: 86.2, isPrediction: true },
      { time: 'T+2h', observedRisk: null, predictedRisk: 91.2, isPrediction: true },
      { time: 'T+3h (TCA)', observedRisk: null, predictedRisk: 94.5, isPrediction: true },
    ],
    '12h': [
      { time: 'T-6h', observedRisk: 18, predictedRisk: null, isPrediction: false },
      { time: 'T-4h', observedRisk: 29, predictedRisk: null, isPrediction: false },
      { time: 'T-2h', observedRisk: 48, predictedRisk: null, isPrediction: false },
      { time: 'NOW', observedRisk: 78.4, predictedRisk: 78.4, isPrediction: false },
      { time: 'T+2h', observedRisk: null, predictedRisk: 89.0, isPrediction: true },
      { time: 'T+4h (TCA)', observedRisk: null, predictedRisk: 94.5, isPrediction: true },
      { time: 'T+6h', observedRisk: null, predictedRisk: 42.1, isPrediction: true },
    ],
    '24h': [
      { time: 'T-12h', observedRisk: 12, predictedRisk: null, isPrediction: false },
      { time: 'T-6h', observedRisk: 28, predictedRisk: null, isPrediction: false },
      { time: 'NOW', observedRisk: 78.4, predictedRisk: 78.4, isPrediction: false },
      { time: 'T+4h (TCA)', observedRisk: null, predictedRisk: 91.2, isPrediction: true },
      { time: 'T+8h', observedRisk: null, predictedRisk: 34.0, isPrediction: true },
      { time: 'T+12h', observedRisk: null, predictedRisk: 14.5, isPrediction: true },
      { time: 'T+24h', observedRisk: null, predictedRisk: 6.2, isPrediction: true },
    ],
    '7d': [
      { time: 'Day -3', observedRisk: 8, predictedRisk: null, isPrediction: false },
      { time: 'Day -1', observedRisk: 22, predictedRisk: null, isPrediction: false },
      { time: 'Today', observedRisk: 78.4, predictedRisk: 78.4, isPrediction: false },
      { time: 'Day +1', observedRisk: null, predictedRisk: 65.0, isPrediction: true },
      { time: 'Day +3', observedRisk: null, predictedRisk: 24.0, isPrediction: true },
      { time: 'Day +5', observedRisk: null, predictedRisk: 12.0, isPrediction: true },
      { time: 'Day +7', observedRisk: null, predictedRisk: 8.5, isPrediction: true },
    ],
  };

  const chartData = datasetMap[timeRange];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2.5 rounded surface-card border border-slate-700 font-mono text-xs shadow-xl">
          <div className="text-slate-300 font-semibold mb-1">Time Horizon: {label}</div>
          {payload.map((entry: any, index: number) => {
            if (entry.value === null || entry.value === undefined) return null;
            return (
              <div key={`item-${index}`} className="flex items-center gap-2" style={{ color: entry.color }}>
                <span>{entry.name}:</span>
                <span className="font-bold">{entry.value}%</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="surface-card p-4 flex flex-col h-full">

      {/* Header and Filter Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-700">
        <div>
          <h3 className="font-semibold text-xs tracking-wide text-slate-100 uppercase">
            Conjunction Risk Probability Evolution
          </h3>
          <p className="text-[10px] text-slate-400">
            Observed telemetry trajectory vs. ML propagated probability
          </p>
        </div>

        {/* Time horizon pill selector */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded border border-slate-700 self-end sm:self-auto font-mono text-[10px]">
          {(['6h', '12h', '24h', '7d'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2 py-0.5 rounded font-medium transition-colors ${timeRange === range
                  ? 'bg-slate-700 text-brand font-semibold border border-brand/40'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 w-full flex-1 pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#233941" />
            <XAxis
              dataKey="time"
              stroke="#8EBDBA"
              tick={{ fontSize: 10, fontFamily: '"Roboto", sans-serif' }}
            />
            <YAxis
              stroke="#8EBDBA"
              domain={[0, 100]}
              tick={{ fontSize: 10, fontFamily: '"Roboto", sans-serif' }}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: '"Roboto", sans-serif', paddingTop: '6px' }}
            />

            {/* Critical Threshold Line */}
            <ReferenceLine y={85} stroke="#C3073F" strokeDasharray="4 4" label={{ value: 'Critical (85%)', fill: '#C3073F', fontSize: 9, position: 'insideTopRight' }} />
            <ReferenceLine y={60} stroke="#950740" strokeDasharray="4 4" label={{ value: 'High (60%)', fill: '#950740', fontSize: 9, position: 'insideTopRight' }} />

            <Line
              type="monotone"
              dataKey="observedRisk"
              name="Observed Telemetry"
              stroke="#C3073F"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#C3073F' }}
              activeDot={{ r: 6, fill: '#FEFFFF' }}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="predictedRisk"
              name="ML Predicted Risk"
              stroke="#950740"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#950740' }}
              activeDot={{ r: 6, fill: '#FEFFFF' }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
