import React from 'react';

type ActivityType = 'job_found' | 'company_researched' | 'resume_tailored';

interface ActivityItemProps {
  type: ActivityType;
  title: string;
  time: string;
}

export default function ActivityItem({ type, title, time }: ActivityItemProps) {
  const getColors = () => {
    switch (type) {
      case 'resume_tailored':
        return { dot: 'bg-accent', ring: 'bg-accent-light' };
      case 'company_researched':
        return { dot: 'bg-info', ring: 'bg-info-light' };
      case 'job_found':
        return { dot: 'bg-success-alt', ring: 'bg-success-light' };
      default:
        return { dot: 'bg-text-muted', ring: 'bg-surface-secondary' };
    }
  };

  const { dot, ring } = getColors();

  return (
    <div className="flex items-center gap-4 group">
      <div className="relative flex items-center justify-center">
        <div className={`w-2.5 h-2.5 rounded-full border-2 border-surface shadow-xs z-10 ${dot}`} />
        <div className={`absolute w-4 h-4 rounded-full border border-white/50 ${ring}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
          {title}
        </p>
        <p className="text-[12px] text-text-muted">{time}</p>
      </div>
    </div>
  );
}
