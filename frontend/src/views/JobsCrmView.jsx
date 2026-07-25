import React, { useState } from 'react';
import {
  Kanban, Table, Search, Filter, Plus, Send, Eye, Building2, MapPin, Sparkles, ExternalLink, Trash2
} from 'lucide-react';
import { api } from '../utils/api';

export const JobsCrmView = ({ jobs, onSelectJob, onOpenOutreach, onRefreshJobs, toast }) => {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [minScore, setMinScore] = useState(0);
  const [isCleaning, setIsCleaning] = useState(false);

  // Quick manual job create state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newLocation, setNewLocation] = useState('Bengaluru, India');
  const [newCategory, setNewCategory] = useState('Software');
  const [newDescription, setNewDescription] = useState('');
  const [newRecruiterEmail, setNewRecruiterEmail] = useState('');

  const handleDeduplicate = async () => {
    setIsCleaning(true);
    try {
      const res = await api.deduplicateJobs();
      if (res.removedCount > 0) {
        toast(`✨ Removed ${res.removedCount} duplicate job application(s)!`, 'success');
      } else {
        toast('No duplicate job applications found in CRM.', 'info');
      }
      onRefreshJobs();
    } catch (err) {
      toast(err.message || 'Failed to clean duplicates', 'error');
    } finally {
      setIsCleaning(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.key_skills && job.key_skills.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || job.category === categoryFilter;
    const matchesCountry = countryFilter === 'All' || (job.country && job.country === countryFilter) || (job.location && job.location.includes(countryFilter));
    const matchesScore = (job.match_score || 0) >= minScore;

    return matchesSearch && matchesStatus && matchesCategory && matchesCountry && matchesScore;
  });

  const statuses = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

  const handleAddJobSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle || !newCompany) {
      toast('Title and Company are required.', 'error');
      return;
    }

    try {
      await api.createJob({
        title: newTitle,
        company: newCompany,
        location: newLocation,
        category: newCategory,
        description: newDescription,
        recruiter_email: newRecruiterEmail
      });
      toast('Job manually added to CRM!', 'success');
      setShowAddModal(false);
      onRefreshJobs();
    } catch (err) {
      toast(err.message || 'Failed to add job', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Filter & Toolbar */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: '#ffffff', fontWeight: 800 }}>
              💼 Jobs CRM Pipeline
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Manage saved postings, track recruiter contact status, and review AI match scores.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: 'rgba(2, 6, 15, 0.8)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setViewMode('kanban')}
                style={{
                  background: viewMode === 'kanban' ? 'var(--accent-cyan)' : 'transparent',
                  color: viewMode === 'kanban' ? '#060a12' : 'var(--text-muted)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Kanban size={15} /> Kanban Board
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  background: viewMode === 'table' ? 'var(--accent-cyan)' : 'transparent',
                  color: viewMode === 'table' ? '#060a12' : 'var(--text-muted)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Table size={15} /> Data Table
              </button>
            </div>

            <button
              className="btn-cyber"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: '#f87171'
              }}
              onClick={handleDeduplicate}
              disabled={isCleaning}
              title="Remove duplicate job applications with identical title and company"
            >
              <Trash2 size={16} /> {isCleaning ? 'Cleaning...' : 'Clean Duplicates'}
            </button>

            <button className="btn-cyber" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Add Job Record
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--accent-cyan)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="cyber-input"
              placeholder="Search title, company, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select className="cyber-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Pipeline Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Category Domain Filter */}
          <div>
            <select className="cyber-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All Job Domains</option>
              <option value="Software">Software & Web</option>
              <option value="Mechanical">Mechanical Engineering</option>
              <option value="Electrical">Electrical & Power</option>
              <option value="Civil">Civil Structural</option>
              <option value="Business">Business Management</option>
              <option value="Data Science">Data Science & AI</option>
            </select>
          </div>

          {/* Country Location Filter */}
          <div>
            <select className="cyber-select" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              <option value="All">All Locations & Countries</option>
              <option value="India">India (Bengaluru, Mumbai, Pune...)</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Germany">Germany</option>
              <option value="UAE">UAE / Dubai</option>
              <option value="Singapore">Singapore</option>
            </select>
          </div>

          {/* Score Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Min Match Score</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{minScore}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              style={{ accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          alignItems: 'start'
        }}>
          {statuses.map(status => {
            const columnJobs = filteredJobs.filter(j => j.status === status);
            return (
              <div key={status} className="glass-panel" style={{ padding: '16px', minHeight: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                  <h3 style={{ fontSize: '15px', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                    {status}
                  </h3>
                  <span className={`badge-status badge-${status.toLowerCase()}`}>
                    {columnJobs.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {columnJobs.map(job => (
                    <div
                      key={job.id}
                      className="glass-card"
                      style={{ padding: '16px', cursor: 'pointer' }}
                      onClick={() => onSelectJob(job)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span className="badge-domain">{job.category || 'Software'}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)' }}>
                          {job.match_score || 85}%
                        </span>
                      </div>

                      <h4 style={{ fontSize: '15px', color: '#ffffff', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
                        {job.title}
                      </h4>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        {job.company} • {job.location}
                      </div>

                      {/* Recruiter Email Trigger */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed var(--border-subtle)', marginTop: '8px' }}>
                        <span style={{ fontSize: '11px', color: job.recruiter_status === 'Contacted' ? 'var(--accent-blue)' : 'var(--text-dim)' }}>
                          Recruiter: {job.recruiter_status || 'Not Contacted'}
                        </span>
                        <button
                          className="btn-cyber-outline"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenOutreach(job);
                          }}
                        >
                          <Send size={11} /> Outreach
                        </button>
                      </div>
                    </div>
                  ))}

                  {columnJobs.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px', padding: '30px 0' }}>
                      No jobs in {status}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DATA TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-cyber)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px' }}>Role Title & Company</th>
                <th style={{ padding: '12px' }}>Domain</th>
                <th style={{ padding: '12px' }}>Location</th>
                <th style={{ padding: '12px' }}>Match Score</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Recruiter</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => (
                <tr key={job.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 600, color: '#ffffff' }}>{job.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{job.company}</div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge-domain">{job.category || 'Software'}</span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {job.location}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-code)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        {job.match_score}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge-status badge-${(job.status || 'Saved').toLowerCase()}`}>
                      {job.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    {job.recruiter_name || 'Hiring Manager'}
                    <div style={{ fontSize: '10px', color: 'var(--accent-blue)' }}>{job.recruiter_status || 'Not Contacted'}</div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button className="btn-cyber-outline" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => onSelectJob(job)}>
                        <Eye size={13} /> View
                      </button>
                      <button className="btn-cyber" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => onOpenOutreach(job)}>
                        <Send size={13} /> Outreach
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Job Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(2, 6, 15, 0.85)',
          backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#ffffff', marginBottom: '16px' }}>
              ➕ Add Manual Job Record
            </h3>
            <form onSubmit={handleAddJobSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Job Title *</label>
                <input className="cyber-input" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Company Name *</label>
                <input className="cyber-input" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Location</label>
                  <input className="cyber-input" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Domain Stream</label>
                  <select className="cyber-select" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                    <option value="Software">Software</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Civil">Civil</option>
                    <option value="Business">Business</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Recruiter Email</label>
                <input type="email" className="cyber-input" value={newRecruiterEmail} onChange={(e) => setNewRecruiterEmail(e.target.value)} placeholder="careers@company.com" />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Job Description Summary</label>
                <textarea className="cyber-input" rows={3} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Key role duties and required skills..." />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-cyber-outline" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-cyber" style={{ flex: 2, justifyContent: 'center' }}>
                  Save Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
