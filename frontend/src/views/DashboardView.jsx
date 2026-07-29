import React, { useState, useEffect } from 'react';
import {
  Briefcase, Send, Award, TrendingUp, Search, Sparkles, CheckCircle2, ArrowUpRight, Zap, Play, Square, Clock, Globe, Shield, AlertTriangle, X, Lock, FileText
} from 'lucide-react';
import { api } from '../utils/api';
import { categoryTheme } from '../utils/categoryColors';

export const DashboardView = ({ jobs = [], analytics = {}, onNavigate, onSelectJob, onOpenScraper, toast, currentUser, onOpenAuthModal }) => {
  const [botRunning, setBotRunning] = useState(false);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [portals, setPortals] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
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
    if (currentUser) {
      fetchPortals();
    }
  }, [currentUser]);

  const fetchPortals = async () => {
    try {
      const portalsData = await api.getPortals();
      if (portalsData && Array.isArray(portalsData)) {
        setPortals(portalsData.slice(0, 5)); // Show top 5 portals
        const count = portalsData.filter(p => p.is_connected === 1 || p.is_connected === true).length;
        setConnectedCount(count);
      }
    } catch (err) {
      console.warn('Portals fetch notice:', err);
    }
  };

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

  // Calculate accurate dynamic stats: If not logged in, all metric counts MUST be 0!
  const isUserLoggedIn = !!currentUser;
  const totalSaved = isUserLoggedIn ? (analytics?.total_jobs ?? jobs.length ?? 0) : 0;
  const totalApplied = isUserLoggedIn ? (analytics?.applied ?? jobs.filter(j => j.status === 'Applied').length ?? 0) : 0;
  const totalInterviews = isUserLoggedIn ? (analytics?.interviewing ?? jobs.filter(j => j.status === 'Interviewing').length ?? 0) : 0;
  const totalOffers = isUserLoggedIn ? (analytics?.offer ?? jobs.filter(j => j.status === 'Offer').length ?? 0) : 0;

  const computedAvgScore = isUserLoggedIn
    ? (jobs.length > 0
        ? Math.round(jobs.reduce((sum, j) => sum + (j.match_score || 0), 0) / jobs.length)
        : (analytics?.avg_match_score || 0))
    : 0;

  const topJobs = isUserLoggedIn
    ? [...jobs].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).slice(0, 4)
    : [];

  return (
    <>
      {/* Bot Engine Status Strip */}
      <div className="strip">
        <div 
          className="item" 
          style={{ cursor: 'pointer', transition: 'background 0.2s' }}
          onClick={handleToggleBot}
        >
          <div className="lbl" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Bot Execution State</span>
            <span style={{ fontSize: '9px', background: 'var(--panel-2)', padding: '2px 4px', borderRadius: '4px' }}>CLICK TO TOGGLE</span>
          </div>
          <div className={`val ${botRunning ? 'sage' : 'stopped'}`}>
            {botRunning ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sage)' }} />
                RUNNING (AUTOMATED)
              </span>
            ) : (
              'STOPPED / PAUSED'
            )}
          </div>
        </div>
        <div className="item">
          <div className="lbl">Started Time</div>
          <div className="val">{botState.started_time || 'Not started today'}</div>
        </div>
        <div className="item">
          <div className="lbl">Current Scanning Portal</div>
          <div className="val sage">{botState.current_portal || 'LinkedIn'}</div>
        </div>
        <div className="item">
          <div className="lbl">Current Job Task</div>
          <div className="val">{botState.current_job || 'Idle'}</div>
        </div>
        <div className="item">
          <div className="lbl">Applications Sent Today</div>
          <div className="val">
            {isUserLoggedIn ? (botState.applications_today || 0) : 0} Jobs
          </div>
        </div>
      </div>

      <div className="layout-grid">
        <div className="main-col">
          {/* Metrics */}
          <div className="metrics">
            <div className="mcard">
              <div className="top">Total Saved Jobs <Briefcase size={14} /></div>
              <div className="num">{totalSaved}</div>
              <div className="sub">Across all industry streams</div>
            </div>
            <div className="mcard">
              <div className="top">Applications Sent <Send size={14} /></div>
              <div className="num sage">{totalApplied}</div>
              <div className="sub">Active recruiters contacted</div>
            </div>
            <div className="mcard">
              <div className="top">Interviews Scheduled <Award size={14} /></div>
              <div className="num gold">{totalInterviews}</div>
              <div className="sub">High conversion rate</div>
            </div>
          </div>

          {/* Chart Card */}
          <div className="chart-card">
            <div className="chart-head">
              <h3>Application Activity</h3>
              <div className="chart-legend">
                <span><div className="sw" style={{ background: 'var(--gold)' }}></div> Interviews</span>
                <span><div className="sw" style={{ background: 'var(--line-strong)' }}></div> Applied</span>
              </div>
            </div>
            <div className="bars">
              {[
                { day: 'MON', count: 2 }, { day: 'TUE', count: 5 }, { day: 'WED', count: 3 }, 
                { day: 'THU', count: 8 }, { day: 'FRI', count: 4 }, { day: 'SAT', count: 1 }, { day: 'SUN', count: 6 }
              ].map((d, i) => (
                <div className="bar-col" key={i}>
                  <div 
                    className="bar" 
                    style={{ 
                      height: `${(d.count / 8) * 100}%`,
                      background: i === 3 ? 'linear-gradient(180deg, var(--gold), rgba(212, 166, 87, 0.15))' : 'var(--line-strong)'
                    }} 
                  ></div>
                  <div className="day">{d.day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities Card */}
          <div className="opps-card">
            <div className="opps-head">
              <h3>Top AI-Matched Opportunities</h3>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('jobs'); }}>View All ({jobs.length})</a>
            </div>
            
            {topJobs.length > 0 ? topJobs.map(job => (
              <div className="opp-row" key={job.id} onClick={() => onSelectJob(job)} style={{ cursor: 'pointer' }}>
                <div>
                  <div className="opp-title">{job.title}</div>
                  <div className="opp-sub">{job.company} • {job.location}</div>
                </div>
                <div className="opp-score">{job.match_score}% Match</div>
                <div className="opp-portal">{job.category || 'Software'}</div>
                <div className="opp-badge">{job.status || 'Saved'}</div>
              </div>
            )) : (
              <div className="opp-row">
                <div className="opp-sub">No job matches available yet.</div>
              </div>
            )}
          </div>
        </div>

        <div className="side-col">
          {/* Match Score Ring */}
          <div className="side-card">
            <h3>Profile Match Score</h3>
            <div className="score-ring">
              <div className="ring" style={{
                background: `conic-gradient(var(--gold) 0% ${computedAvgScore}%, var(--line-strong) ${computedAvgScore}% 100%)`
              }}>
                <div className="ring-inner">{computedAvgScore}%</div>
              </div>
              <div className="score-detail">
                <b>Kronos AI</b><br/>Profile Score based on recent scans
              </div>
            </div>
          </div>

          {/* Portal Status */}
          <div className="side-card">
            <h3>Portal Status</h3>
            {portals.length > 0 ? (
              portals.map((p, idx) => {
                const isConnected = p.is_connected === 1 || p.is_connected === true;
                const displayName = p.portal_name || (p.domain ? p.domain.split('.')[0] : 'Unknown');
                
                return (
                  <div className="portal-row" key={idx}>
                    <div className="portal-name">
                      <div className="portal-dot" style={{ background: isConnected ? 'var(--sage)' : 'var(--coral)' }}></div> 
                      {displayName}
                    </div>
                    <div className="portal-status">{isConnected ? 'Connected' : 'Disconnected'}</div>
                  </div>
                );
              })
            ) : (
              <div className="portal-row">
                <div className="portal-status">No portals configured.</div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="side-card">
            <h3>Recent Activity</h3>
            {(currentUser && recentActivities.length > 0 ? recentActivities : [
              { id: 1, time: '2h ago', action: 'Applied to Senior Backend Engineer at Stripe' },
              { id: 2, time: '5h ago', action: 'Automation engine discovered 12 new matches' },
              { id: 3, time: '1d ago', action: 'Resume parsed and optimized successfully' }
            ]).map((feed, idx) => (
              <div className="activity-row" key={feed.id || idx}>
                <div className="activity-dot"></div>
                <div>
                  <div className="activity-text">{feed.action}</div>
                  <div className="activity-time">{feed.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Job Portals Connection Requirement */}
      {showPortalModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card animate-slide-up" style={{
            maxWidth: '480px',
            width: '90%',
            padding: '32px',
            border: '2px solid var(--gold)',
            boxShadow: '0 0 40px rgba(212, 166, 87, 0.3)',
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
                  background: 'var(--gold-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--gold)'
                }}>
                  <AlertTriangle size={26} color="var(--gold)" />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#ffffff', fontWeight: 800 }}>
                    Portals Connection Required
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 600, marginTop: '2px' }}>
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
              border: '1px solid var(--line)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Connected Portals Status:</span>
              <span style={{
                fontWeight: 800,
                fontSize: '14px',
                color: connectedCount >= 2 ? 'var(--sage)' : 'var(--coral)',
                background: connectedCount >= 2 ? 'var(--sage-soft)' : 'var(--coral-soft)',
                padding: '4px 12px',
                borderRadius: '20px',
                border: connectedCount >= 2 ? '1px solid var(--sage)' : '1px solid var(--coral)'
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
    </>
  );
};
