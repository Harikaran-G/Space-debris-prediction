import React from 'react';
import { SpaceObject, Conjunction, AlertItem } from '../../types';
import {
  Orbit,
  Satellite,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface KpiCardsProps {
  objects?: SpaceObject[];
  conjunctions?: Conjunction[];
  alerts?: AlertItem[];
}

interface KpiCardData {
  id: string;
  title: string;
  value: string;
  subtext: string;
  trend: string;
  trendDirection: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  objects = [],
  conjunctions = [],
  alerts = []
}) => {
  const totalCount = objects.length;
  const satelliteCount = objects.filter((o) => o.type === 'Satellite').length;
  const debrisCount = objects.filter((o) => o.type === 'Debris' || o.type === 'Rocket Body').length;
  const approachCount = conjunctions.length;
  const criticalCount = objects.filter((o) => o.riskLevel === 'Critical' || o.riskLevel === 'High').length;

  const kpis: KpiCardData[] = [
    {
      id: 'total',
      title: 'Total Objects',
      value: totalCount.toLocaleString(),
      subtext: totalCount === 0 ? 'Awaiting ingestion' : 'Catalogued objects',
      trend: totalCount > 0 ? `+${totalCount} active` : '0 active',
      trendDirection: 'up',
      icon: Orbit,
      iconColor: 'text-cyan-400',
    },
    {
      id: 'satellites',
      title: 'Satellites',
      value: satelliteCount.toLocaleString(),
      subtext: 'Active payloads',
      trend: `${satelliteCount} operational`,
      trendDirection: 'up',
      icon: Satellite,
      iconColor: 'text-blue-400',
    },
    {
      id: 'debris',
      title: 'Debris',
      value: debrisCount.toLocaleString(),
      subtext: 'Fragments & rocket bodies',
      trend: `${debrisCount} tracked`,
      trendDirection: 'up',
      icon: Trash2,
      iconColor: 'text-amber-500',
    },
    {
      id: 'approaches',
      title: 'Close Approaches',
      value: approachCount.toString(),
      subtext: 'Within 50.0 km',
      trend: `${approachCount} screening events`,
      trendDirection: approachCount > 0 ? 'up' : 'down',
      icon: AlertTriangle,
      iconColor: 'text-orange-400',
    },
    {
      id: 'critical',
      title: 'High / Critical Risk',
      value: criticalCount.toString(),
      subtext: 'Action threshold (>60%)',
      trend: criticalCount > 0 ? `${criticalCount} alert tier` : '0 critical',
      trendDirection: criticalCount > 0 ? 'up' : 'down',
      icon: ShieldAlert,
      iconColor: 'text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.id}
            className="surface-card p-3.5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs text-slate-400 font-medium truncate">
                  {kpi.title}
                </span>
                <Icon className={`w-4 h-4 ${kpi.iconColor} shrink-0`} />
              </div>

              <div className="text-xl sm:text-2xl font-semibold text-slate-100 font-mono tracking-tight">
                {kpi.value}
              </div>
            </div>

            <div className="mt-2 pt-1.5 border-t border-slate-750 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 truncate">{kpi.subtext}</span>
              <span
                className={`flex items-center gap-0.5 font-medium shrink-0 ${
                  kpi.id === 'critical' && criticalCount > 0
                    ? 'text-red-400 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {kpi.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
