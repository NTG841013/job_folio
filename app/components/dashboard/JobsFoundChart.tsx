'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface JobsFoundChartProps {
  data: any[];
}

export default function JobsFoundChart({ data }: JobsFoundChartProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-bold text-text-primary mb-6">Jobs Found Over Time</h3>
      <div className="flex-1 min-h-[250px] w-full relative">
        {data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/50 z-10 rounded-xl">
            <p className="text-sm text-text-muted">No jobs found yet</p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EAF3" />
            <XAxis 
              dataKey="day" 
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
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid #E7EAF3', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#7C5CFC" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCount)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
