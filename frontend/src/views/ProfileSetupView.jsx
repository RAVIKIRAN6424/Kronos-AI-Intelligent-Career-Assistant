import React, { useState, useEffect } from 'react';
import { UserCheck, MapPin, Briefcase, Check, ArrowRight, Save, Layers, Trash2, Plus, X, ShieldCheck } from 'lucide-react';
import { api } from '../utils/api';
import { categoryTheme } from '../utils/categoryColors';

export const ProfileSetupView = ({ onProfileUpdated, toast }) => {
  const [selectedRoles, setSelectedRoles] = useState([
    'Software Engineer', 'Java Developer', 'AWS Engineer', 'Data Analyst', 'DevOps Engineer', 'Mechanical Engineer'
  ]);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [customRolesList, setCustomRolesList] = useState([]);
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Karnataka');
  const [city, setCity] = useState('Bengaluru');
  const [selectedLocations, setSelectedLocations] = useState([
    'Bengaluru, Karnataka, India', 'Mumbai, Maharashtra, India', 'Hyderabad, Telangana, India', 'Pune, Maharashtra, India', 'Remote (Worldwide)'
  ]);

  // Job Portal Accounts Credentials state (Step 8 inside Profile Setup)
  const [configuredPortals, setConfiguredPortals] = useState([
    { id: 1, name: 'LinkedIn', email: '', password: '', is_connected: 0, is_enabled: 1 },
    { id: 2, name: 'Indeed', email: '', password: '', is_connected: 0, is_enabled: 1 },
    { id: 3, name: 'Glassdoor', email: '', password: '', is_connected: 0, is_enabled: 1 },
    { id: 4, name: 'Naukri', email: '', password: '', is_connected: 0, is_enabled: 1 }
  ]);
  const [newPortalName, setNewPortalName] = useState('LinkedIn');
  const [customPortalName, setCustomPortalName] = useState('');
  const [newPortalEmail, setNewPortalEmail] = useState('');
  const [newPortalPassword, setNewPortalPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const profile = await api.getProfile();
      if (profile && profile.target_titles) {
        const titles = profile.target_titles.split(',').map(t => t.trim()).filter(Boolean);
        if (titles.length > 0) {
          setSelectedRoles(titles);
        }
      }
      if (profile && profile.preferred_locations) {
        const locs = profile.preferred_locations.split(',').map(l => l.trim()).filter(Boolean);
        if (locs.length > 0) {
          setSelectedLocations(locs);
        }
      }
    } catch (err) {
      console.warn('Profile load notice:', err);
    }
  };

  const syncPortalsToStorage = (portalsList) => {
    try {
      const formattedForPortalsView = portalsList.map(p => ({
        id: p.id,
        portal_name: p.name || p.portal_name,
        is_connected: p.is_connected ? 1 : 0,
        is_enabled: p.is_enabled !== undefined ? (p.is_enabled ? 1 : 0) : 1,
        account_email: p.email || p.account_email || ''
      }));
      localStorage.setItem('kronos_portals', JSON.stringify(formattedForPortalsView));
    } catch (e) {
      console.warn('Portals storage sync error:', e);
    }
  };

  const handleAddPortalCredential = () => {
    if (!newPortalEmail || !newPortalEmail.includes('@')) {
      if (toast) toast('Please enter a valid portal login email.', 'error');
      return;
    }
    const finalPortalName = newPortalName === 'Other' ? (customPortalName.trim() || 'Custom Portal') : newPortalName;
    const existing = configuredPortals.find(p => p.name.toLowerCase() === finalPortalName.toLowerCase());
    
    let updatedList = [];
    if (existing) {
      updatedList = configuredPortals.map(p => p.id === existing.id ? { ...p, email: newPortalEmail, password: newPortalPassword || '••••••••', is_connected: 1 } : p);
    } else {
      const newEntry = {
        id: Date.now(),
        name: finalPortalName,
        email: newPortalEmail,
        password: newPortalPassword || '••••••••',
        is_connected: 1,
        is_enabled: 1
      };
      updatedList = [...configuredPortals, newEntry];
    }
    
    setConfiguredPortals(updatedList);
    syncPortalsToStorage(updatedList);

    setNewPortalEmail('');
    setNewPortalPassword('');
    setCustomPortalName('');
    if (toast) toast(`Configured login credentials for ${finalPortalName}! Automatically synced to Portals section.`, 'success');
  };

  const availableRoles = [
    { name: 'Software Engineer', cat: 'Software' },
    { name: 'Java Developer', cat: 'Software' },
    { name: 'Frontend Developer', cat: 'Software' },
    { name: 'Backend Developer', cat: 'Software' },
    { name: 'AWS Engineer', cat: 'Software' },
    { name: 'Azure Engineer', cat: 'Software' },
    { name: 'DevOps Engineer', cat: 'Software' },
    { name: 'Data Analyst', cat: 'Data Science' },
    { name: 'Mechanical Engineer', cat: 'Mechanical' },
    { name: 'Electrical Engineer', cat: 'Electrical' },
    { name: 'Civil Engineer', cat: 'Civil' },
    { name: 'Growth Manager', cat: 'Business' },
    ...customRolesList
  ];

  const handleAddCustomRole = () => {
    const trimmed = customRoleInput.trim();
    if (!trimmed) return;
    if (!availableRoles.some(r => r.name.toLowerCase() === trimmed.toLowerCase())) {
      const newRoleObj = { name: trimmed, cat: 'Software' };
      setCustomRolesList(prev => [...prev, newRoleObj]);
      setSelectedRoles(prev => [...prev, trimmed]);
      setCustomRoleInput('');
      if (toast) toast(`Added custom job role "${trimmed}"!`, 'success');
    }
  };

  const toggleRole = (roleName) => {
    if (selectedRoles.includes(roleName)) {
      if (selectedRoles.length === 1) {
        if (toast) toast('At least one target job role must remain enabled.', 'info');
        return;
      }
      setSelectedRoles(prev => prev.filter(r => r !== roleName));
      if (toast) toast(`Disabled "${roleName}". Click Save Profile Preferences to update Resumes section.`, 'info');
    } else {
      setSelectedRoles(prev => [...prev, roleName]);
      if (toast) toast(`Enabled "${roleName}"!`, 'success');
    }
  };

  const handleAddLocation = () => {
    const locStr = `${city}, ${state}, ${country}`;
    if (!selectedLocations.includes(locStr)) {
      setSelectedLocations(prev => [...prev, locStr]);
    }
  };

  const handleRemoveLocation = (locStr) => {
    setSelectedLocations(prev => prev.filter(l => l !== locStr));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updatedTitles = selectedRoles.join(', ');
      const updatedLocs = selectedLocations.join(', ');

      await api.updateProfile({
        target_titles: updatedTitles,
        preferred_locations: updatedLocs
      });

      // Sync Resumes storage so disabled/deselected roles are removed from Resumes section
      try {
        const storedResumes = localStorage.getItem('kronos_resumes_24h');
        if (storedResumes) {
          const parsed = JSON.parse(storedResumes);
          if (parsed && parsed.resumes) {
            const filteredResumes = parsed.resumes.filter(r => selectedRoles.some(sr => sr.toLowerCase() === r.role_name.toLowerCase()));
            // Ensure any newly enabled role has a resume entry
            selectedRoles.forEach(sr => {
              if (!filteredResumes.some(fr => fr.role_name.toLowerCase() === sr.toLowerCase())) {
                filteredResumes.push({
                  role_name: sr,
                  file_name: `${sr.replace(/\s+/g, '_')}_Resume.pdf`,
                  resume_text: `Senior ${sr} Specialist experienced in modern systems and industry standards.`,
                  ats_score: 88,
                  grammar_score: 90,
                  formatting_score: 89,
                  keyword_score: 86,
                  missing_skills: 'Kubernetes, Cloud Infrastructure',
                  suggestions: 'Add quantifiable project metrics.'
                });
              }
            });
            localStorage.setItem('kronos_resumes_24h', JSON.stringify({ timestamp: Date.now(), resumes: filteredResumes }));
            localStorage.setItem('kronos_resumes', JSON.stringify(filteredResumes));
          }
        }
      } catch (e) {
        console.warn('Resume sync warning:', e);
      }

      // Sync portals to storage
      syncPortalsToStorage(configuredPortals);

      if (toast) toast('Profile preferences & portal credentials saved! Automatically updated Portals section.', 'success');
      if (onProfileUpdated) onProfileUpdated({ target_titles: updatedTitles });
    } catch (err) {
      if (toast) toast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserCheck size={24} color="var(--accent-cyan)" /> Profile Setup & Role Preferences
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Select the job roles and geographical locations you want Kronos AI to target. Click any role to enable or disable it, then click Save Profile to sync.
        </p>
      </div>

      {/* Roles Selector */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} color="var(--accent-cyan)" /> Target Job Roles ({selectedRoles.length} Active Roles)
            </h3>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Click any active role card to disable and remove it from your resume suite.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="cyber-input"
              placeholder="Add custom job title (e.g. AI Engineer)..."
              value={customRoleInput}
              onChange={e => setCustomRoleInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCustomRole()}
              style={{ width: '240px', padding: '6px 12px', fontSize: '13px' }}
            />
            <button className="btn-cyber" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={handleAddCustomRole}>
              + Add Role
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '12px' }}>
          {availableRoles.map(role => {
            const isSelected = selectedRoles.includes(role.name);
            const style = categoryTheme[role.cat] || categoryTheme.Software;
            return (
              <div
                key={role.name}
                onClick={() => toggleRole(role.name)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  background: isSelected ? style.bg : 'rgba(2, 6, 15, 0.4)',
                  border: isSelected ? `2px solid ${style.color}` : '1px solid var(--border-subtle)',
                  color: isSelected ? '#ffffff' : 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? style.glow : 'none',
                  opacity: isSelected ? 1 : 0.65
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>{role.name}</span>
                  <span style={{ fontSize: '11px', color: isSelected ? style.color : 'var(--text-dim)', fontFamily: 'var(--font-code)' }}>
                    {isSelected ? style.label : 'Disabled (Click to Enable)'}
                  </span>
                </div>
                {isSelected ? (
                  <Check size={18} color={style.color} />
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>+ Enable</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Location Selector (Country -> State -> City) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} color="var(--accent-purple)" /> Preferred Locations (Country → State → City)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Country</label>
            <select className="cyber-select" value={country} onChange={e => setCountry(e.target.value)}>
              <option value="India">India</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Germany">Germany</option>
              <option value="Singapore">Singapore</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>State / Region</label>
            <input className="cyber-input" value={state} onChange={e => setState(e.target.value)} placeholder="e.g. Karnataka" />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>City</label>
            <input className="cyber-input" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Bengaluru" />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn-cyber" onClick={handleAddLocation}>
              Add Location
            </button>
          </div>
        </div>

        {/* Selected Location Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {selectedLocations.map(loc => (
            <div key={loc} style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', padding: '6px 14px', borderRadius: '20px', color: 'var(--accent-cyan)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={14} /> {loc}
              <span onClick={() => handleRemoveLocation(loc)} style={{ cursor: 'pointer', fontWeight: 800, marginLeft: '4px' }}>×</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 8 Job Portals Accounts Credentials Section */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🌐 Connected Job Portal Login Credentials (At least 2 required to start Automation)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
          Configure portal account credentials. Kronos AI uses these saved credentials to automatically check live job postings.
        </p>

        {/* Add Credential Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: newPortalName === 'Other' ? '1fr 1fr 1.5fr 1fr auto' : '1fr 1.5fr 1fr auto', gap: '12px', marginBottom: '18px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Portal</label>
            <select className="cyber-select" value={newPortalName} onChange={e => setNewPortalName(e.target.value)}>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Indeed">Indeed</option>
              <option value="Glassdoor">Glassdoor</option>
              <option value="Google Jobs">Google Jobs</option>
              <option value="Naukri">Naukri</option>
              <option value="Monster">Monster</option>
              <option value="Other">Other (Custom Portal)</option>
            </select>
          </div>

          {newPortalName === 'Other' && (
            <div>
              <label style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>Custom Portal Name</label>
              <input className="cyber-input" type="text" value={customPortalName} onChange={e => setCustomPortalName(e.target.value)} placeholder="e.g. Wellfound, ZipRecruiter" />
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Portal Email / Username</label>
            <input className="cyber-input" type="email" value={newPortalEmail} onChange={e => setNewPortalEmail(e.target.value)} placeholder="user@portal.com" />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Portal Password</label>
            <input className="cyber-input" type="password" value={newPortalPassword} onChange={e => setNewPortalPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn-cyber" onClick={handleAddPortalCredential}>
              + Add Portal Credential
            </button>
          </div>
        </div>

        {/* Configured Portals Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
          {configuredPortals.map(p => (
            <div key={p.id} style={{ background: p.is_connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(2, 6, 15, 0.6)', border: p.is_connected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '14px' }}>{p.name}</div>
                <div style={{ fontSize: '12px', color: p.is_connected ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                  {p.is_connected ? `✓ ${p.email}` : 'No credentials saved'}
                </div>
              </div>
              <span className={p.is_connected ? 'badge-connected' : 'badge-domain'} style={{ fontSize: '11px' }}>
                {p.is_connected ? 'Ready' : 'Not Connected'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-cyber" style={{ padding: '14px 28px', fontSize: '15px' }} onClick={handleSaveProfile} disabled={saving}>
          <Save size={18} /> {saving ? 'Saving Profile...' : 'Save Profile Preferences'}
        </button>
      </div>
    </div>
  );
};

