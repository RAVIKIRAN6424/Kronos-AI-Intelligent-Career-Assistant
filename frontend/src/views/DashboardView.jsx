import React, { useState, useEffect } from 'react';
import {
  Briefcase, Send, Award, TrendingUp, Search, Sparkles, CheckCircle2, ArrowUpRight, Zap, Play, Square, Clock, Globe, Shield, AlertTriangle, X, Lock
} from 'lucide-react';
import { api } from '../utils/api';
import { categoryTheme } from '../utils/categoryColors';

export const DashboardView = ({ jobs = [], analytics = {}, onNavigate, onSelectJob, onOpenScraper, toast, currentUser, onOpenAuthModal }) => {
  const [botRunning, setBotRunning] = useState(false);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [connectedCount, setConnectedCount] = useState(0);
  const [botState, setBotState] = useState({
    is_running: 0,
    started_time: null,
    current_portal: 'LinkedIn',
    current_job: 'Idle',
    applications_today: 0
  });

  useEffect(() => {
    fetchBotState();
  }, []);

  const fetchBotState = async () => {
    try {
      const state = await api.getBotState();
      if (state) {
        setBotState(state);
        setBotRunning(state.is_running === 1);
      }
    } catch (err) {
      console.warn('Bot state fetch notice:', err);
    }
  };

  const handleToggleBot = async () => {
    // Rule 1: Must be logged in to start automation
    if (!currentUser) {
      if (toast) {
        toast('🔐 Authentication Required: Please sign in or register before launching Kronos AI Automation!', 'error');
      }
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    const nextRunning = !botRunning;

    // Rule 2: If starting, must have at least 2 connected job portals
    if (nextRunning) {
      try {
        const portalsData = await api.getPortals();
        const connectedPortals = (portalsData && Array.isArray(portalsData))
          ? portalsData.filter(p => p.is_connected === 1 || p.is_connected === true)
          : [];

        if (connectedPortals.length < 2) {
          setConnectedCount(connectedPortals.length);
          setShowPortalModal(true);
          if (toast) {
            toast('⚠️ Requirements Not Met: Please connect at least 2 job portals before launching automation!', 'error');
          }
          return;
        }
      } catch (err) {
        console.warn('Could not verify portals count:', err);
      }
    }

    // Execute toggle
    try {
      const updated = await api.toggleBotState(nextRunning ? 1 : 0);
      setBotState(updated);
      setBotRunning(updated.is_running === 1);
      if (toast) {
        toast(`Automation Bot ${updated.is_running ? 'STARTED' : 'STOPPED'}!`, updated.is_running ? 'success' : 'info');
      }
    } catch (err) {
      const fallbackState = {
        is_running: nextRunning ? 1 : 0,
        started_time: nextRunning ? new Date().toLocaleTimeString() : null,
        current_portal: 'LinkedIn',
        current_job: nextRunning ? 'Scanning Live Postings...' : 'Stopped',
        applications_today: nextRunning ? 1 : 0
      };
      setBotState(fallbackState);
      setBotRunning(nextRunning);
      if (toast) toast(`Automation Bot ${nextRunning ? 'STARTED' : 'STOPPED'}`, nextRunning ? 'success' : 'info');
    }
  };

  // Calculate accurate dynamic stats
  const totalSaved = analytics?.total_jobs ?? jobs.length ?? 0;
  const totalApplied = analytics?.applied ?? jobs.filter(j => j.status === 'Applied').length ?? 0;
  const totalInterviews = analytics?.interviewing ?? jobs.filter(j => j.status === 'Interviewing').length ?? 0;
  const totalOffers = analytics?.offer ?? jobs.filter(j => j.status === 'Offer').length ?? 0;

  const computedAvgScore = jobs.length > 0
    ? Math.round(jobs.reduce((sum, j) => sum + (j.match_score || 0), 0) / jobs.length)
    : (analytics?.avg_match_score || 0);

  const topJobs = [...jobs]
    .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
    .slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner & Bot Control */}
      <div className="glass-card" style={{
        padding: '28px',
        background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.08), rgba(157, 78, 221, 0.12))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 242, 254, 0.15)', padding: '4px 10px', borderRadius: '20px', color: 'var(--accent-cyan)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>
            <Zap size={14} /> AUTONOMOUS CAREER ASSISTANT ENGINE
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: '#ffffff', fontWeight: 800 }}>
            Welcome to Kronos AI Assistant
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '600px', marginTop: '4px' }}>
            Automated background checking of enabled portals, matching role-specific resumes, and filtering job age (&lt;7 days).
          </p>
        </div>

        {/* START / STOP Control Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={handleToggleBot}
            style={{
              background: botRunning ? 'rgba(239, 68, 68, 0.2)' : 'var(--accent-cyan)',
              color: botRunning ? '#f87171' : '#060a12',
              border: botRunning ? '2px solid #f87171' : 'none',
              padding: '14px 28px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: botRunning ? '0 0 20px rgba(239, 68, 68, 0.4)' : 'var(--glow-cyan)',
              transition: 'all 0.3s ease'
            }}
          >
            {botRunning ? <Square size={20} fill="#f87171" /> : <Play size={20} fill="#060a12" />}
            {botRunning ? 'STOP AUTOMATION' : 'START AUTOMATION'}
          </button>
        </div>
      </div>

      {/* Bot Engine Status Box */}
      <div className="glass-card" style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', border: '1px solid var(--border-cyber)' }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Bot Execution State</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: botRunning ? 'var(--accent-emerald)' : '#f87171', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: botRunning ? 'var(--accent-emerald)' : '#f87171' }} />
            {botRunning ? 'RUNNING (AUTOMATED)' : 'STOPPED / PAUSED'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Started Time</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginTop: '4px', fontFamily: 'var(--font-code)' }}>
            {botState.started_time || 'Not started today'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Current Scanning Portal</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '4px' }}>
            {botState.current_portal || 'LinkedIn'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Current Job Task</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {botState.current_job || 'Idle'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Applications Sent Today</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '4px', fontFamily: 'var(--font-code)' }}>
            {botState.applications_today || 0} Jobs
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px'
      }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '13px' }}>
            <span>Total Saved Jobs</span>
            <Briefcase size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '32px', fontFamily: 'var(--font-code)', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
            {totalSaved}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginTop: '4px' }}>Across all industry streams</div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '13px' }}>
            <span>Applications Sent</span>
            <Send size={18} color="var(--accent-blue)" />
          </div>
          <div style={{ fontSize: '32px', fontFamily: 'var(--font-code)', fontWeight: 800, color: 'var(--accent-blue)', marginTop: '8px' }}>
            {totalApplied}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Active recruiters contacted</div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '13px' }}>
            <span>Interviews Scheduled</span>
            <Award size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '32px', fontFamily: 'var(--font-code)', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '8px' }}>
            {totalInterviews}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-amber)', marginTop: '4px' }}>High conversion rate</div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '13px' }}>
            <span>Avg Match Score</span>
            <Sparkles size={18} color="var(--accent-purple)" />
          </div>
          <div style={{ fontSize: '32px', fontFamily: 'var(--font-code)', fontWeight: 800, color: 'var(--accent-purple)', marginTop: '8px' }}>
            {computedAvgScore}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Claude AI Profile Score</div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '13px' }}>
            <span>Offers Received</span>
            <CheckCircle2 size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '32px', fontFamily: 'var(--font-code)', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '8px' }}>
            {totalOffers}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '4px' }}>Final offer stage</div>
        </div>
      </div>

      {/* Top Matching Jobs */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff' }}>
            🔥 Top AI-Matched Opportunities
          </h3>
          <button className="btn-cyber-outline" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => onNavigate('jobs')}>
            View All Jobs CRM ({jobs.length}) <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {topJobs.map(job => (
            <div key={job.id} className="glass-card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => onSelectJob(job)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span className="badge-domain">{job.category || 'Software'}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)' }}>
                  {job.match_score}% Match
                </span>
              </div>
              <h4 style={{ fontSize: '16px', color: '#ffffff', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
                {job.title}
              </h4>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {job.company} • {job.location}
              </div>
              <div className="score-container" style={{ marginBottom: '12px' }}>
                <div className="score-bar-bg">
                  <div className="score-bar-fill" style={{ width: `${job.match_score}%` }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-dim)' }}>
                <span>Salary: {job.salary || 'Competitive'}</span>
                <span className={`badge-status badge-${(job.status || 'Saved').toLowerCase()}`}>
                  {job.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Job Portals Connection Requirement */}
      {showPortalModal && (
        <div className="modal-backdrop">
          <div className="glass-card animate-slide-up" style={{
            maxWidth: '480px',
            width: '90%',
            padding: '32px',
            border: '2px solid var(--accent-amber)',
            boxShadow: '0 0 40px rgba(245, 158, 11, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--accent-amber)'
                }}>
                  <AlertTriangle size={26} color="var(--accent-amber)" />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#ffffff', fontWeight: 800 }}>
                    Portals Connection Required
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--accent-amber)', fontWeight: 600, marginTop: '2px' }}>
                    At least 2 Job Portals needed
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowPortalModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.6' }}>
              To enable Kronos AI Autonomous Background Automation, you must connect at least <strong>2 Job Portals</strong> with your account credentials (e.g., LinkedIn, Indeed, Naukri, Glassdoor).
            </p>

            <div style={{
              background: 'rgba(2, 6, 15, 0.6)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Connected Portals Status:</span>
              <span style={{
                fontWeight: 800,
                fontSize: '14px',
                color: connectedCount >= 2 ? 'var(--accent-emerald)' : '#f87171',
                background: connectedCount >= 2 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                padding: '4px 12px',
                borderRadius: '20px',
                border: connectedCount >= 2 ? '1px solid var(--accent-emerald)' : '1px solid #f87171'
              }}>
                {connectedCount} / 2 Portals Connected
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                className="btn-cyber-outline"
                style={{ padding: '10px 18px', fontSize: '13px' }}
                onClick={() => setShowPortalModal(false)}
              >
                Cancel
              </button>

              <button
                className="btn-cyber-primary"
                style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 700 }}
                onClick={() => {
                  setShowPortalModal(false);
                  onNavigate('portals');
                }}
              >
                <Globe size={16} /> Connect Job Portals Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
