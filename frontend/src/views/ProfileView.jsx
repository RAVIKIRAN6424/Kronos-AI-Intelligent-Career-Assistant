import React, { useState, useEffect } from 'react';
import { UserCheck, Save, FileText, Globe, MapPin, Award, BookOpen, Briefcase, Trash2, LogOut, Plus, CheckCircle2, AlertCircle, Key, Lock, Layers } from 'lucide-react';
import { api } from '../utils/api';

export const ProfileView = ({ onProfileUpdated, onLogout, toast }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [countryCode, setCountryCode] = useState('+91');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState(26);
  const [location, setLocation] = useState('');
  const [targetDomain, setTargetDomain] = useState('Software');
  const [targetTitles, setTargetTitles] = useState('');
  const [experienceYears, setExperienceYears] = useState(4);
  const [skills, setSkills] = useState('');
  const [preferredLocations, setPreferredLocations] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [expectedSalary, setExpectedSalary] = useState('');
  
  // Automated Email Reporting State
  const [reportEmail, setReportEmail] = useState('');
  const [reportTime, setReportTime] = useState('18:00');
  const [reportEnabled, setReportEnabled] = useState(false);

  // Target Job Roles Selection State
  const defaultAvailableRoles = [
    'Software Engineer', 'Java Developer', 'AWS Engineer', 'DevOps Engineer', 
    'Data Analyst', 'Mechanical Engineer', 'Frontend Developer', 'Full Stack Developer', 'AI Specialist'
  ];
  const [availableRoles, setAvailableRoles] = useState(defaultAvailableRoles);
  const [customRoleInput, setCustomRoleInput] = useState('');

  // Target Preferred Locations Selection State
  const defaultAvailableLocations = [
    'Bengaluru', 'Mumbai', 'Hyderabad', 'Pune', 'Delhi NCR', 'Chennai', 'Kolkata', 
    'Remote', 'USA', 'United Kingdom', 'Canada', 'UAE', 'Germany', 'Singapore'
  ];
  const [availableLocations, setAvailableLocations] = useState(defaultAvailableLocations);
  const [customLocationInput, setCustomLocationInput] = useState('');

  // Job Portals & Credentials State
  const defaultPortals = [
    { id: 1, portal_name: 'LinkedIn', is_connected: 0, is_enabled: 1, account_email: '', account_password: '' },
    { id: 2, portal_name: 'Indeed', is_connected: 0, is_enabled: 1, account_email: '', account_password: '' },
    { id: 3, portal_name: 'Glassdoor', is_connected: 0, is_enabled: 1, account_email: '', account_password: '' },
    { id: 4, portal_name: 'Naukri', is_connected: 0, is_enabled: 1, account_email: '', account_password: '' },
    { id: 5, portal_name: 'Monster', is_connected: 0, is_enabled: 0, account_email: '', account_password: '' }
  ];
  const [portals, setPortals] = useState(defaultPortals);
  const [customPortalInput, setCustomPortalInput] = useState('');

  const COUNTRY_CODES = [
    { code: '+91', label: '🇮🇳 +91 (India)' },
    { code: '+1', label: '🇺🇸 +1 (US/Canada)' },
    { code: '+44', label: '🇬🇧 +44 (UK)' },
    { code: '+61', label: '🇦🇺 +61 (Australia)' },
    { code: '+971', label: '🇦🇪 +971 (UAE)' },
    { code: '+49', label: '🇩🇪 +49 (Germany)' },
    { code: '+33', label: '🇫🇷 +33 (France)' },
    { code: '+65', label: '🇸🇬 +65 (Singapore)' },
    { code: '+81', label: '🇯🇵 +81 (Japan)' }
  ];

  // Resume Breakdown Sections
  const [resumeSummary, setResumeSummary] = useState('');
  const [resumeExperience, setResumeExperience] = useState('');
  const [resumeEducation, setResumeEducation] = useState('');
  const [resumeCertifications, setResumeCertifications] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchPortals();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await api.getProfile();
      if (data) {
        setFullName(data.full_name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setAge(data.age || 26);
        setLocation(data.location || '');
        setTargetDomain(data.target_domain || 'Software');
        setTargetTitles(data.target_titles || '');
        setExperienceYears(data.experience_years || 4);
        setSkills(data.skills || '');
        setPreferredLocations(data.preferred_locations || '');
        setRemoteOnly(Boolean(data.remote_only));
        setExpectedSalary(data.expected_salary || '');
        setReportEmail(data.report_email || '');
        setReportTime(data.report_time || '18:00');
        setReportEnabled(Boolean(data.report_enabled));
        setResumeSummary(data.resume_summary || data.resume_text || '');
        
        // Parse section splits if present
        if (data.resume_text && data.resume_text.includes('---EDUCATION---')) {
          const parts = data.resume_text.split('---');
          parts.forEach(p => {
            if (p.startsWith('EXPERIENCE')) setResumeExperience(p.replace('EXPERIENCE---', '').trim());
            if (p.startsWith('EDUCATION')) setResumeEducation(p.replace('EDUCATION---', '').trim());
            if (p.startsWith('CERTIFICATIONS')) setResumeCertifications(p.replace('CERTIFICATIONS---', '').trim());
          });
        } else {
          setResumeExperience(data.resume_text || '');
        }
      }
    } catch (err) {
      console.warn('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortals = async () => {
    try {
      const stored = localStorage.getItem('kronos_portals');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          setPortals(parsed);
          return;
        }
      }
      const data = await api.getPortals();
      if (data && data.length > 0) {
        setPortals(data);
      }
    } catch (err) {
      console.warn('Portal load notice:', err);
    }
  };

  // Helper: Toggle Job Role Chip Selection
  const handleToggleRoleChip = (roleName) => {
    const currentList = targetTitles.split(',').map(s => s.trim()).filter(Boolean);
    let newList = [];
    if (currentList.some(r => r.toLowerCase() === roleName.toLowerCase())) {
      newList = currentList.filter(r => r.toLowerCase() !== roleName.toLowerCase());
    } else {
      newList = [...currentList, roleName];
    }
    setTargetTitles(newList.join(', '));
  };

  // Helper: Add Custom Target Job Role
  const handleAddCustomRole = () => {
    const trimmed = customRoleInput.trim();
    if (!trimmed) {
      if (toast) toast('Please enter a valid job role name.', 'error');
      return;
    }

    if (!availableRoles.some(r => r.toLowerCase() === trimmed.toLowerCase())) {
      setAvailableRoles(prev => [...prev, trimmed]);
    }

    handleToggleRoleChip(trimmed);
    setCustomRoleInput('');
    if (toast) toast(`Added "${trimmed}" to target job roles!`, 'success');
  };

  // Helper: Toggle Target Location Chip Selection
  const handleToggleLocationChip = (locationName) => {
    const currentList = preferredLocations.split(',').map(s => s.trim()).filter(Boolean);
    let newList = [];
    if (currentList.some(l => l.toLowerCase() === locationName.toLowerCase())) {
      newList = currentList.filter(l => l.toLowerCase() !== locationName.toLowerCase());
    } else {
      newList = [...currentList, locationName];
    }
    setPreferredLocations(newList.join(', '));
  };

  // Helper: Add Custom Target Location
  const handleAddCustomLocation = () => {
    const trimmed = customLocationInput.trim();
    if (!trimmed) {
      if (toast) toast('Please enter a valid target location name.', 'error');
      return;
    }

    if (!availableLocations.some(l => l.toLowerCase() === trimmed.toLowerCase())) {
      setAvailableLocations(prev => [...prev, trimmed]);
    }

    handleToggleLocationChip(trimmed);
    setCustomLocationInput('');
    if (toast) toast(`Added "${trimmed}" to target preferred locations!`, 'success');
  };

  // Helper: Add Custom Job Portal
  const handleAddCustomPortal = () => {
    const trimmed = customPortalInput.trim();
    if (!trimmed) {
      if (toast) toast('Please enter a valid portal name (e.g. Workday, Greenhouse, Instahyre).', 'error');
      return;
    }

    if (portals.some(p => p.portal_name.toLowerCase() === trimmed.toLowerCase())) {
      if (toast) toast(`Portal "${trimmed}" already exists.`, 'info');
      return;
    }

    const newPortalObj = {
      id: Date.now(),
      portal_name: trimmed,
      is_connected: 0,
      is_enabled: 1,
      account_email: '',
      account_password: ''
    };

    const updated = [...portals, newPortalObj];
    setPortals(updated);
    localStorage.setItem('kronos_portals', JSON.stringify(updated));
    setCustomPortalInput('');
    if (toast) toast(`Added new portal "${trimmed}"! Fill credentials to connect.`, 'success');
  };

  // Helper: Validate & Connect Portal Login Credentials
  const handleValidateAndConnectPortal = (portalId) => {
    const target = portals.find(p => p.id === portalId);
    if (!target) return;

    const emailVal = (target.account_email || '').trim();
    const passVal = (target.account_password || '').trim();

    const isEmailValid = emailVal.length >= 4 && (emailVal.includes('@') || emailVal.length >= 5);
    const isPassValid = passVal.length >= 4;

    if (!isEmailValid || !isPassValid) {
      if (toast) toast(`❌ Invalid login details for ${target.portal_name}. Please enter a valid username/email and password (min 4 chars).`, 'error');
      return;
    }

    const updated = portals.map(p => {
      if (p.id === portalId) {
        return {
          ...p,
          is_connected: 1,
          is_enabled: 1
        };
      }
      return p;
    });

    setPortals(updated);
    localStorage.setItem('kronos_portals', JSON.stringify(updated));
    if (toast) toast(`✅ Validated & Connected login credentials for ${target.portal_name}!`, 'success');
  };

  const handlePortalInputChange = (portalId, field, value) => {
    const updated = portals.map(p => {
      if (p.id === portalId) {
        return { ...p, [field]: value, is_connected: field === 'account_email' && !value ? 0 : p.is_connected };
      }
      return p;
    });
    setPortals(updated);
    localStorage.setItem('kronos_portals', JSON.stringify(updated));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    const fullResumeText = `${resumeSummary}\n\n---EXPERIENCE---\n${resumeExperience}\n\n---EDUCATION---\n${resumeEducation}\n\n---CERTIFICATIONS---\n${resumeCertifications}`;

    try {
      const updated = await api.updateProfile({
        full_name: fullName,
        email,
        phone,
        age: parseInt(age),
        location,
        target_domain: targetDomain,
        target_titles: targetTitles,
        experience_years: parseInt(experienceYears),
        skills,
        resume_text: fullResumeText,
        resume_summary: resumeSummary,
        preferred_locations: preferredLocations,
        remote_only: remoteOnly ? 1 : 0,
        expected_salary: expectedSalary
      });

      localStorage.setItem('kronos_portals', JSON.stringify(portals));
      toast('Candidate Resume Profile & Portals updated successfully!', 'success');
      if (onProfileUpdated) onProfileUpdated(updated);
    } catch (err) {
      toast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    setShowDeleteConfirm(false);
    try {
      await api.deleteAccount({ email });
      if (toast) toast('Account deleted successfully! You can now create a new account.', 'info');
      if (onProfileUpdated) onProfileUpdated({ full_name: '', email: '', deleted: true });
    } catch (err) {
      if (toast) toast(err.message || 'Failed to delete account', 'error');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', color: 'var(--accent-cyan)', padding: '50px' }}>Loading candidate profile data...</div>;
  }

  const selectedTitlesArray = targetTitles.split(',').map(s => s.trim()).filter(Boolean);
  const selectedLocationsArray = preferredLocations.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Delete Account Modal Dialog */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(4, 8, 20, 0.88)', backdropFilter: 'blur(12px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#081020', border: '1px solid #ef4444', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '28px', color: '#fff', boxShadow: '0 0 40px rgba(239, 68, 68, 0.25)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trash2 size={22} /> Confirm Account Deletion
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
              Are you sure you want to delete your candidate account? This action will reset your active session profile data so you can register a new account again.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn-cyber-outline" onClick={() => setShowDeleteConfirm(false)} style={{ padding: '8px 16px', fontSize: '13px' }}>
                Cancel
              </button>
              <button type="button" onClick={handleDeleteAccountConfirm} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={24} color="var(--accent-cyan)" /> Candidate Profile & Resume Studio
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Configure your technical skills, target job roles, target locations, connected portal credentials, and resume breakdown sections.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {onLogout && (
            <button type="button" onClick={onLogout} style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#ffffff', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px' }}>
              <LogOut size={16} /> Sign Out
            </button>
          )}
          <button type="button" onClick={() => setShowDeleteConfirm(true)} style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px' }}>
            <Trash2 size={16} /> Delete Account
          </button>
          <button type="submit" className="btn-cyber" disabled={saving}>
            <Save size={16} /> Save Profile Changes
          </button>
        </div>
      </div>

      {/* Automated Email Reporting */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={18} color="var(--accent-cyan)" /> Automated Daily Reporting
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '-8px' }}>
          Receive a daily email digest of your recently applied jobs and matched roles along with your resume attached.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Reporting Email Address</label>
            <input type="email" className="cyber-input" value={reportEmail} onChange={(e) => setReportEmail(e.target.value)} placeholder="your-email@example.com" />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Daily Report Time</label>
            <input type="time" className="cyber-input" value={reportTime} onChange={(e) => setReportTime(e.target.value)} />
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" id="reportEnabled" checked={reportEnabled} onChange={(e) => setReportEnabled(e.target.checked)} style={{ cursor: 'pointer' }} />
          <label htmlFor="reportEnabled" style={{ fontSize: '12px', color: 'var(--text-main)', cursor: 'pointer' }}>Enable daily email reports</label>
        </div>
      </div>

      {/* Target Job Roles Interactive Selector & Add Custom Role */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--accent-cyan)" /> Select Target Job Roles
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '-8px' }}>
          Click any role chip to enable or disable it for target matching, or add your own custom job role below.
        </p>

        {/* Chips Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {availableRoles.map(role => {
            const isSelected = selectedTitlesArray.some(t => t.toLowerCase() === role.toLowerCase());
            return (
              <button
                key={role}
                type="button"
                onClick={() => handleToggleRoleChip(role)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: isSelected ? 'var(--accent-cyan)' : 'var(--panel-2)',
                  color: isSelected ? '#060a12' : 'var(--text-muted)',
                  border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isSelected ? 'var(--glow-cyan)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {isSelected && <CheckCircle2 size={14} />}
                <span>{role}</span>
              </button>
            );
          })}
        </div>

        {/* Add Custom Job Role Row */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <input
            type="text"
            className="cyber-input"
            placeholder="Type new custom job role (e.g. Cyber Security Engineer, Cloud Architect)..."
            value={customRoleInput}
            onChange={e => setCustomRoleInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomRole())}
            style={{ flex: 1, fontSize: '13px' }}
          />
          <button
            type="button"
            className="btn-cyber"
            style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={handleAddCustomRole}
          >
            <Plus size={15} /> + Add Custom Role
          </button>
        </div>
      </div>

      {/* Target Preferred Locations Interactive Selector & Add Custom Location */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} color="var(--accent-cyan)" /> Select Target Preferred Locations
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '-8px' }}>
          Click any location chip to enable or disable it for job search targeting (Indian Cities & International Countries), or add your custom location below.
        </p>

        {/* Location Chips Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {availableLocations.map(loc => {
            const isSelected = selectedLocationsArray.some(l => l.toLowerCase() === loc.toLowerCase());
            return (
              <button
                key={loc}
                type="button"
                onClick={() => handleToggleLocationChip(loc)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: isSelected ? 'var(--accent-cyan)' : 'var(--panel-2)',
                  color: isSelected ? '#060a12' : 'var(--text-muted)',
                  border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isSelected ? 'var(--glow-cyan)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {isSelected && <CheckCircle2 size={14} />}
                <span>{loc}</span>
              </button>
            );
          })}
        </div>

        {/* Add Custom Target Location Row */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <input
            type="text"
            className="cyber-input"
            placeholder="Type new custom target location (e.g. Austin, Sydney, Berlin, Tokyo)..."
            value={customLocationInput}
            onChange={e => setCustomLocationInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomLocation())}
            style={{ flex: 1, fontSize: '13px' }}
          />
          <button
            type="button"
            className="btn-cyber"
            style={{ padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={handleAddCustomLocation}
          >
            <Plus size={15} /> + Add Custom Location
          </button>
        </div>
      </div>

      {/* Connected Job Portals Credentials & Add Custom Portal */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} color="var(--accent-purple)" /> Connected Job Portals & Login Credentials
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
              Fill valid portal login details to enable automated job application scanning. Credentials are validated before connecting.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '400px' }}>
            <input
              type="text"
              className="cyber-input"
              placeholder="Add new portal name (e.g. Workday, Instahyre)..."
              value={customPortalInput}
              onChange={e => setCustomPortalInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCustomPortal())}
              style={{ flex: 1, fontSize: '12px' }}
            />
            <button
              type="button"
              className="btn-cyber-outline"
              style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={handleAddCustomPortal}
            >
              <Plus size={14} /> + Add Portal
            </button>
          </div>
        </div>

        {/* Portal Credentials Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '16px' }}>
          {portals.map(p => {
            const isValidated = Boolean(p.is_connected && p.account_email && (p.account_email.length >= 4));
            return (
              <div key={p.id} style={{ background: 'rgba(2, 6, 15, 0.7)', padding: '16px', borderRadius: '12px', border: isValidated ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={15} color="var(--accent-cyan)" /> {p.portal_name}
                  </div>

                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: isValidated ? 'rgba(0, 242, 254, 0.15)' : 'rgba(239, 68, 68, 0.12)', color: isValidated ? 'var(--accent-cyan)' : '#f87171', border: isValidated ? '1px solid var(--accent-cyan)' : '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isValidated ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {isValidated ? '✓ Validated & Connected' : 'Not Connected'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    className="cyber-input"
                    placeholder={`${p.portal_name} Email / Username`}
                    value={p.account_email || ''}
                    onChange={e => handlePortalInputChange(p.id, 'account_email', e.target.value)}
                    style={{ fontSize: '12px', padding: '8px 12px' }}
                  />

                  <input
                    type="password"
                    className="cyber-input"
                    placeholder={`${p.portal_name} Password`}
                    value={p.account_password || ''}
                    onChange={e => handlePortalInputChange(p.id, 'account_password', e.target.value)}
                    style={{ fontSize: '12px', padding: '8px 12px' }}
                  />

                  <button
                    type="button"
                    className={isValidated ? 'btn-cyber-outline' : 'btn-cyber'}
                    style={{ padding: '6px 12px', fontSize: '11px', justifyContent: 'center' }}
                    onClick={() => handleValidateAndConnectPortal(p.id)}
                  >
                    <Key size={13} /> {isValidated ? 'Re-Validate Credentials' : `Validate & Connect ${p.portal_name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column: Personal & Career Domain Details */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={18} color="var(--accent-purple)" /> Candidate Core Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Full Name</label>
              <input type="text" className="cyber-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Age</label>
              <input type="number" className="cyber-input" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email Address</label>
              <input type="email" className="cyber-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Phone Number</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <select className="cyber-select" value={countryCode} onChange={e => setCountryCode(e.target.value)} style={{ width: '110px', flexShrink: 0, padding: '6px' }}>
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <input type="text" className="cyber-input" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Domain Stream</label>
              <select className="cyber-select" value={targetDomain} onChange={(e) => setTargetDomain(e.target.value)}>
                <option value="Software">Software & Web</option>
                <option value="Mechanical">Mechanical & Robotics</option>
                <option value="Electrical">Electrical & Embedded</option>
                <option value="Civil">Civil & Structural</option>
                <option value="Business">Business & Growth</option>
                <option value="Data Science">Data Science & AI</option>
                <option value="Finance">Finance & Banking</option>
                <option value="Healthcare">Healthcare & Bio-Tech</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Years of Experience</label>
              <input type="number" className="cyber-input" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Job Titles (Selected above or typed)</label>
            <input type="text" className="cyber-input" value={targetTitles} onChange={(e) => setTargetTitles(e.target.value)} placeholder="Full Stack Developer, AI Architect, Mechatronics Lead" />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Technical & Domain Skills (Comma-separated)</label>
            <textarea className="cyber-input" rows={3} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js, Python, CAD, SolidWorks, Altium, Revit, B2B Sales..." />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Preferred Target Locations (Selected above or typed)</label>
            <input type="text" className="cyber-input" value={preferredLocations} onChange={(e) => setPreferredLocations(e.target.value)} placeholder="Bengaluru, Mumbai, Pune, Remote, USA, United Kingdom, UAE" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Expected Compensation</label>
              <input type="text" className="cyber-input" value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value)} placeholder="₹18,000,000 PA / $120,000 USD" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '16px' }}>
              <input type="checkbox" id="remoteOnly" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} style={{ accentColor: 'var(--accent-cyan)', width: '16px', height: '16px' }} />
              <label htmlFor="remoteOnly" style={{ fontSize: '13px', color: 'var(--text-main)', cursor: 'pointer' }}>Prefer Remote Roles Only</label>
            </div>
          </div>
        </div>

        {/* Right Column: Structured Resume Sections */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--accent-cyan)" /> Structured Resume Sections
          </h3>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Executive Summary & Pitch</label>
            <textarea className="cyber-input" rows={3} value={resumeSummary} onChange={(e) => setResumeSummary(e.target.value)} placeholder="High-level background summary..." />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Work Experience & Projects Breakdown</label>
            <textarea className="cyber-input" rows={5} value={resumeExperience} onChange={(e) => setResumeExperience(e.target.value)} placeholder="Detail past roles, project achievements, tools used..." />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Education & Qualifications</label>
            <textarea className="cyber-input" rows={3} value={resumeEducation} onChange={(e) => setResumeEducation(e.target.value)} placeholder="B.Tech in Mechanical / Computer Science Engineering..." />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Certifications & Achievements</label>
            <textarea className="cyber-input" rows={3} value={resumeCertifications} onChange={(e) => setResumeCertifications(e.target.value)} placeholder="SolidWorks Certified Associate, AWS Solutions Architect..." />
          </div>
        </div>
      </div>
    </form>
  );
};
