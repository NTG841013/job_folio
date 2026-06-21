'use client';

import React from 'react';

interface CompletionIndicatorProps {
  percentage: number;
  missingFields: string[];
}

export default function CompletionIndicator({ percentage, missingFields }: CompletionIndicatorProps) {
  // Calculate stroke-dasharray for the circle
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="card-premium mb-6 flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
        <svg className="w-full h-full -rotate-90">
          {/* Background Track */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-border-light"
          />
          {/* Progress Bar */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-accent transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xl font-bold text-text-darkest">{percentage}%</span>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-base font-bold text-text-darkest mb-1">
          {percentage === 100 ? 'Profile complete' : 'Profile needs attention'}
        </h3>
        <p className="text-xs text-text-secondary mb-3">
          {percentage === 100 
            ? 'Your profile is ready. The AI agent can now find the best matches for you.'
            : 'Completing your profile helps the agent find better job matches.'}
        </p>
        {missingFields.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {missingFields.map((field) => (
              <span
                key={field}
                className="px-2 py-0.5 bg-accent-muted text-accent text-xs font-medium rounded-full uppercase tracking-wider"
              >
                {field}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
