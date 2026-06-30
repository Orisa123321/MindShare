import type { ReactNode } from 'react';

interface StatsOverviewProps {
  stats: { label: string; value: number; icon: ReactNode; color: string }[];
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="card group cursor-default"
          id={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
              style={{ background: `${stat.color}15`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-extrabold" style={{ color: 'var(--text)' }}>
                {stat.value}
              </p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
