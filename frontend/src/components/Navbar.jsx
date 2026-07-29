import React from 'react';
import {
  LayoutDashboard, Briefcase, FileText, Sliders, Globe,
  BarChart3, UserCheck, MessageSquare, Zap, Settings, Sparkles
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, activeTheme, setTheme, currentUser, backendOnline }) => {

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
  };

  const themes = [
    { id: 'professional-dark', name: '🌙 Professional Dark', color: '#1E293B' },
    { id: 'corporate-light', name: '☀️ Corporate Light', color: '#F3F4F6' },
    { id: 'slate-gray', name: '🪨 Slate Gray', color: '#27272A' },
    { id: 'navy-blue', name: '🌊 Navy Blue', color: '#002B4D' },
    { id: 'brass-console', name: '⚙️ Brass Console', color: '#D4A657' }
  ];

  const navGroups = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'jobs', label: 'Job Matches', icon: Briefcase, badge: '12' },
        { id: 'search', label: 'Search Roles', icon: Sparkles },
        { id: 'resumes', label: 'Resumes', icon: FileText }
      ]
    },
    {
      label: 'Engine',
      items: [
        { id: 'automation', label: 'Automation', icon: Sliders },
        { id: 'portals', label: 'Portals', icon: Globe },
        { id: 'chatbot', label: 'AI Chatbot', icon: MessageSquare }
      ]
    },
    {
      label: 'Insight',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'profile', label: 'Profile', icon: UserCheck },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  return (
    <div className="sidebar">
      <div className="brand" onClick={() => handleNavClick('landing')}>
        <div className="brand-mark-svg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', marginRight: '4px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
            <rect x="3" y="3" width="94" height="94" rx="24" fill="#434185"/>
            <circle cx="50" cy="50" r="26" fill="#f3f4f6"/>
            <circle cx="50" cy="50" r="20" fill="#1a1c43"/>
            <path d="M 60,34 C 42,30 31,44 33,60 C 35,70 45,74 54,68" fill="none" stroke="#ffffff" strokeWidth="4.5"/>
            <circle cx="44" cy="53" r="3" fill="#38d9a9"/>
            <circle cx="56" cy="53" r="3" fill="#ff6b81"/>
            <circle cx="50" cy="62" r="3" fill="#fcc419"/>
          </svg>
        </div>
        <div className="brand-name">
          KRONOS
          <span>v4.2.0</span>
        </div>
      </div>
      
      {navGroups.map((group, idx) => (
        <div className="nav-group" key={idx}>
          <div className="nav-label">{group.label}</div>
          {group.items.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id} 
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <span className="ic" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} />
                </span>
                {item.label}
                {item.badge && <span className="badge">{item.badge}</span>}
              </button>
            );
          })}
        </div>
      ))}
      
      <div className="sidebar-foot">
        <div className="engine-card" style={{ marginBottom: '16px' }}>
          <div className={`row ${backendOnline ? 'running' : 'stopped'}`}>
            {backendOnline ? 'Engine Active' : 'Engine Offline'}
          </div>
          <p>Applying to 4 portals. 12 apps sent today.</p>
          <button onClick={() => handleNavClick('automation')}>Configure</button>
        </div>
        
        {/* Theme Picker Dropdown */}
        <div className="theme-picker" style={{ padding: '0 8px' }}>
          <label style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '4px', display: 'block', fontFamily: 'var(--font-code)' }}>SYSTEM THEME</label>
          <select 
            value={activeTheme} 
            onChange={(e) => setTheme(e.target.value)}
            style={{ 
              width: '100%', 
              background: 'var(--panel)', 
              color: 'var(--text-main)', 
              border: '1px solid var(--border-cyber)', 
              borderRadius: '6px', 
              padding: '6px', 
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {themes.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

