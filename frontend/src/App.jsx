import React, { useState, useEffect } from 'react';
import { RobotBackground } from './components/RobotBackground';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { WelcomeModal } from './components/WelcomeModal';
import { NotificationToast } from './components/NotificationToast';
import { JobDetailModal } from './components/JobDetailModal';

import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { JobsCrmView } from './views/JobsCrmView';
import { ProfileSetupView } from './views/ProfileSetupView';
import { ProfileView } from './views/ProfileView';
import { ResumeSectionView } from './views/ResumeSectionView';
import { ConnectedPortalsView } from './views/ConnectedPortalsView';
import { AutomationSettingsView } from './views/AutomationSettingsView';
import { SearchView } from './views/SearchView';
import { AnalyticsView } from './views/AnalyticsView';
import { ChatbotView } from './views/ChatbotView';
import { SettingsView } from './views/SettingsView';

import { api } from './utils/api';

export function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('kronos_theme') || 'cyber-cyan';
  });
  
  // Auth & Welcome state
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [backendOnline, setBackendOnline] = useState(true);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kronos_user');
    setActiveTab('landing');
    addToast('Logged out successfully.', 'info');
  };

  // CRM Data
  const [jobs, setJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // Modals
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobForOutreach, setSelectedJobForOutreach] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getInitials = (name) => {
    if (!name) return 'GU';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync Theme attribute & persist in localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem('kronos_theme', activeTheme);
  }, [activeTheme]);

  // Initial Load
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const auth = await api.getAuthMe();
      if (auth?.user) {
        setCurrentUser(auth.user);
        setActiveTab('dashboard');
      }

      const jobsData = await api.getJobs();
      setJobs(jobsData || []);

      const analyticsData = await api.getAnalytics();
      setAnalytics(analyticsData || null);
      setBackendOnline(true);
    } catch (err) {
      console.warn('Backend connection notice:', err.message);
      setBackendOnline(false);
    }
  };

  const handleRefreshJobs = async () => {
    try {
      const updatedJobs = await api.getJobs();
      setJobs(updatedJobs || []);
      const updatedAnalytics = await api.getAnalytics();
      setAnalytics(updatedAnalytics || null);
    } catch (err) {
      console.warn('Failed to refresh jobs:', err);
    }
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="app">
      {/* 3D Interactive Robot & Particle Background Canvas */}
      <RobotBackground />

      {/* Sidebar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeTheme={activeTheme}
        setTheme={setActiveTheme}
        currentUser={currentUser}
        onOpenAuthModal={() => handleOpenAuth('login')}
        backendOnline={backendOnline}
      />

      {/* Main Content Area */}
      <div className="main">
        <div className="header">
          <div>
            <h1>{getGreeting()}, {currentUser?.full_name?.split(' ')[0] || 'Guest'}</h1>
            <div className="sub">Your career engine is running optimally today.</div>
          </div>
          <div className="header-right">
            <div className="search" onClick={() => setActiveTab('search')} style={{ cursor: 'pointer' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              Search roles, companies...
            </div>
            <div className="icon-btn" style={{ position: 'relative' }} onClick={() => setShowNotifications(!showNotifications)}>
              <div className="dot"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              {showNotifications && (
                <div style={{
                  position: 'absolute', top: '40px', right: '0', width: '300px', background: 'var(--bg-card)', 
                  border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px', zIndex: 1000, 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: 'var(--text-main)', textAlign: 'left', cursor: 'default'
                }} onClick={(e) => e.stopPropagation()}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>Notifications</h4>
                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--sage)', marginTop: '4px', flexShrink: 0 }}></div><div><b>Automated Apply</b><br/><span style={{ color: 'var(--text-muted)' }}>Successfully applied to Stripe.</span></div></div>
                    <div style={{ display: 'flex', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', marginTop: '4px', flexShrink: 0 }}></div><div><b>New Match</b><br/><span style={{ color: 'var(--text-muted)' }}>Found 5 new roles matching your profile.</span></div></div>
                  </div>
                </div>
              )}
            </div>
            <div className="avatar" onClick={() => setActiveTab('profile')}>
              {getInitials(currentUser?.full_name)}
            </div>
          </div>
        </div>

        <div className="content">
          {activeTab === 'landing' && (
            <LandingView
              onOpenAuthModal={handleOpenAuth}
              activeTheme={activeTheme}
              setTheme={setActiveTheme}
              currentUser={currentUser}
              onNavigate={setActiveTab}
              onLogout={handleLogout}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              jobs={currentUser ? jobs : []}
              analytics={currentUser ? analytics : null}
              onNavigate={setActiveTab}
              onSelectJob={setSelectedJob}
              toast={addToast}
              currentUser={currentUser}
              onOpenAuthModal={handleOpenAuth}
            />
          )}

          {activeTab === 'jobs' && (
            <JobsCrmView
              jobs={currentUser ? jobs : []}
              onSelectJob={setSelectedJob}
              onRefreshJobs={handleRefreshJobs}
              toast={addToast}
              currentUser={currentUser}
              onOpenAuthModal={() => handleOpenAuth('login')}
            />
          )}

          {activeTab === 'portals' && (
            <ConnectedPortalsView toast={addToast} />
          )}

          {activeTab === 'resumes' && (
            <ResumeSectionView toast={addToast} />
          )}

          {activeTab === 'automation' && (
            <AutomationSettingsView toast={addToast} />
          )}

          {activeTab === 'search' && (
            <SearchView toast={addToast} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              jobs={currentUser ? jobs : []}
              currentUser={currentUser}
              onOpenAuthModal={() => handleOpenAuth('login')}
            />
          )}

          {activeTab === 'chatbot' && (
            <ChatbotView toast={addToast} />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              onProfileUpdated={(updated) => {
                if (updated && updated.deleted) {
                  setCurrentUser(null);
                  localStorage.removeItem('kronos_user');
                  addToast('Account deleted successfully! You can now create a new account.', 'info');
                  handleOpenAuth('register');
                } else if (updated && updated.full_name) {
                  setCurrentUser(updated);
                }
              }}
              onLogout={handleLogout}
              toast={addToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView toast={addToast} />
          )}
        </div>
      </div>

      {/* Step 2 & 3 Auth & Onboarding Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          handleRefreshJobs();
          setIsWelcomeOpen(true); // Step 4 Welcome Animation
          setActiveTab('dashboard');
        }}
        toast={addToast}
      />

      {/* Step 4 Welcome Screen Modal */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        userName={currentUser?.full_name}
        onClose={() => {
          setIsWelcomeOpen(false);
          setActiveTab('profile'); // Step 5 Profile Setup
        }}
      />

      {/* Job Detail & Edit Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onJobUpdated={() => handleRefreshJobs()}
          onOpenOutreach={() => {}}
          toast={addToast}
        />
      )}

      {/* Notification Toast Stack */}
      <NotificationToast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
