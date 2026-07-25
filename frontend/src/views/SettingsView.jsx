import React, { useState, useEffect } from 'react';
import { Settings, Key, Mail, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Database, Save } from 'lucide-react';
import { api } from '../utils/api';

export const SettingsView = ({ toast }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);

  // Settings State
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  
  // Scheduler State
  const [autoScrapeEnabled, setAutoScrapeEnabled] = useState(false);
  const [scraperIntervalHours, setScraperIntervalHours] = useState('24');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      if (data) {
        setClaudeApiKey(data.claude_api_key || '');
        setSmtpHost(data.smtp_host || 'smtp.gmail.com');
        setSmtpPort(data.smtp_port || '587');
        setSmtpUser(data.smtp_user || '');
        setSmtpPass(data.smtp_pass || '');
        setSmtpFrom(data.smtp_from || '');
        setAutoScrapeEnabled(data.auto_scraper_enabled === 'true');
        setScraperIntervalHours(data.scraper_interval_hours || '24');
      }
    } catch (err) {
      console.warn('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({
        claude_api_key: claudeApiKey,
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        smtp_user: smtpUser,
        smtp_pass: smtpPass,
        smtp_from: smtpFrom,
        auto_scraper_enabled: String(autoScrapeEnabled),
        scraper_interval_hours: scraperIntervalHours
      });

      // Toggle background cron scheduler
      await api.toggleScheduler(autoScrapeEnabled, scraperIntervalHours);

      toast('System & API settings updated successfully!', 'success');
    } catch (err) {
      toast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSMTP = async () => {
    setTestingSmtp(true);
    try {
      // First save current values
      await api.updateSettings({
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        smtp_user: smtpUser,
        smtp_pass: smtpPass,
        smtp_from: smtpFrom
      });

      const res = await api.testSMTP();
      if (res.ok) {
        toast('✅ SMTP Connection Verified Successfully!', 'success');
      } else {
        toast(`⚠️ SMTP Test Notice: ${res.message}`, 'error');
      }
    } catch (err) {
      toast(err.message || 'SMTP test failed', 'error');
    } finally {
      setTestingSmtp(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', color: 'var(--accent-cyan)', padding: '50px' }}>Loading system settings...</div>;
  }

  return (
    <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={24} color="var(--accent-cyan)" /> System Settings & API Configuration
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Manage Anthropic Claude API credentials, Nodemailer SMTP server connection, and Node-Cron scheduler.
          </p>
        </div>

        <button type="submit" className="btn-cyber" disabled={saving}>
          <Save size={16} /> Save All Settings
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column: AI & SMTP Settings */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} color="var(--accent-cyan)" /> Anthropic Claude AI API Key
          </h3>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Claude API Secret Key (sk-ant-...)
            </label>
            <input
              type="password"
              className="cyber-input"
              placeholder="sk-ant-api03-..."
              value={claudeApiKey}
              onChange={(e) => setClaudeApiKey(e.target.value)}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
              * If left blank, Kronos AI automatically utilizes its built-in offline smart heuristic engine.
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={18} color="var(--accent-purple)" /> Nodemailer SMTP Server Credentials
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SMTP Host</label>
              <input type="text" className="cyber-input" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Port</label>
              <input type="text" className="cyber-input" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SMTP Username / Gmail Address</label>
            <input type="email" className="cyber-input" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="your.name@gmail.com" />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SMTP Password / App Password</label>
            <input type="password" className="cyber-input" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder="••••••••••••••••" />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sender Header Name & Address</label>
            <input type="text" className="cyber-input" value={smtpFrom} onChange={(e) => setSmtpFrom(e.target.value)} placeholder='Kronos AI Outreach <user@gmail.com>' />
          </div>

          <button type="button" className="btn-cyber-outline" onClick={handleTestSMTP} disabled={testingSmtp} style={{ justifyContent: 'center' }}>
            {testingSmtp ? 'Verifying SMTP Connection...' : <><ShieldCheck size={16} /> Test Live SMTP Server Connection</>}
          </button>
        </div>

        {/* Right Column: Node-Cron Scheduler & Database */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--accent-amber)" /> Background Node-Cron Scheduler
          </h3>

          <div style={{ background: 'rgba(2, 6, 15, 0.6)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>Automated Daily Job Scraping</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automatically trigger Playwright scraper at set intervals</div>
              </div>
              <input
                type="checkbox"
                checked={autoScrapeEnabled}
                onChange={(e) => setAutoScrapeEnabled(e.target.checked)}
                style={{ accentColor: 'var(--accent-cyan)', width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                Execution Interval (Hours)
              </label>
              <select className="cyber-select" value={scraperIntervalHours} onChange={(e) => setScraperIntervalHours(e.target.value)}>
                <option value="6">Every 6 Hours</option>
                <option value="12">Every 12 Hours</option>
                <option value="24">Every 24 Hours (Daily)</option>
                <option value="48">Every 48 Hours</option>
              </select>
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} color="var(--accent-emerald)" /> Database Diagnostics & Storage
          </h3>

          <div style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '16px', borderRadius: '10px' }}>
            <div style={{ color: 'var(--accent-emerald)', fontWeight: 700, marginBottom: '4px' }}>
              SQLite3 Storage Active
            </div>
            Location: <code>backend/database.db</code>. Storing tables for <code>jobs</code>, <code>users</code>, <code>profile</code>, <code>outreach_logs</code>, and <code>settings</code>.
          </div>
        </div>
      </div>
    </form>
  );
};
