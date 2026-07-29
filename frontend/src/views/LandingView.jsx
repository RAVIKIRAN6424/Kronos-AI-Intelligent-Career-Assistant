import React from 'react';
import { Sparkles, Shield, Rocket, ArrowRight, Sun, Moon, Info, Mail, UserPlus, LogIn, LayoutDashboard, User, LogOut } from 'lucide-react';
import { KronosAppLogo } from '../components/KronosAppLogo';

export const LandingView = ({ onOpenAuthModal, activeTheme, setTheme, currentUser, onNavigate, onLogout }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '20px 0 60px' }}>
      {/* Hero Section */}
      <div className="glass-panel hero-card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <KronosAppLogo size={64} />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(0, 242, 254, 0.12)', border: '1px solid rgba(0, 242, 254, 0.3)', borderRadius: '30px', color: 'var(--accent-cyan)', fontSize: '13px', fontFamily: 'var(--font-code)' }}>
            <Sparkles size={15} /> KRONOS AI — Autonomous Personal Career Assistant
          </div>

          <h1 className="hero-title">
            Automate Your Job Search with Intelligent AI Precision
          </h1>

          <p className="hero-subtitle">
            Kronos AI continuously scans live connected portals, matches your role-specific resumes, optimizes ATS scores truthfully, and automates high-converting recruiter outreach.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {currentUser ? (
              <>
                <button className="btn-cyber" style={{ padding: '14px 28px', fontSize: '15px' }} onClick={() => onNavigate && onNavigate('dashboard')}>
                  <LayoutDashboard size={18} /> Launch Dashboard <ArrowRight size={18} />
                </button>
                <button className="btn-cyber" style={{ background: 'rgba(157, 78, 221, 0.15)', borderColor: 'rgba(157, 78, 221, 0.4)', color: '#d8b4fe', padding: '14px 28px', fontSize: '15px' }} onClick={() => onNavigate && onNavigate('profile')}>
                  <User size={18} /> Candidate Profile
                </button>
                <button className="btn-cyber-outline" style={{ padding: '14px 20px', fontSize: '15px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }} onClick={onLogout}>
                  <LogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <button className="btn-cyber" style={{ padding: '14px 28px', fontSize: '15px' }} onClick={() => onOpenAuthModal('register')}>
                  <UserPlus size={18} /> Create Account <ArrowRight size={18} />
                </button>
                <button className="btn-cyber" style={{ background: 'rgba(157, 78, 221, 0.15)', borderColor: 'rgba(157, 78, 221, 0.4)', color: '#d8b4fe', padding: '14px 28px', fontSize: '15px' }} onClick={() => onOpenAuthModal('login')}>
                  <LogIn size={18} /> Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <Rocket size={22} color="var(--accent-cyan)" />
          </div>
          <h3 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>100% Automated Workflow</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
            Set daily start and stop times. Kronos checks role matches, verifies posting freshness (&lt;7 days), avoids duplicates, and queues applications automatically.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <Sparkles size={22} color="#c084fc" />
          </div>
          <h3 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Multi-Role AI Resume Optimizer</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
            Create role-specific resumes for Java, AWS, DevOps, Mechanical, Data Science, and Web roles with truthful ATS Keyword Scoring.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
            <Shield size={22} color="var(--accent-emerald)" />
          </div>
          <h3 style={{ color: 'var(--text)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Connected Job Portals</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5 }}>
            Connect LinkedIn, Indeed, Glassdoor, Google Jobs, Naukri, and Monster. Enable or disable individual portals with 1-click toggles.
          </p>
        </div>
      </div>
    </div>
  );
};
