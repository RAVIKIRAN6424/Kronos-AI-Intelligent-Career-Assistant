import React, { useState, useEffect } from 'react';
import { Send, Sparkles, History, Mail, Copy, Check, UserCheck, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';

export const AiOutreachView = ({ jobs, selectedJobForOutreach, toast }) => {
  const [selectedJobId, setSelectedJobId] = useState(selectedJobForOutreach?.id || '');
  const [templateType, setTemplateType] = useState('Technical');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const [recipientEmail, setRecipientEmail] = useState(selectedJobForOutreach?.recruiter_email || '');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedJobForOutreach) {
      setSelectedJobId(selectedJobForOutreach.id);
      setRecipientEmail(selectedJobForOutreach.recruiter_email || '');
    }
  }, [selectedJobForOutreach]);

  useEffect(() => {
    fetchOutreachLogs();
  }, []);

  const fetchOutreachLogs = async () => {
    try {
      const data = await api.getOutreachLogs();
      setLogs(data);
    } catch (err) {
      console.warn('Failed to fetch outreach logs:', err);
    }
  };

  const handleJobSelectChange = (e) => {
    const id = e.target.value;
    setSelectedJobId(id);
    const job = jobs.find(j => String(j.id) === String(id));
    if (job) {
      setRecipientEmail(job.recruiter_email || `careers@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`);
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedJobId) {
      toast('Please select a target job from your CRM.', 'error');
      return;
    }

    setGenerating(true);
    try {
      const res = await api.generateColdEmail({
        jobId: selectedJobId,
        templateType,
        customPrompt
      });

      setEmailSubject(res.subject || '');
      setEmailBody(res.body || '');
      toast('AI Cold Outreach Email generated!', 'success');
    } catch (err) {
      toast(err.message || 'Email generation failed', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!recipientEmail || !emailSubject || !emailBody) {
      toast('Recipient email, subject, and body are required.', 'error');
      return;
    }

    setSending(true);
    try {
      const res = await api.sendOutreachEmail({
        jobId: selectedJobId || null,
        recipientEmail,
        subject: emailSubject,
        body: emailBody,
        templateType
      });

      if (res.outcome?.mode === 'Simulated') {
        toast(`Email logged in Simulated Mode (Check SMTP credentials in Settings for live delivery)`, 'info');
      } else {
        toast('Outreach email dispatched live via SMTP!', 'success');
      }

      fetchOutreachLogs();
    } catch (err) {
      toast(err.message || 'Failed to send email', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    toast('Copied email to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Send size={24} color="var(--accent-cyan)" /> AI Cold Outreach Hub
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Synthesize hyper-personalized cold email pitches using Anthropic Claude API based on target job description & candidate resume.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column: Target Selection & AI Generator Controls */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--accent-purple)" /> Outreach Target & Tone Studio
          </h3>

          {/* Job Target Selector */}
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Select Target Job Opportunity
            </label>
            <select className="cyber-select" value={selectedJobId} onChange={handleJobSelectChange}>
              <option value="">-- Choose a Job from CRM --</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.title} at {j.company} ({j.category || 'Software'}) - {j.match_score}% Match
                </option>
              ))}
            </select>
          </div>

          {/* Recruiter Email Input */}
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Recruiter / Hiring Contact Email
            </label>
            <input
              type="email"
              className="cyber-input"
              placeholder="e.g., recruiter@company.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>

          {/* Tone Template Picker */}
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Outreach Tone & Style Template
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
              {['Technical', 'Startup', 'Formal', 'Casual', 'Executive'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTemplateType(t)}
                  style={{
                    background: templateType === t ? 'rgba(0, 242, 254, 0.15)' : 'rgba(2, 6, 15, 0.6)',
                    color: templateType === t ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    border: templateType === t ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Focus Instructions */}
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Custom Focus Notes for Claude AI (Optional)
            </label>
            <textarea
              className="cyber-input"
              rows={3}
              placeholder="e.g., Emphasize my 4 years experience with mechatronics automation and CAD SolidWorks modeling..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>

          <button className="btn-cyber" onClick={handleGenerateAI} disabled={generating} style={{ justifyContent: 'center', padding: '12px' }}>
            {generating ? 'Generating AI Email...' : <><Sparkles size={16} /> Synthesize Cold Email Pitch</>}
          </button>
        </div>

        {/* Right Column: Live Email Editor & Dispatcher */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} color="var(--accent-cyan)" /> Live Email Preview & Editor
            </h3>
            {emailBody && (
              <button className="btn-cyber-outline" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={handleCopy}>
                {copied ? <Check size={13} /> : <Copy size={13} />} Copy Text
              </button>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Subject Line</label>
            <input
              type="text"
              className="cyber-input"
              placeholder="Application: Role Title at Company Name - Candidate"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email Content Body</label>
            <textarea
              className="cyber-input"
              rows={12}
              placeholder="Click 'Synthesize Cold Email Pitch' to generate a hyper-personalized cold outreach email..."
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              style={{ fontFamily: 'var(--font-body)', fontSize: '13px', lineHeight: 1.6 }}
            />
          </div>

          <button className="btn-cyber" onClick={handleSendEmail} disabled={sending || !emailBody} style={{ justifyContent: 'center', padding: '14px' }}>
            {sending ? 'Dispatching Email...' : <><Send size={16} /> Dispatch Email via Nodemailer SMTP</>}
          </button>
        </div>
      </div>

      {/* Outreach Logs History Table */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} color="var(--accent-purple)" /> Outreach Activity History Logs
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-cyber)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>Sent Date</th>
                <th style={{ padding: '10px' }}>Recipient</th>
                <th style={{ padding: '10px' }}>Target Job</th>
                <th style={{ padding: '10px' }}>Subject Line</th>
                <th style={{ padding: '10px' }}>Template Style</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', color: 'var(--text-muted)' }}>
                    {new Date(log.sent_at).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px', fontWeight: 600, color: '#ffffff' }}>
                    {log.recipient_email}
                  </td>
                  <td style={{ padding: '10px', color: 'var(--accent-cyan)' }}>
                    {log.job_title ? `${log.job_title} (${log.job_company})` : 'Direct Inquiry'}
                  </td>
                  <td style={{ padding: '10px', color: 'var(--text-main)' }}>
                    {log.email_subject}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span className="badge-domain">{log.template_type || 'Technical'}</span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span className={`badge-status ${log.status === 'sent' ? 'badge-offer' : 'badge-rejected'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '20px 0' }}>
                    No outreach emails sent yet. Select a job above and dispatch your first cold email.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
