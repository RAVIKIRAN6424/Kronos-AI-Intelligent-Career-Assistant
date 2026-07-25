import React, { useState } from 'react';
import { X, ExternalLink, Send, Sparkles, Building2, MapPin, DollarSign, Mail, User, Check, Trash2 } from 'lucide-react';
import { api } from '../utils/api';

export const JobDetailModal = ({ job, onClose, onJobUpdated, onOpenOutreach, toast }) => {
  if (!job) return null;

  const [status, setStatus] = useState(job.status || 'Saved');
  const [recruiterName, setRecruiterName] = useState(job.recruiter_name || '');
  const [recruiterEmail, setRecruiterEmail] = useState(job.recruiter_email || '');
  const [notes, setNotes] = useState(job.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateJob(job.id, {
        status,
        recruiter_name: recruiterName,
        recruiter_email: recruiterEmail,
        notes
      });
      toast('Job details updated!', 'success');
      if (onJobUpdated) onJobUpdated(updated);
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to update job', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${job.title} at ${job.company}?`)) {
      try {
        await api.deleteJob(job.id);
        toast('Job deleted from CRM.', 'success');
        if (onJobUpdated) onJobUpdated(null);
        onClose();
      } catch (err) {
        toast(err.message || 'Delete failed', 'error');
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      background: 'rgba(2, 6, 15, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        maxWidth: '750px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={22} />
        </button>

        {/* Job Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', paddingRight: '30px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge-domain">{job.category || 'Software'}</span>
              <span className="badge-domain" style={{ background: 'rgba(79, 172, 254, 0.15)', color: 'var(--accent-blue)', borderColor: 'rgba(79, 172, 254, 0.3)' }}>
                {job.country || 'India'}
              </span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: '#ffffff', fontWeight: 800 }}>
              {job.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', color: 'var(--text-muted)', fontSize: '13px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building2 size={15} color="var(--accent-cyan)" /> {job.company}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={15} color="var(--accent-purple)" /> {job.location}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={15} color="var(--accent-emerald)" /> {job.salary || 'Competitive'}</span>
            </div>
          </div>

          {/* Score Badge */}
          <div style={{
            background: 'rgba(0, 242, 254, 0.1)',
            border: '1px solid var(--accent-cyan)',
            padding: '10px 16px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Match Score</div>
            <div style={{ fontSize: '26px', fontFamily: 'var(--font-code)', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {job.match_score || 85}%
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button className="btn-cyber" onClick={() => onOpenOutreach(job)}>
            <Send size={15} /> Launch AI Cold Outreach
          </button>
          {job.url && (
            <a href={job.url} target="_blank" rel="noreferrer" className="btn-cyber-outline">
              <ExternalLink size={15} /> View Original Posting ({job.source || 'Link'})
            </a>
          )}
          <button className="btn-cyber-outline btn-danger" onClick={handleDelete} style={{ marginLeft: 'auto' }}>
            <Trash2 size={15} /> Delete Job
          </button>
        </div>

        {/* Job Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Status & Recruiter Info */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--accent-cyan)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} /> CRM & Recruiter Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Application Pipeline Status</label>
                <select className="cyber-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Saved">Saved</option>
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Recruiter / Hiring Manager Name</label>
                <input
                  type="text"
                  className="cyber-input"
                  placeholder="e.g., Sarah Connor"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Recruiter Email Address</label>
                <input
                  type="email"
                  className="cyber-input"
                  placeholder="e.g., sarah@company.com"
                  value={recruiterEmail}
                  onChange={(e) => setRecruiterEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Key Skills & Requirements */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--accent-purple)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} /> AI Key Skills & Rationale
            </h4>
            <div style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '12px' }}>
              <strong>Extracted Skills:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {(job.key_skills || 'Technical Stack, System Design, Communication').split(',').map((s, i) => (
                  <span key={i} style={{
                    background: 'rgba(0, 242, 254, 0.1)',
                    border: '1px solid rgba(0, 242, 254, 0.25)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: 'var(--accent-cyan)'
                  }}>
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(2, 6, 15, 0.6)', padding: '10px', borderRadius: '6px' }}>
              {job.description || 'Live job posting with full technical and strategic role requirements.'}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Personal CRM Notes & Follow-up Log
          </label>
          <textarea
            className="cyber-input"
            rows={4}
            placeholder="Add interview notes, compensation details, follow-up dates..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Modal Save Controls */}
        <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '12px' }}>
          <button className="btn-cyber-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-cyber" onClick={handleSave} disabled={saving}>
            <Check size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
