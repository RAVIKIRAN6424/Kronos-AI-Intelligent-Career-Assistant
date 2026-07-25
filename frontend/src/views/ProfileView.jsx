import React, { useState, useEffect } from 'react';
import { UserCheck, Save, FileText, Globe, MapPin, Award, BookOpen, Briefcase } from 'lucide-react';
import { api } from '../utils/api';

export const ProfileView = ({ onProfileUpdated, toast }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // Resume Breakdown Sections
  const [resumeSummary, setResumeSummary] = useState('');
  const [resumeExperience, setResumeExperience] = useState('');
  const [resumeEducation, setResumeEducation] = useState('');
  const [resumeCertifications, setResumeCertifications] = useState('');

  useEffect(() => {
    fetchProfile();
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Combine structured resume sections into unified text
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

      toast('Candidate Resume Profile updated successfully!', 'success');
      if (onProfileUpdated) onProfileUpdated(updated);
    } catch (err) {
      toast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', color: 'var(--accent-cyan)', padding: '50px' }}>Loading candidate profile data...</div>;
  }

  return (
    <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={24} color="var(--accent-cyan)" /> Candidate Profile & Resume Studio
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Configure your technical skills, resume breakdown sections, and target locations (India & International).
          </p>
        </div>

        <button type="submit" className="btn-cyber" disabled={saving}>
          <Save size={16} /> Save Profile Changes
        </button>
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
              <input type="text" className="cyber-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Job Titles (Comma-separated)</label>
            <input type="text" className="cyber-input" value={targetTitles} onChange={(e) => setTargetTitles(e.target.value)} placeholder="Full Stack Developer, AI Architect, Mechatronics Lead" />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Technical & Domain Skills (Comma-separated)</label>
            <textarea className="cyber-input" rows={3} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js, Python, CAD, SolidWorks, Altium, Revit, B2B Sales..." />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Preferred Target Locations (India Cities & Global Countries)</label>
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
