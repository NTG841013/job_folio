import React, { useState, useEffect, useRef } from 'react';
import { insforge } from '@/lib/insforge-client';
import { 
  FileText, 
  Loader2, 
  Copy, 
  Check, 
  Download, 
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CoverLetterPDF } from './CoverLetterPDF';

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  company: string;
  existingContent?: string;
  userProfile: {
    full_name: string;
    email: string;
    phone?: string;
    location?: string;
    cover_letter_tone?: string;
  };
}

export const CoverLetterModal = ({ 
  isOpen, 
  onClose, 
  jobId, 
  jobTitle, 
  company, 
  existingContent,
  userProfile 
}: CoverLetterModalProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState(() => {
    if (!existingContent) return '';
    const currentDateStr = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return existingContent
      .replace(/\[Date\]/gi, currentDateStr)
      .replace(/\[Candidate Name\]/gi, userProfile.full_name)
      .replace(/\[Company Name\]/gi, company);
  });
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ message: string; level: string; created_at: string }[]>([]);
  const [copied, setCopied] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isGenerating) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isGenerating]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeRunId && isGenerating) {
      const fetchLogs = async () => {
        try {
          const { data } = await insforge.database
            .from('agent_logs')
            .select('*')
            .eq('run_id', activeRunId)
            .order('created_at', { ascending: true });
          
          if (data && data.length > 0) {
            setLogs(data);
          }
        } catch (error) {
          console.error('Error fetching logs:', error);
        }
      };
      
      fetchLogs();
      interval = setInterval(fetchLogs, 1500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeRunId, isGenerating]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setContent('');
      setLogs([{ message: 'Initializing cover letter agent...', level: 'info', created_at: new Date().toISOString() }]);
      
      const response = await fetch('/api/agent/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });

      const result = await response.json();

      if (result.success) {
        setContent(result.data.coverLetter);
        setActiveRunId(result.data.runId);
      } else {
        console.error('Generation failed:', result.error);
        alert(`Failed to generate: ${result.error}`);
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const currentDateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const header = `${userProfile.full_name}\n${userProfile.email}${userProfile.phone ? `\n${userProfile.phone}` : ''}${userProfile.location ? `\n${userProfile.location}` : ''}\n\n${currentDateStr}\n\n`;
    navigator.clipboard.writeText(header + content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-surface-secondary/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-muted flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Cover Letter Generator</h2>
              <p className="text-xs text-text-muted">{jobTitle} at {company}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-surface-tertiary flex items-center justify-center transition-colors text-text-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {content ? (
            <div className="space-y-4">
              <div className="bg-surface-tertiary/50 border border-border rounded-2xl p-8 font-serif text-sm text-text-slate leading-relaxed whitespace-pre-wrap min-h-[500px] shadow-inner">
                {/* Visual Header for the letter in the modal */}
                <div className="mb-8 border-b border-border-muted pb-6 not-italic font-sans">
                  <h1 className="text-xl font-bold text-accent mb-1">{userProfile.full_name}</h1>
                  <div className="text-xs text-text-muted flex flex-wrap gap-x-4 gap-y-1">
                    <span>{userProfile.email}</span>
                    {userProfile.phone && <span>{userProfile.phone}</span>}
                    {userProfile.location && <span>{userProfile.location}</span>}
                  </div>
                  <div className="mt-4 text-sm font-medium text-text-primary">
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                {content}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCopy}
                  className="flex-1 btn-secondary py-2.5 flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
                
                <PDFDownloadLink 
                  document={
                    <CoverLetterPDF 
                      data={{
                        full_name: userProfile.full_name,
                        email: userProfile.email,
                        phone: userProfile.phone,
                        location: userProfile.location,
                        content: content,
                        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      }} 
                    />
                  } 
                  fileName={`Cover_Letter_${company.replace(/\s+/g, '_')}.pdf`}
                  className="flex-1 btn-primary py-2.5 flex items-center justify-center gap-2"
                >
                  {({ loading }) => (
                    <>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      Download PDF
                    </>
                  )}
                </PDFDownloadLink>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-accent-light/30 border-t-accent animate-spin" />
                <Sparkles className="w-8 h-8 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              
              <div className="space-y-2 max-w-sm">
                <h3 className="text-lg font-bold text-text-primary">Generating your cover letter...</h3>
                <p className="text-xs text-text-muted">The agent is fusing your profile with job requirements and company research to create a tailored draft.</p>
              </div>

              {/* Progress Log */}
              <div className="w-full bg-overlay rounded-2xl border border-border overflow-hidden">
                <div className="px-4 py-2 border-b border-border-muted flex items-center justify-between bg-surface-tertiary/20">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Agent Progress Log</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
                    <div className="w-1 h-1 rounded-full bg-success animate-pulse delay-75" />
                    <div className="w-1 h-1 rounded-full bg-success animate-pulse delay-150" />
                  </div>
                </div>
                <div className="p-4 max-h-40 overflow-y-auto space-y-2 font-mono text-[11px] text-left">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                      <span className="text-text-muted shrink-0">[{new Date(log.created_at).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                      <span className={
                        log.level === 'error' ? 'text-error' : 
                        log.level === 'warning' ? 'text-warning' : 
                        log.level === 'success' ? 'text-success' : 
                        'text-text-slate-medium'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-accent-muted flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-accent" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-lg font-bold text-text-primary">Ready to Generate</h3>
                <p className="text-xs text-text-muted">
                  We&apos;ll use your <strong>{userProfile.cover_letter_tone || 'formal'}</strong> tone settings and match your skills to the specific job requirements.
                </p>
              </div>
              
              <div className="w-full bg-accent-muted/50 rounded-2xl p-4 flex gap-3 text-left">
                <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-accent leading-relaxed">
                  <strong>Did you know?</strong> This generator automatically cites facts from the company research dossier to show you&apos;ve done your homework.
                </p>
              </div>

              <button 
                onClick={handleGenerate}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Tailored Letter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
