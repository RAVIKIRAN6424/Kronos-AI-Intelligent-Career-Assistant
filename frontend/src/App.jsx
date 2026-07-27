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
    <div style={{ minHeight: '100vh', position: 'relative', paddingBottom: '40px' }}>
      {/* 3D Interactive Robot & Particle Background Canvas */}
      <RobotBackground />

      {/* Top Navbar */}
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
      <main className="kronos-main-container" style={{ position: 'relative', zIndex: 1 }}>
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
      </main>

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
          onOpenOutreach={handleOpenOutreach}
          toast={addToast}
        />
      )}

      {/* Notification Toast Stack */}
      <NotificationToast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
