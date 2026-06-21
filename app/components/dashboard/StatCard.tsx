import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  sublabelText: string;
}

export default function StatCard({ label, value, trend, sublabelText }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-medium text-text-secondary">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[30px] font-bold text-text-primary leading-none">{value}</span>
        {trend && (
          <span className="px-2 py-0.5 bg-success-lightest text-success-darker text-[12px] font-medium rounded-sm flex items-center gap-0.5">
            {trend}
          </span>
        )}
      </div>
      <p className="text-[12px] text-text-muted mt-2">{sublabelText}</p>
    </div>
  );
}
