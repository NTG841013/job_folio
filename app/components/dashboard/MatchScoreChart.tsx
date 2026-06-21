'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface MatchScoreChartProps {
  data: any[];
}

export default function MatchScoreChart({ data }: MatchScoreChartProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-bold text-text-primary mb-6">Match Score Distribution</h3>
      <div className="flex-1 min-h-[250px] w-full relative">
        {data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/50 z-10 rounded-xl">
            <p className="text-sm text-text-muted">No match data available</p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EAF3" />
            <XAxis 
              dataKey="range" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <Tooltip 
              cursor={{ fill: '#F9FAF7' }}
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #E7EAF3', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
            />
            <Bar 
              dataKey="count" 
              fill="#10B981" 
              radius={[4, 4, 0, 0]} 
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
