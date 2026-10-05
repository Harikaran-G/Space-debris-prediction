import React, { useMemo } from 'react';
import { SpaceObject } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon, ShieldCheck } from 'lucide-react';

interface RiskDistributionChartProps {
  objects?: SpaceObject[];
}

interface RiskItem {
  name: string;
  value: number;
  count: number;
  color: string;
  badgeClass: string;
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ objects = [] }) => {
  const data: RiskItem[] = useMemo(() => {
    const total = objects.length;
    if (total === 0) {
      return [
        { name: 'Low Risk', value: 0, count: 0, color: '#10B981', badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
        { name: 'Medium Risk', value: 0, count: 0, color: '#F59E0B', badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
        { name: 'High Risk', value: 0, count: 0, color: '#950740', badgeClass: 'bg-[#950740]/20 text-[#E6446E] border-[#950740]/40' },
        { name: 'Critical Risk', value: 0, count: 0, color: '#C3073F', badgeClass: 'bg-[#C3073F]/20 text-[#F43F5E] border-[#C3073F]/40' },
      ];
    }

    const lowCount = objects.filter((o) => o.riskLevel === 'Low').length;
    const medCount = objects.filter((o) => o.riskLevel === 'Medium').length;
    const highCount = objects.filter((o) => o.riskLevel === 'High').length;
    const critCount = objects.filter((o) => o.riskLevel === 'Critical').length;

    return [
      { name: 'Low Risk', value: Math.round((lowCount / total) * 100), count: lowCount, color: '#10B981', badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
      { name: 'Medium Risk', value: Math.round((medCount / total) * 100), count: medCount, color: '#F59E0B', badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
      { name: 'High Risk', value: Math.round((highCount / total) * 100), count: highCount, color: '#950740', badgeClass: 'bg-[#950740]/20 text-[#E6446E] border-[#950740]/40' },
      { name: 'Critical Risk', value: Math.round((critCount / total) * 100), count: critCount, color: '#C3073F', badgeClass: 'bg-[#C3073F]/20 text-[#F43F5E] border-[#C3073F]/40' },
    ];
  }, [objects]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: RiskItem = payload[0].payload;
      return (
        <div className="p-2.5 rounded surface-card font-mono text-xs shadow-xl border border-slate-700">
          <div className="font-semibold text-slate-100 flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
            {item.name}
          </div>
          <div className="text-slate-400">Catalogued Objects: <span className="font-semibold text-slate-200">{item.count.toLocaleString()}</span></div>
          <div className="text-slate-400">Share: <span className="font-semibold text-cyan-300">{item.value}%</span></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="surface-card p-4 flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
        <div>
          <h3 className="font-semibold text-xs tracking-wide text-slate-100 uppercase">
            Global Risk Distribution
          </h3>
          <p className="text-[10px] text-slate-400">
            Categorized by collision probability threshold
          </p>
        </div>
      </div>

      {/* Donut Chart and Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3 flex-1 py-1">
        
        {/* Chart */}
        <div className="h-44 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={68}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Donut Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-mono font-bold text-base text-slate-100">{objects.length.toLocaleString()}</span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Catalog</span>
          </div>
        </div>

        {/* Legend stats */}
        <div className="space-y-1.5 font-mono text-xs">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-1.5 rounded bg-slate-800 border border-slate-700/80 text-[11px]"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{item.count.toLocaleString()}</span>
                <span className="font-bold text-slate-100 w-8 text-right">{item.value}%</span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};
