import React, { useState, useEffect } from 'react';
import {
  Zap, LayoutDashboard, Briefcase, Search, Send, UserCheck, FileText, Globe, Sliders, MessageSquare,
  BarChart3, Settings, ShieldCheck, Palette, LogIn, User, Bot, Sparkles, Cpu, Menu, X
} from 'lucide-react';
import { KronosAppLogo } from './KronosAppLogo';

export const Navbar = ({ activeTab, setActiveTab, activeTheme, setTheme, currentUser, onOpenAuthModal, backendOnline }) => {
  const [clockTime, setClockTime] = useState(() => new Date().toLocaleString());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setClockTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false); // Auto-close hamburger menu on selection!
  };

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
    { id: 'cyber-cyan', name: '⚡ Cyber Cyan', color: '#00f2fe' },
    { id: 'neon-violet', name: '🔮 Neon Violet', color: '#d946ef' },
    { id: 'emerald-grid', name: '🌿 Emerald Grid', color: '#10b981' },
    { id: 'solar-gold', name: '☀️ Solar Gold', color: '#fbbf24' },
    { id: 'crimson-void', name: '🩸 Crimson Void', color: '#ff0055' },
    { id: 'cyber-synthwave', name: '🌆 Cyber Synthwave', color: '#ff007f' },
    { id: 'midnight-matrix', name: '💻 Midnight Matrix', color: '#00ff66' },
    { id: 'hyper-crimson', name: '🔥 Hyper Crimson', color: '#ff3300' }
  ];

  return (
    <header className="kronos-sidebar" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '24px 16px',
      gap: '24px'
    }}>
      {/* Brand Logo & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '0 8px' }} onClick={() => handleNavClick('dashboard')}>
        <KronosAppLogo size={36} />
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '18px',
            color: 'var(--text-main)',
            letterSpacing: '0.5px'
          }}>
            KRONOS
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: backendOnline ? 'var(--accent-emerald)' : 'var(--accent-amber)',
              display: 'inline-block'
            }} />
            <span>{backendOnline ? 'Online' : 'Offline'}</span>
          </p>
        </div>
      </div>

      {/* Hamburger Toggle Button (Mobile / Tablet Screens) */}
      <button
        type="button"
        className="hamburger-toggle-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle Navigation Menu"
        style={{
          position: 'absolute',
          right: '16px',
          top: '20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-cyber)',
          color: 'var(--text-main)',
          borderRadius: '8px',
          padding: '6px 10px',
          cursor: 'pointer',
          display: 'none', // Shown via CSS media query
          alignItems: 'center',
          gap: '6px'
        }}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop Navigation Tabs */}
      <nav className="desktop-nav" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                background: isActive ? 'var(--bg-card-hover)' : 'transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} color={isActive ? 'var(--text-main)' : 'var(--text-muted)'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Utilities at the bottom of the sidebar */}
      <div className="desktop-utils" style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-cyber)' }}>
        {/* User Auth Button */}
        {currentUser ? (
          <div
            onClick={() => handleNavClick('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-cyber)'
            }}
          >
            <div style={{ background: 'var(--accent-cyan)', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={14} color="#121212" />
            </div>
            <div style={{ textAlign: 'left', overflow: 'hidden' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUser.full_name || currentUser.email.split('@')[0]}
              </div>
            </div>
          </div>
        ) : (
          <button className="btn-cyber" onClick={onOpenAuthModal} style={{ width: '100%', justifyContent: 'center' }}>
            <LogIn size={15} />
            Sign In
          </button>
        )}
      </div>

      {/* Responsive Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-drawer"
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            maxHeight: '100vh',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            background: 'var(--bg-dark)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 99999
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
              KRONOS
            </span>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    background: isActive ? 'var(--bg-card-hover)' : 'transparent',
                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <Icon size={18} color={isActive ? 'var(--text-main)' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div style={{ borderTop: '1px solid var(--border-cyber)', paddingTop: '16px', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {!currentUser ? (
              <button className="btn-cyber" onClick={() => { setIsMobileMenuOpen(false); onOpenAuthModal(); }} style={{ width: '100%', justifyContent: 'center' }}>
                <LogIn size={15} /> Sign In / Register
              </button>
            ) : (
              <button className="btn-cyber-primary" onClick={() => handleNavClick('profile')} style={{ width: '100%', justifyContent: 'center' }}>
                <User size={15} /> My Profile
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

