import React, { useState } from 'react';
import { Search, Play, Terminal, CheckCircle2, Globe, Cpu, MapPin, Layers, Sparkles } from 'lucide-react';
import { api } from '../utils/api';

export const ScraperView = ({ onRefreshJobs, toast }) => {
  const [keywords, setKeywords] = useState('Senior Engineer');
  const [category, setCategory] = useState('Software');
  const [locationPreset, setLocationPreset] = useState('Bengaluru, India');
  const [customLocation, setCustomLocation] = useState('');
  const [country, setCountry] = useState('India');
  const [maxPages, setMaxPages] = useState('1');
  const [isScraping, setIsScraping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([
    '⚡ Playwright Headless Browser Scraper Pipeline Ready.',
    '🔍 Select keywords and target regions (India / International) to launch.'
  ]);

  const locationsIndia = [
    'Bengaluru, India',
    'Mumbai, India',
    'Pune, India',
    'Delhi NCR / Gurugram, India',
    'Hyderabad, India',
    'Chennai, India'
  ];

  const locationsGlobal = [
    'Remote (Worldwide)',
    'San Francisco, CA (USA)',
    'New York, NY (USA)',
    'London, United Kingdom',
    'Toronto, Canada',
    'Berlin, Germany',
    'Dubai, UAE',
    'Singapore'
  ];

  const addLog = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleStartScrape = async (e) => {
    e.preventDefault();
    const targetLoc = customLocation ? customLocation : locationPreset;

    setIsScraping(true);
    setProgress(15);
    setLogs([]);
    addLog(`🚀 Launching Playwright browser instance...`);
    addLog(`🔍 Target Search: "${keywords}" in "${targetLoc}" (Domain: ${category})`);

    try {
      setTimeout(() => {
        setProgress(40);
        addLog(`🌐 Navigating to live job search APIs and public boards...`);
      }, 800);

      setTimeout(() => {
        setProgress(70);
        addLog(`🧠 Analyzing job descriptions with Anthropic Claude AI score engine...`);
      }, 1800);

      const res = await api.triggerScraper({
        keywords,
        location: targetLoc,
        country: targetLoc.includes('India') || targetLoc.includes('Bengaluru') ? 'India' : country,
        category,
        max_pages: parseInt(maxPages)
      });

      setProgress(100);
      addLog(`✅ Playwright scraping finished! ${res.jobs?.length || 0} jobs processed & inserted into SQLite DB.`);
      toast(`Successfully scraped ${res.jobs?.length || 0} job listings!`, 'success');
      if (onRefreshJobs) onRefreshJobs();
    } catch (err) {
      addLog(`❌ Scraper Exception: ${err.message}`);
      toast(err.message || 'Scraper failed', 'error');
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={24} color="var(--accent-cyan)" /> Live Playwright Job Scraper Studio
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Autonomous web scraper using Playwright headless browser to fetch live postings across LinkedIn, Indeed, Glassdoor, and Google Jobs.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Scraper Configuration Form */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="var(--accent-purple)" /> Search & Location Filters
          </h3>

          <form onSubmit={handleStartScrape} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Job Search Keywords
              </label>
              <input
                type="text"
                className="cyber-input"
                placeholder="e.g., Senior Full Stack Engineer / Mechatronics Manager"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Industry Domain Stream
                </label>
                <select className="cyber-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Software">Software & Web</option>
                  <option value="Mechanical">Mechanical & Robotics</option>
                  <option value="Electrical">Electrical & Embedded</option>
                  <option value="Civil">Civil & Structural</option>
                  <option value="Business">Business & Operations</option>
                  <option value="Data Science">Data Science & AI</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Max Scrape Depth (Pages)
                </label>
                <select className="cyber-select" value={maxPages} onChange={(e) => setMaxPages(e.target.value)}>
                  <option value="1">1 Page (~10 jobs)</option>
                  <option value="2">2 Pages (~20 jobs)</option>
                  <option value="3">3 Pages (~30 jobs)</option>
                </select>
              </div>
            </div>

            {/* Location Selectors */}
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Target Location (India Metro Hubs)
              </label>
              <select
                className="cyber-select"
                value={locationPreset}
                onChange={(e) => {
                  setLocationPreset(e.target.value);
                  setCustomLocation('');
                  setCountry('India');
                }}
              >
                {locationsIndia.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Or Select Global Target Country
              </label>
              <select
                className="cyber-select"
                value={locationPreset}
                onChange={(e) => {
                  setLocationPreset(e.target.value);
                  setCustomLocation('');
                  setCountry('Global');
                }}
              >
                {locationsGlobal.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Or Enter Custom Location
              </label>
              <input
                type="text"
                className="cyber-input"
                placeholder="e.g., Hyderabad, Telangana or Austin, TX"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-cyber" disabled={isScraping} style={{ justifyContent: 'center', marginTop: '10px', padding: '14px' }}>
              {isScraping ? 'Scraping Live Web...' : <><Play size={16} /> Execute Playwright Job Scraper</>}
            </button>
          </form>
        </div>

        {/* Live Terminal & Logs */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={18} color="var(--accent-cyan)" /> Scraper Terminal Output
          </h3>

          {/* Progress Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Scraper Pipeline Status</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{progress}%</span>
            </div>
            <div className="score-bar-bg" style={{ height: '10px' }}>
              <div className="score-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Log Window */}
          <div style={{
            flex: 1,
            background: 'rgba(2, 6, 15, 0.95)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '16px',
            fontFamily: 'var(--font-code)',
            fontSize: '12px',
            color: '#34d399',
            overflowY: 'auto',
            maxHeight: '340px',
            lineHeight: 1.6
          }}>
            {logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
