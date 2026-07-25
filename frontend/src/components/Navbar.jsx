import React, { useState, useEffect } from 'react';
import {
  Zap, LayoutDashboard, Briefcase, Search, Send, UserCheck, FileText, Globe, Sliders, MessageSquare,
  BarChart3, Settings, ShieldCheck, Palette, LogIn, User, Bot, Sparkles, Cpu
} from 'lucide-react';
import { KronosAppLogo } from './KronosAppLogo';

export const Navbar = ({ activeTab, setActiveTab, activeTheme, setTheme, currentUser, onOpenAuthModal, backendOnline }) => {
  const [clockTime, setClockTime] = useState(() => new Date().toLocaleString());

  useEffect(() => {
    const timer = setInterval(() => {
      setClockTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Zap },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Jobs CRM', icon: Briefcase },
    { id: 'portals', label: 'Portals', icon: Globe },
    { id: 'resumes', label: 'Resumes', icon: FileText },
    { id: 'automation', label: 'Automation', icon: Sliders },
    { id: 'search', label: 'Latest Jobs', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'chatbot', label: 'AI Chatbot', icon: MessageSquare },
    { id: 'profile', label: 'Profile Setup', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const themes = [
    { id: 'cyber-cyan', name: 'Cyber Cyan' },
    { id: 'neon-violet', name: 'Neon Violet' },
    { id: 'emerald-grid', name: 'Emerald Grid' },
    { id: 'solar-gold', name: 'Solar Gold' },
    { id: 'crimson-void', name: 'Crimson Void' },
    { id: 'cyber-synthwave', name: 'Cyber Synthwave' },
    { id: 'midnight-matrix', name: 'Midnight Matrix' },
    { id: 'hyper-crimson', name: 'Hyper Crimson' }
  ];

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '1px solid var(--border-cyber)',
      padding: '12px 24px',
      margin: '12px 16px 24px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      {/* Brand Logo with Unique Cyberpunk SVG Icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
        <KronosAppLogo size={46} />
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '20px',
            letterSpacing: '1px',
            background: 'linear-gradient(90deg, #ffffff, var(--accent-cyan))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            KRONOS AI <span style={{ fontSize: '13px', color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '2px' }}>CRM</span>
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-code)' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: backendOnline ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              display: 'inline-block'
            }} />
            <span>{backendOnline ? 'Engine Online' : 'Offline / Standalone'}</span>
            <span>•</span>
            <span style={{ color: 'var(--accent-cyan)' }}>{clockTime}</span>
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', padding: '4px 0' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                background: isActive ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                border: isActive ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                borderRadius: '8px',
                padding: '8px 14px',
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Right Utility Bar: Theme Swapper & User Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Theme Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(2, 6, 15, 0.6)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <Palette size={15} color="var(--accent-cyan)" />
          <select
            value={activeTheme}
            onChange={(e) => setTheme(e.target.value)}
            style={{
              background: 'transparent',
              color: 'var(--text-main)',
              border: 'none',
              fontSize: '12px',
              fontFamily: 'var(--font-heading)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {themes.map(t => (
              <option key={t.id} value={t.id} style={{ background: '#090d16', color: '#ffffff' }}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* User Auth Button */}
        {currentUser ? (
          <div
            onClick={onOpenAuthModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(157, 78, 221, 0.15)',
              border: '1px solid rgba(157, 78, 221, 0.4)',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <User size={16} color="var(--accent-purple)" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{currentUser.full_name || currentUser.email.split('@')[0]}</div>
              <div style={{ fontSize: '10px', color: 'var(--accent-cyan)' }}>{currentUser.target_domain || 'Software'}</div>
            </div>
          </div>
        ) : (
          <button className="btn-cyber" onClick={onOpenAuthModal}>
            <LogIn size={15} />
            Sign In / Register
          </button>
        )}
      </div>
    </header>
  );
};
