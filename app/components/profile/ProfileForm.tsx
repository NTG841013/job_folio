'use client';

import React, { useState, useTransition } from 'react';

interface ProfileFormProps {
  initialData: any;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export default function ProfileForm({ initialData, onSave, isLoading = false }: ProfileFormProps) {
  const [formData, setFormData] = useState(initialData);

  // Sync formData when initialData changes (important for async loads)
  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const [newSkill, setNewSkill] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newTitleSeeking, setNewTitleSeeking] = useState('');
  const [newLocationPref, setNewLocationPref] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await onSave(formData);
        setSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Failed to save profile');
      }
    });
  };

  const handleListAdd = (field: 'skills' | 'industries' | 'job_titles_seeking' | 'preferred_locations', value: string) => {
    if (!value.trim()) return;
    setFormData((prev: any) => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()],
    }));
  };

  const handleListRemove = (field: 'skills' | 'industries' | 'job_titles_seeking' | 'preferred_locations', index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index),
    }));
  };

  const handleExperienceChange = (index: number, field: string, value: any) => {
    const updatedExperience = [...(formData.work_experience || [])];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, work_experience: updatedExperience }));
  };

  const addExperience = () => {
    setFormData((prev: any) => ({
      ...prev,
      work_experience: [
        ...(prev.work_experience || []),
        { company: '', title: '', startDate: '', endDate: '', current: false, description: '' }
      ],
    }));
  };

  const removeExperience = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      work_experience: prev.work_experience.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleEducationChange = (index: number, field: string, value: any) => {
    const updatedEducation = [...(Array.isArray(formData.education) ? formData.education : [])];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setFormData((prev: any) => ({ ...prev, education: updatedEducation }));
  };

  const addEducation = () => {
    setFormData((prev: any) => ({
      ...prev,
      education: [
        ...(Array.isArray(prev.education) ? prev.education : []),
        { school: '', degree: '', field: '', graduationDate: '' }
      ],
    }));
  };

  const removeEducation = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      education: (prev.education || []).filter((_: any, i: number) => i !== index),
    }));
  };

  return (
    <div className="space-y-8 pb-32">
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-sm text-error mb-6">
          <p className="font-bold mb-1">Update Failed</p>
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-success/10 border border-success/20 rounded-lg text-sm text-success mb-6 flex items-center justify-between">
          <div>
            <p className="font-bold mb-1">Profile Saved</p>
            <p>Your profile information has been successfully updated.</p>
          </div>
          <button onClick={() => setSuccess(false)} className="text-success hover:opacity-70">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Info */}
      <section className="card-premium">
        <h2 className="text-base font-bold text-text-darkest mb-6 border-b border-border-light pb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name || ''}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={formData.email || ''}
              disabled
              className="w-full px-4 py-2 bg-surface-secondary border border-border rounded-lg text-text-muted cursor-not-allowed outline-none text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
              placeholder="San Francisco, CA"
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">LinkedIn URL</label>
            <input
              type="url"
              name="linkedin_url"
              value={formData.linkedin_url || ''}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Portfolio / GitHub</label>
            <input
              type="url"
              name="portfolio_url"
              value={formData.portfolio_url || ''}
              onChange={handleChange}
              placeholder="https://github.com/username"
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Years of Experience</label>
            <input
              type="number"
              name="years_experience"
              value={formData.years_experience || ''}
              onChange={handleChange}
              placeholder="5"
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Experience Level</label>
            <select
              name="experience_level"
              value={formData.experience_level || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none appearance-none text-sm"
            >
              <option value="">Select level</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid-level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead / Manager</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Work Authorization</label>
            <select
              name="work_authorization"
              value={formData.work_authorization || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none appearance-none text-sm"
            >
              <option value="">Select status</option>
              <option value="citizen">Citizen</option>
              <option value="permanent_resident">Permanent Resident</option>
              <option value="visa_required">Visa Required</option>
            </select>
          </div>
        </div>
      </section>

      {/* Job Preferences */}
      <section className="card-premium">
        <h2 className="text-base font-bold text-text-darkest mb-6 border-b border-border-light pb-4">Job Preferences</h2>
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Job Titles You're Seeking</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTitleSeeking}
                onChange={(e) => setNewTitleSeeking(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleListAdd('job_titles_seeking', newTitleSeeking), setNewTitleSeeking(''))}
                placeholder="e.g. Full Stack Engineer"
                className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => (handleListAdd('job_titles_seeking', newTitleSeeking), setNewTitleSeeking(''))}
                className="btn-secondary whitespace-nowrap"
              >
                Add Title
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.job_titles_seeking?.map((title: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-info-muted text-info-dark text-sm font-medium rounded-full flex items-center gap-2">
                  {title}
                  <button type="button" onClick={() => handleListRemove('job_titles_seeking', i)} className="hover:text-info-darkest">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Preferred Locations</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLocationPref}
                onChange={(e) => setNewLocationPref(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleListAdd('preferred_locations', newLocationPref), setNewLocationPref(''))}
                placeholder="e.g. Remote, New York, NY"
                className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => (handleListAdd('preferred_locations', newLocationPref), setNewLocationPref(''))}
                className="btn-secondary whitespace-nowrap"
              >
                Add Location
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.preferred_locations?.map((loc: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-success-muted text-success text-sm font-medium rounded-full flex items-center gap-2">
                  {loc}
                  <button type="button" onClick={() => handleListRemove('preferred_locations', i)} className="hover:text-success-dark">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Target Industries</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleListAdd('industries', newIndustry), setNewIndustry(''))}
                placeholder="e.g. FinTech, Healthcare"
                className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => (handleListAdd('industries', newIndustry), setNewIndustry(''))}
                className="btn-secondary whitespace-nowrap"
              >
                Add Industry
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.industries?.map((industry: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-accent-muted text-accent text-sm font-medium rounded-full flex items-center gap-2">
                  {industry}
                  <button type="button" onClick={() => handleListRemove('industries', i)} className="hover:text-accent-dark">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Remote Preference</label>
              <select
                name="remote_preference"
                value={formData.remote_preference || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none appearance-none text-sm"
              >
                <option value="">Select preference</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
                <option value="any">Any</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Salary Expectation</label>
              <input
                type="text"
                name="salary_expectation"
                value={formData.salary_expectation || ''}
                onChange={handleChange}
                placeholder="e.g. $120k - $150k"
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Cover Letter Tone</label>
              <select
                name="cover_letter_tone"
                value={formData.cover_letter_tone || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none appearance-none text-sm"
              >
                <option value="">Select tone</option>
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="enthusiastic">Enthusiastic</option>
              </select>
            </div>
          </div>
        </div>
      </section>


      {/* Professional Info */}
      <section className="card-premium">
        <h2 className="text-base font-bold text-text-darkest mb-6 border-b border-border-light pb-4">Professional Information</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Current Job Title</label>
            <input
              type="text"
              name="current_title"
              value={formData.current_title || ''}
              onChange={handleChange}
              placeholder="Senior Software Engineer"
              className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none text-sm"
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Skills</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleListAdd('skills', newSkill), setNewSkill(''))}
                placeholder="Add a skill (e.g. React)"
                className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none"
              />
              <button
                type="button"
                onClick={() => (handleListAdd('skills', newSkill), setNewSkill(''))}
                className="btn-secondary whitespace-nowrap"
              >
                Add Skill
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills?.map((skill: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-accent-muted text-accent text-sm font-medium rounded-full flex items-center gap-2">
                  {skill}
                  <button type="button" onClick={() => handleListRemove('skills', i)} className="hover:text-accent-dark">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Work Experience */}
      <section className="card-premium">
        <div className="flex items-center justify-between mb-6 border-b border-border-light pb-4">
          <h2 className="text-base font-bold text-text-darkest">Work Experience</h2>
          <button
            type="button"
            onClick={addExperience}
            className="text-accent text-sm font-semibold flex items-center gap-1 hover:underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Role
          </button>
        </div>
        
        <div className="space-y-8">
          {formData.work_experience?.map((exp: any, i: number) => (
            <div key={i} className="relative p-6 bg-surface-secondary border border-border rounded-xl space-y-4">
              <button
                type="button"
                onClick={() => removeExperience(i)}
                className="absolute top-4 right-4 text-text-muted hover:text-error"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    value={exp.company || ''}
                    onChange={(e) => handleExperienceChange(i, 'company', e.target.value)}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Job Title</label>
                  <input
                    type="text"
                    value={exp.title || ''}
                    onChange={(e) => handleExperienceChange(i, 'title', e.target.value)}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Start Date</label>
                  <input
                    type="text"
                    placeholder="MM/YYYY"
                    value={exp.startDate || ''}
                    onChange={(e) => handleExperienceChange(i, 'startDate', e.target.value)}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">End Date</label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="text"
                      placeholder="MM/YYYY"
                      disabled={exp.current}
                      value={exp.current ? 'Present' : (exp.endDate || '')}
                      onChange={(e) => handleExperienceChange(i, 'endDate', e.target.value)}
                      className="flex-1 px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none disabled:bg-surface-secondary disabled:text-text-muted text-sm"
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!exp.current}
                        onChange={(e) => handleExperienceChange(i, 'current', e.target.checked)}
                        className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                      />
                      <span className="text-xs font-medium text-text-secondary">Present</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Key Responsibilities</label>
                <textarea
                  value={exp.description || ''}
                  onChange={(e) => handleExperienceChange(i, 'description', e.target.value)}
                  rows={4}
                  placeholder="Bullet points of your key achievements and duties..."
                  className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none resize-none text-sm"
                />
              </div>
            </div>
          ))}
          
          {(!formData.work_experience || formData.work_experience.length === 0) && (
            <div className="text-center py-8 text-text-muted">
              No work experience added yet.
            </div>
          )}
        </div>
      </section>

      {/* Education */}
      <section className="card-premium">
        <div className="flex items-center justify-between mb-6 border-b border-border-light pb-4">
          <h2 className="text-base font-bold text-text-darkest">Education</h2>
          <button
            type="button"
            onClick={addEducation}
            className="text-accent text-sm font-semibold flex items-center gap-1 hover:underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Education
          </button>
        </div>
        
        <div className="space-y-8">
          {(Array.isArray(formData.education) ? formData.education : []).map((edu: any, i: number) => (
            <div key={i} className="relative p-6 bg-surface-secondary border border-border rounded-xl space-y-4">
              <button
                type="button"
                onClick={() => removeEducation(i)}
                className="absolute top-4 right-4 text-text-muted hover:text-error"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Institution Name</label>
                  <input
                    type="text"
                    value={edu.school || edu.institution || ''}
                    onChange={(e) => handleEducationChange(i, 'school', e.target.value)}
                    placeholder="University of Technology"
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Degree</label>
                  <select
                    value={edu.degree || ''}
                    onChange={(e) => handleEducationChange(i, 'degree', e.target.value)}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none appearance-none text-sm"
                  >
                    <option value="">Select degree</option>
                    <option value="bachelors">Bachelor's</option>
                    <option value="masters">Master's</option>
                    <option value="phd">PhD</option>
                    <option value="associate">Associate</option>
                    <option value="highschool">High School</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Field of Study</label>
                  <input
                    type="text"
                    value={edu.field || ''}
                    onChange={(e) => handleEducationChange(i, 'field', e.target.value)}
                    placeholder="Computer Science"
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-slate-medium uppercase tracking-wider">Graduation Year / Date</label>
                  <input
                    type="text"
                    value={edu.graduationDate || edu.year || ''}
                    onChange={(e) => handleEducationChange(i, 'graduationDate', e.target.value)}
                    placeholder="2020 or MM/YYYY"
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-1 focus:ring-accent outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {(!Array.isArray(formData.education) || formData.education.length === 0) && (
            <div className="text-center py-8 text-text-muted">
              No education history added yet.
            </div>
          )}
        </div>
      </section>

      {/* Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-md border-t border-border p-4 flex justify-center z-50">
        <div className="w-full max-w-7xl px-6 flex items-center justify-between">
          <div className="hidden md:block">
            <p className="text-sm text-text-secondary">
              <span className="font-bold text-accent">Tip:</span> Save your changes to keep your profile up to date.
            </p>
          </div>
          <button
            type="submit"
            disabled={isPending || isLoading}
            className="btn-primary px-12 py-3 text-base shadow-lg shadow-accent/20 flex items-center gap-2"
          >
            {(isPending || isLoading) && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
            {isPending || isLoading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </div>
      </form>
    </div>
  );
}
