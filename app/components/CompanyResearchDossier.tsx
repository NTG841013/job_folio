import React from 'react';
import { 
  CheckCircle2, 
  Lightbulb, 
  Target, 
  Users, 
  Cpu, 
  HelpCircle, 
  Rocket, 
  Link as LinkIcon 
} from 'lucide-react';

interface Dossier {
  companyOverview: string;
  techStack: string[];
  culture: string[];
  whyThisRole: string;
  yourEdge: string[];
  gapsToAddress: string[];
  smartQuestions: string[];
  interviewPrep: string[];
  sources: string[];
}

export default function CompanyResearchDossier({ dossier }: { dossier: Dossier }) {
  if (!dossier) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview Section */}
      <section className="bg-accent-muted border border-accent-light/30 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Target className="w-4 h-4 text-accent" />
          Company Overview
        </h3>
        <p className="text-sm text-text-slate leading-relaxed">
          {dossier.companyOverview}
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tech Stack */}
        <section className="bg-accent-muted border border-accent-light/30 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5" />
            Tech Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {dossier.techStack?.map((tech, i) => (
              <span key={i} className="px-2 py-1 bg-surface-tertiary text-text-secondary rounded text-[11px] font-medium border border-border">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Culture */}
        <section className="bg-accent-muted border border-accent-light/30 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            Culture & Values
          </h3>
          <ul className="space-y-2">
            {dossier.culture?.map((item, i) => (
              <li key={i} className="text-sm text-text-slate flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-accent shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Why This Role */}
      <section className="bg-accent-muted border border-accent-light/30 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-accent flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Strategic Context: Why This Role?
        </h3>
        <p className="text-sm text-text-slate leading-relaxed">
          {dossier.whyThisRole}
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Edge */}
        <section className="bg-accent-muted border border-accent-light/30 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-success flex items-center gap-2">
            <Rocket className="w-4 h-4" />
            Your Edge
          </h3>
          <ul className="space-y-2">
            {dossier.yourEdge?.map((item, i) => (
              <li key={i} className="text-sm text-text-slate flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 w-4 h-4 text-success shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Gaps to Address */}
        <section className="bg-accent-muted border border-accent-light/30 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Target className="w-4 h-4 text-text-muted" />
            How to Frame Gaps
          </h3>
          <ul className="space-y-2">
            {dossier.gapsToAddress?.map((item, i) => (
              <li key={i} className="text-sm text-text-slate flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-text-muted shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Smart Questions */}
        <section className="bg-accent-muted border border-accent-light/30 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-info" />
            Smart Questions to Ask
          </h3>
          <ul className="space-y-2">
            {dossier.smartQuestions?.map((item, i) => (
              <li key={i} className="text-sm text-text-slate italic flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-info shrink-0" />
                "{item}"
              </li>
            ))}
          </ul>
        </section>

        {/* Interview Prep */}
        <section className="bg-accent-muted border border-accent-light/30 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <FileTextIcon className="w-4 h-4 text-text-muted" />
            Interview Prep
          </h3>
          <ul className="space-y-2">
            {dossier.interviewPrep?.map((item, i) => (
              <li key={i} className="text-sm text-text-slate flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-border-dark shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Sources */}
      {dossier.sources && dossier.sources.length > 0 && (
        <section className="pt-6 border-t border-border-light">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <LinkIcon className="w-3 h-3" />
            Research Sources
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {dossier.sources.map((source, i) => (
              <a 
                key={i} 
                href={source} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[10px] text-accent hover:underline truncate max-w-[200px]"
              >
                {new URL(source).hostname}{new URL(source).pathname !== '/' ? new URL(source).pathname : ''}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Minimal FileText icon because lucide-react version might be old
function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
