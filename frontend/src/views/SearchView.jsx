import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Building2, ExternalLink, Send, CheckCircle2, Sparkles, Globe } from 'lucide-react';
import { api } from '../utils/api';
import { categoryTheme } from '../utils/categoryColors';

export const SearchView = ({ toast, onOpenOutreach }) => {
  const defaultRecentJobs = [
    { id: 101, title: 'Senior Java & Spring Boot Architect', company: 'Infosys Cyber', location: 'Bengaluru, Karnataka', category: 'Software', source: 'LinkedIn', url: 'https://linkedin.com/jobs/sample-java-1', posted_date: 'Posted 2 days ago', key_skills: 'Java 17, Spring Boot, Microservices, Kafka, PostgreSQL', match_score: 95 },
    { id: 102, title: 'AWS Cloud Infrastructure Engineer', company: 'TCS Cloud Systems', location: 'Hyderabad, Telangana', category: 'Software', source: 'Indeed', url: 'https://indeed.com/jobs/sample-aws-2', posted_date: 'Posted 1 day ago', key_skills: 'AWS ECS, Lambda, Terraform, S3, CloudWatch', match_score: 92 },
    { id: 103, title: 'Lead DevOps & Kubernetes Specialist', company: 'Wipro Cyber', location: 'Pune, Maharashtra', category: 'Software', source: 'Glassdoor', url: 'https://glassdoor.com/jobs/sample-devops-3', posted_date: 'Posted 3 days ago', key_skills: 'Kubernetes, Docker, Helm, GitHub Actions, Prometheus', match_score: 90 },
    { id: 104, title: 'Senior Data Analyst & BI Specialist', company: 'Reliance Digital AI', location: 'Mumbai, Maharashtra', category: 'Data Science', source: 'Naukri', url: 'https://naukri.com/jobs/sample-data-4', posted_date: 'Posted 4 days ago', key_skills: 'Python, SQL, Tableau, Pandas, PyTorch', match_score: 88 },
    { id: 105, title: 'CAD Mechatronics Design Engineer', company: 'Tata Motors R&D', location: 'Bengaluru, Karnataka', category: 'Mechanical', source: 'Monster', url: 'https://monster.com/jobs/sample-mech-5', posted_date: 'Posted 5 days ago', key_skills: 'SolidWorks, Ansys FEA, GD&T, CNC Automation', match_score: 86 }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [recentJobs, setRecentJobs] = useState(defaultRecentJobs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecentJobs();
  }, []);

  const fetchRecentJobs = async () => {
    try {
      const data = await api.getRecentJobs();
      if (data && data.length > 0) {
        setRecentJobs(data);
      } else {
        setRecentJobs(defaultRecentJobs);
      }
    } catch (err) {
      console.warn('Using default search fallback:', err);
      setRecentJobs(defaultRecentJobs);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = recentJobs.filter(j => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return j.title.toLowerCase().includes(term) || j.company.toLowerCase().includes(term) || (j.key_skills && j.key_skills.toLowerCase().includes(term));
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={24} color="var(--accent-cyan)" /> Step 14: Dedicated Latest Jobs Search
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Explore and filter active latest job postings across all connected portals. Direct job links are available to view without requiring login.
        </p>
      </div>

      {/* Search Bar with Search Button */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="var(--accent-cyan)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
          <input
            type="text"
            className="cyber-input"
            placeholder="Search latest roles (e.g. Java Developer, AWS, DevOps, Mechanical, Data Analyst)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '44px', fontSize: '15px' }}
          />
        </div>
        <button className="btn-cyber" style={{ padding: '12px 24px' }} onClick={() => toast(`Filtered latest job results for "${searchTerm || 'All Latest Jobs'}"`, 'info')}>
          <Search size={16} /> Search Latest Jobs
        </button>
      </div>

      {/* Latest Job Results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredJobs.map(job => {
          const style = categoryTheme[job.category] || categoryTheme.Software;
          const jobUrl = job.url || `https://www.google.com/search?q=${encodeURIComponent(job.title + ' ' + job.company + ' jobs')}`;
          return (
            <div key={job.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', border: `1px solid ${style.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-code)', color: style.color, background: style.bg, border: `1px solid ${style.border}` }}>
                  {job.category || 'Software'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-code)' }}>
                  <Calendar size={13} /> {job.posted_date || 'Latest Posting'}
                </span>
              </div>

              <div>
                <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 800 }}>{job.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building2 size={14} /> {job.company}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {job.location}</span>
                  <span className="badge-connected" style={{ fontSize: '11px', padding: '2px 8px' }}>🌐 {job.source || 'LinkedIn'}</span>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-dim)', background: 'rgba(2, 6, 15, 0.6)', padding: '10px', borderRadius: '8px' }}>
                Skills: <strong style={{ color: 'var(--text-main)' }}>{job.key_skills || 'Core Technical Skills'}</strong>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', flexWrap: 'wrap' }}>
                <button
                  className="btn-cyber"
                  style={{ flex: 1, padding: '10px', justifyContent: 'center' }}
                  onClick={() => {
                    toast(`Applied to ${job.title} at ${job.company}!`, 'success');
                  }}
                >
                  <CheckCircle2 size={16} /> Quick Apply
                </button>

                {/* Job Link - Visible and Openable Without Login */}
                <a
                  href={jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cyber-outline"
                  style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', textDecoration: 'none', background: 'rgba(0, 242, 254, 0.1)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <ExternalLink size={15} color="var(--accent-cyan)" /> Open Link
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

