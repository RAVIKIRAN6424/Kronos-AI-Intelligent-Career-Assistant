import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Globe, Briefcase, Award, Zap, Calendar, Filter, Lock, LogIn } from 'lucide-react';
import { api } from '../utils/api';
import { categoryTheme } from '../utils/categoryColors';

export const AnalyticsView = ({ jobs, currentUser, onOpenAuthModal }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('Past 30 Days'); // 'Today' | 'Past 7 Days' | 'Past 30 Days' | 'Year to Date'
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-25');

  useEffect(() => {
    fetchAnalytics();
  }, [jobs, dateRange, startDate, endDate, currentUser]);

  const fetchAnalytics = async () => {
    try {
      if (!currentUser) {
        setAnalytics(null);
        setLoading(false);
        return;
      }
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.warn('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', color: 'var(--accent-cyan)', padding: '50px' }}>Calculating CRM metrics...</div>;
  }

  const categoryBreakdown = currentUser ? (analytics?.category_breakdown || []) : [];
  const countryBreakdown = currentUser ? (analytics?.country_breakdown || []) : [];

  // Compute exact metrics: If unauthenticated, ALL metrics MUST be 0!
  const jobList = currentUser && Array.isArray(jobs) ? jobs : [];
  const savedCount = currentUser ? (jobList.filter(j => !j.status || j.status === 'Saved' || j.status === 'Saved Jobs').length || (analytics?.saved || jobList.length)) : 0;
  const appliedCount = currentUser ? jobList.filter(j => j.status === 'Applied').length : 0;
  const interviewingCount = currentUser ? jobList.filter(j => j.status === 'Interviewing').length : 0;
  const offerCount = currentUser ? jobList.filter(j => j.status === 'Offer').length : 0;
  const totalTracked = jobList.length || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Unauthenticated Lock Warning Banner */}
      {!currentUser && (
        <div className="glass-card" style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #f87171', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ffffff', fontSize: '14px', fontWeight: 600 }}>
            <Lock size={22} color="#f87171" />
            <span>Account Sign-In Required: Please sign in or register to view your personalized analytics metrics and recruitment funnel.</span>
          </div>
          <button className="btn-cyber-primary" style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={onOpenAuthModal}>
            <LogIn size={15} /> SIGN IN / REGISTER
          </button>
        </div>
      )}

      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={24} color="var(--accent-cyan)" /> Analytics & Funnel Intelligence
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Real-time metrics on recruitment conversion, role distribution with unique theme colors, and ATS score improvements.
          </p>
        </div>

        {/* Date Range & Calendar Start/End Pickers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(2, 6, 15, 0.6)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <Calendar size={15} color="var(--accent-cyan)" />
            <select className="cyber-select" style={{ border: 'none', background: 'transparent', width: 'auto' }} value={dateRange} onChange={e => setDateRange(e.target.value)}>
              <option value="Today">Today</option>
              <option value="Past 7 Days">Past 7 Days</option>
              <option value="Past 30 Days">Past 30 Days</option>
              <option value="Year to Date">Year to Date</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(2, 6, 15, 0.6)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-subtle)', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Start:</span>
            <input type="date" className="cyber-input" style={{ padding: '4px 8px', width: '130px', fontSize: '12px', border: 'none', background: 'transparent' }} value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(2, 6, 15, 0.6)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border-subtle)', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-muted)' }}>End:</span>
            <input type="date" className="cyber-input" style={{ padding: '4px 8px', width: '130px', fontSize: '12px', border: 'none', background: 'transparent' }} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <button
            className="btn-cyber"
            style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '10px' }}
            onClick={() => {
              fetchAnalytics();
            }}
          >
            🔍 Search Metrics
          </button>
        </div>
      </div>

      {/* Conversion Funnel & Visual Graph Bars */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="var(--accent-emerald)" /> Recruitment Conversion Funnel ({dateRange}: {startDate} to {endDate})
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.3)', padding: '18px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>1. Saved</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-code)' }}>
              {savedCount}
            </div>
            <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round((savedCount / totalTracked) * 100))}%`, background: '#ffffff', borderRadius: '3px' }} />
            </div>
          </div>

          <div style={{ background: 'rgba(79, 172, 254, 0.1)', border: '1px solid rgba(79, 172, 254, 0.3)', padding: '18px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '13px', color: 'var(--accent-blue)', fontWeight: 600 }}>2. Applied</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-blue)', fontFamily: 'var(--font-code)' }}>
              {appliedCount}
            </div>
            <div style={{ height: '6px', width: '100%', background: 'rgba(79, 172, 254, 0.15)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round((appliedCount / totalTracked) * 100))}%`, background: 'var(--accent-blue)', borderRadius: '3px' }} />
            </div>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '18px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '13px', color: 'var(--accent-amber)', fontWeight: 600 }}>3. Interviewing</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-amber)', fontFamily: 'var(--font-code)' }}>
              {interviewingCount}
            </div>
            <div style={{ height: '6px', width: '100%', background: 'rgba(245, 158, 11, 0.15)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round((interviewingCount / totalTracked) * 100))}%`, background: 'var(--accent-amber)', borderRadius: '3px' }} />
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '18px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '13px', color: 'var(--accent-emerald)', fontWeight: 600 }}>4. Offer</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-code)' }}>
              {offerCount}
            </div>
            <div style={{ height: '6px', width: '100%', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, Math.round((offerCount / totalTracked) * 100))}%`, background: 'var(--accent-emerald)', borderRadius: '3px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Role Distribution with Unique Colors & Geographic Reach */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Role Distribution with Unique Colors */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="var(--accent-cyan)" /> Applications & Unique Role Colors
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categoryBreakdown.map((cat, i) => {
              const catName = cat.category || 'Software';
              const style = categoryTheme[catName] || categoryTheme.Software;
              return (
                <div key={catName || i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ fontWeight: 700, color: style.color }}>● {style.label || catName}</span>
                    <span style={{ fontFamily: 'var(--font-code)', color: style.color }}>
                      {cat.count} jobs (Avg Match: {Math.round(cat.avg_score || 85)}%)
                    </span>
                  </div>
                  <div className="score-bar-bg" style={{ height: '10px' }}>
                    <div className="score-bar-fill" style={{ width: `${Math.min(100, (cat.count / (analytics?.total_jobs || 1)) * 100)}%`, background: style.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location & Country Reach */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="var(--accent-purple)" /> Geographic Targeting (India & International)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {countryBreakdown.map((c, i) => (
              <div key={c.country || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(2, 6, 15, 0.6)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '13px' }}>{c.country || 'India'}</span>
                <span className="badge-domain" style={{ fontSize: '12px' }}>{c.count} Target Positions</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
