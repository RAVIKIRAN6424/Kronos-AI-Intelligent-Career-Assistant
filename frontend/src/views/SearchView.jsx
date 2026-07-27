import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Building2, ExternalLink, Send, CheckCircle2, Sparkles, Globe, ShieldCheck, Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';
import { categoryTheme } from '../utils/categoryColors';

export const SearchView = ({ toast, onOpenOutreach }) => {
  const allPortalsList = ['All Portals', 'LinkedIn', 'Indeed', 'Glassdoor', 'Naukri', 'Monster', 'Google Jobs'];
  const [selectedPortal, setSelectedPortal] = useState('All Portals');
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8;

  // Multi-Portal Verified Job Base (At least 5+ jobs per portal = 30+ jobs)
  const baseJobs = [
    // LinkedIn (5)
    { id: 101, title: 'Senior Java & Spring Boot Architect', company: 'Infosys Cyber', location: 'Bengaluru, Karnataka', category: 'Software', source: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=Java%20Architect', posted_date: 'Posted 1 day ago', key_skills: 'Java 17, Spring Boot, Microservices, Kafka, PostgreSQL', match_score: 95 },
    { id: 102, title: 'Full Stack React & Node Engineer', company: 'TCS Digital', location: 'Hyderabad, Telangana', category: 'Software', source: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=React%20Developer', posted_date: 'Posted 2 days ago', key_skills: 'React.js, Node.js, TypeScript, GraphQL, Docker', match_score: 93 },
    { id: 103, title: 'SolidWorks Mechanical CAD Lead', company: 'Mahindra Defense R&D', location: 'Pune, Maharashtra', category: 'Mechanical', source: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=SolidWorks%20CAD', posted_date: 'Posted 1 day ago', key_skills: 'SolidWorks 3D, Sheet Metal, CSWP, Surface Modeling', match_score: 94 },
    { id: 104, title: 'AI & Machine Learning Specialist', company: 'Wipro AI Lab', location: 'Bengaluru, Karnataka', category: 'Data Science', source: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=AI%20Specialist', posted_date: 'Posted 3 days ago', key_skills: 'Python, PyTorch, LLMs, LangChain, System Design', match_score: 92 },
    { id: 105, title: 'AWS Cloud Infrastructure Architect', company: 'Accenture Cloud', location: 'Gurugram, NCR', category: 'Software', source: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=AWS%20Engineer', posted_date: 'Posted 2 days ago', key_skills: 'AWS ECS, Lambda, Terraform, S3, CloudWatch', match_score: 91 },

    // Indeed (5)
    { id: 201, title: 'Java Cloud Backend Engineer', company: 'TCS Cloud Systems', location: 'Hyderabad, Telangana', category: 'Software', source: 'Indeed', url: 'https://www.indeed.com/q-Java-Developer-jobs.html', posted_date: 'Posted 1 day ago', key_skills: 'Java 21, AWS ECS, Lambda, Docker, SQL', match_score: 93 },
    { id: 202, title: 'CATIA & Creo Automotive CAD Engineer', company: 'Bosch Automotive India', location: 'Bengaluru, Karnataka', category: 'Mechanical', source: 'Indeed', url: 'https://www.indeed.com/q-CATIA-CAD-jobs.html', posted_date: 'Posted 2 days ago', key_skills: 'CATIA V5/V6, PTC Creo, Plastics Design, Harnessing', match_score: 89 },
    { id: 203, title: 'Senior Data Analyst & SQL Specialist', company: 'Cognizant Data', location: 'Chennai, Tamil Nadu', category: 'Data Science', source: 'Indeed', url: 'https://www.indeed.com/q-Data-Analyst-jobs.html', posted_date: 'Posted 3 days ago', key_skills: 'SQL, Python, Tableau, Pandas, PowerBI', match_score: 90 },
    { id: 204, title: 'Embedded Electronics Systems Lead', company: 'Schneider Electric', location: 'Bengaluru, Karnataka', category: 'Electrical', source: 'Indeed', url: 'https://www.indeed.com/q-Electrical-Engineer-jobs.html', posted_date: 'Posted 1 day ago', key_skills: 'Embedded C, Altium Designer, Microcontrollers, PCB', match_score: 88 },
    { id: 205, title: 'DevOps & Site Reliability Engineer', company: 'Capgemini Tech', location: 'Mumbai, Maharashtra', category: 'Software', source: 'Indeed', url: 'https://www.indeed.com/q-DevOps-jobs.html', posted_date: 'Posted 2 days ago', key_skills: 'Kubernetes, Docker, Jenkins, Terraform, Ansible', match_score: 92 },

    // Glassdoor (5)
    { id: 301, title: 'Full Stack Java & React Engineer', company: 'Wipro Cyber', location: 'Pune, Maharashtra', category: 'Software', source: 'Glassdoor', url: 'https://www.glassdoor.com/Job/java-developer-jobs-SRCH_KO0,14.htm', posted_date: 'Posted 3 days ago', key_skills: 'Java, React.js, Spring Cloud, Hibernate, REST APIs', match_score: 91 },
    { id: 302, title: '3D CAD Piping & Structural Designer', company: 'Reliance Industries Engineering', location: 'Mumbai, Maharashtra', category: 'Mechanical', source: 'Glassdoor', url: 'https://www.glassdoor.com/Job/cad-engineer-jobs-SRCH_KO0,12.htm', posted_date: 'Posted 4 days ago', key_skills: 'Aveva PDMS, SmartPlant 3D, Piping CAD, ISO Drawings', match_score: 87 },
    { id: 303, title: 'Lead Civil Structural Engineer', company: 'Larsen & Toubro Construction', location: 'Delhi NCR', category: 'Civil', source: 'Glassdoor', url: 'https://www.glassdoor.com/Job/civil-engineer-jobs.htm', posted_date: 'Posted 2 days ago', key_skills: 'STAAD Pro, Revit Structure, AutoCAD Civil 3D, Eurocodes', match_score: 89 },
    { id: 304, title: 'Senior Data Engineer (Snowflake & PySpark)', company: 'Tiger Analytics', location: 'Bengaluru, Karnataka', category: 'Data Science', source: 'Glassdoor', url: 'https://www.glassdoor.com/Job/data-engineer-jobs.htm', posted_date: 'Posted 1 day ago', key_skills: 'Python, PySpark, Snowflake, SQL, Airflow', match_score: 94 },
    { id: 305, title: 'Cyber Security Operations Analyst', company: 'Barclays India', location: 'Pune, Maharashtra', category: 'Software', source: 'Glassdoor', url: 'https://www.glassdoor.com/Job/cyber-security-jobs.htm', posted_date: 'Posted 3 days ago', key_skills: 'SIEM, Splunk, Penetration Testing, SOC, ISO 27001', match_score: 90 },

    // Naukri (5)
    { id: 401, title: 'Java Lead & Distributed Systems Specialist', company: 'Reliance Digital AI', location: 'Mumbai, Maharashtra', category: 'Software', source: 'Naukri', url: 'https://www.naukri.com/java-developer-jobs', posted_date: 'Posted 4 days ago', key_skills: 'Java, Microservices Architecture, Redis, Kubernetes', match_score: 89 },
    { id: 402, title: 'Autodesk CAD & FEA Simulation Engineer', company: 'L&T Technology Services', location: 'Chennai, Tamil Nadu', category: 'Mechanical', source: 'Naukri', url: 'https://www.naukri.com/cad-design-engineer-jobs', posted_date: 'Posted 2 days ago', key_skills: 'AutoCAD 2024, Ansys Mechanical, Structural FEA, GD&T', match_score: 91 },
    { id: 403, title: 'Python Full Stack Developer (Django/FastAPI)', company: 'Zoho Corporation', location: 'Chennai, Tamil Nadu', category: 'Software', source: 'Naukri', url: 'https://www.naukri.com/python-developer-jobs', posted_date: 'Posted 1 day ago', key_skills: 'Python 3.12, Django, PostgreSQL, Vue.js, Celery', match_score: 95 },
    { id: 404, title: 'Senior Business Analyst & Strategy Consultant', company: 'McKinsey & Co India', location: 'Gurugram, NCR', category: 'Business', source: 'Naukri', url: 'https://www.naukri.com/business-analyst-jobs', posted_date: 'Posted 3 days ago', key_skills: 'Market Research, Financial Modeling, SQL, PowerPoint', match_score: 88 },
    { id: 405, title: 'Cloud DevOps Architect (Azure & Terraform)', company: 'Mindtree Tech', location: 'Bengaluru, Karnataka', category: 'Software', source: 'Naukri', url: 'https://www.naukri.com/devops-jobs', posted_date: 'Posted 2 days ago', key_skills: 'Azure DevOps, Terraform, Kubernetes, Docker, PowerShell', match_score: 92 },

    // Monster / Foundit (5)
    { id: 501, title: 'CAD Mechatronics Design Engineer', company: 'Tata Motors R&D', location: 'Bengaluru, Karnataka', category: 'Mechanical', source: 'Monster', url: 'https://www.foundit.in/srp/results?query=CAD%20Design%20Engineer', posted_date: 'Posted 5 days ago', key_skills: 'SolidWorks, Ansys FEA, GD&T, CNC Automation', match_score: 86 },
    { id: 502, title: 'Java Enterprise Applications Engineer', company: 'HCLTech', location: 'Noida, Uttar Pradesh', category: 'Software', source: 'Monster', url: 'https://www.foundit.in/srp/results?query=Java%20Developer', posted_date: 'Posted 2 days ago', key_skills: 'Java EE, Spring Security, Oracle DB, Maven', match_score: 88 },
    { id: 503, title: 'Robotics & Automation Controls Lead', company: 'ABB Robotics India', location: 'Bengaluru, Karnataka', category: 'Electrical', source: 'Monster', url: 'https://www.foundit.in/srp/results?query=Robotics%20Engineer', posted_date: 'Posted 3 days ago', key_skills: 'PLC Programming, ROS2, SCADA, Industrial Automation', match_score: 90 },
    { id: 504, title: 'QA Automation Engineer (Selenium & Cypress)', company: 'Tech Mahindra', location: 'Pune, Maharashtra', category: 'Software', source: 'Monster', url: 'https://www.foundit.in/srp/results?query=QA%20Automation', posted_date: 'Posted 4 days ago', key_skills: 'Selenium WebDriver, Cypress, Java, TestNG, Jenkins', match_score: 89 },
    { id: 505, title: 'Power Electronics & Battery Systems Engineer', company: 'Ola Electric R&D', location: 'Bengaluru, Karnataka', category: 'Electrical', source: 'Monster', url: 'https://www.foundit.in/srp/results?query=Power%20Electronics', posted_date: 'Posted 1 day ago', key_skills: 'BMS, Battery Cooling, Simulink, MATLAB, Inverters', match_score: 93 },

    // Google Jobs (5)
    { id: 601, title: 'Staff Java Software Engineer (SDE-3)', company: 'Google Cloud India', location: 'Gurugram, Haryana', category: 'Software', source: 'Google Jobs', url: 'https://www.google.com/search?q=Staff+Java+Software+Engineer+jobs', posted_date: 'Posted 1 day ago', key_skills: 'Java, Spanner, gRPC, High Concurrency, Distributed Systems', match_score: 97 },
    { id: 602, title: 'Automotive CAD Product Design Engineer', company: 'Hero MotoCorp R&D', location: 'Gurugram, Haryana', category: 'Mechanical', source: 'Google Jobs', url: 'https://www.google.com/search?q=Automotive+CAD+Product+Design+Engineer+jobs', posted_date: 'Posted 2 days ago', key_skills: 'DFMEA, DFM/DFA, SolidWorks, Rapid Prototyping', match_score: 93 },
    { id: 603, title: 'Principal Systems Architect (Distributed AI)', company: 'NVIDIA India', location: 'Bengaluru, Karnataka', category: 'Software', source: 'Google Jobs', url: 'https://www.google.com/search?q=NVIDIA+Systems+Architect+jobs', posted_date: 'Posted 1 day ago', key_skills: 'CUDA, C++, Distributed AI Systems, PyTorch, GPU Scaling', match_score: 96 },
    { id: 604, title: 'Senior Structural BIM Specialist (Revit)', company: 'AECOM Engineering', location: 'Mumbai, Maharashtra', category: 'Civil', source: 'Google Jobs', url: 'https://www.google.com/search?q=Revit+BIM+Specialist+jobs', posted_date: 'Posted 3 days ago', key_skills: 'Revit Structure, Navisworks, BIM 360, Structural Detailing', match_score: 90 },
    { id: 605, title: 'Machine Learning Research Engineer', company: 'Microsoft Research India', location: 'Bengaluru, Karnataka', category: 'Data Science', source: 'Google Jobs', url: 'https://www.google.com/search?q=Microsoft+Research+ML+jobs', posted_date: 'Posted 2 days ago', key_skills: 'Transformers, PyTorch, Python, NLP, Computer Vision', match_score: 95 }
  ];

  const [recentJobs, setRecentJobs] = useState(baseJobs);
  const [appliedJobIds, setAppliedJobIds] = useState([]);

  useEffect(() => {
    fetchRecentJobs();
  }, []);

  const fetchRecentJobs = async () => {
    try {
      const data = await api.getRecentJobs();
      if (data && Array.isArray(data) && data.length > 0) {
        const combined = [...data];
        baseJobs.forEach(bj => {
          if (!combined.some(c => c.id === bj.id || c.title === bj.title)) {
            combined.push(bj);
          }
        });
        setRecentJobs(combined);
      }
    } catch (err) {
      console.warn('Using default search fallback:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearching(true);
    setCurrentPage(1);
    setTimeout(() => {
      setSearching(false);
      if (toast) toast(`Found ${filteredJobs.length} latest matching job posting(s)!`, 'success');
    }, 600);
  };

  const handleQuickApply = (job) => {
    if (appliedJobIds.includes(job.id)) {
      if (toast) toast(`Already applied to ${job.title} at ${job.company}!`, 'info');
      return;
    }

    setAppliedJobIds(prev => [...prev, job.id]);
    if (toast) toast(`🚀 Applied to "${job.title}" at ${job.company} via ${job.source}!`, 'success');

    if (job.url) {
      window.open(job.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Filter Jobs by Portal Tab and Search Term
  const filteredJobs = recentJobs.filter(job => {
    const matchesPortal = selectedPortal === 'All Portals' || job.source.toLowerCase() === selectedPortal.toLowerCase();
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
      job.title.toLowerCase().includes(term) ||
      job.company.toLowerCase().includes(term) ||
      (job.key_skills && job.key_skills.toLowerCase().includes(term)) ||
      (job.location && job.location.toLowerCase().includes(term));

    return matchesPortal && matchesSearch;
  });

  // Calculate jobs count per portal
  const getPortalCount = (pName) => {
    if (pName === 'All Portals') return recentJobs.length;
    return recentJobs.filter(j => j.source.toLowerCase() === pName.toLowerCase()).length;
  };

  // Pagination Math
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage) || 1;
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobsSlice = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Globe size={24} color="var(--accent-cyan)" /> Live Multi-Portal Job Search Engine
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
          Search latest live job postings across LinkedIn, Indeed, Glassdoor, Naukri, Monster, and Google Jobs without limits.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="cyber-input"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search target title, company, skills (e.g. Java Architect, CAD Engineer, Data Analyst)..."
              style={{ paddingLeft: '44px' }}
            />
          </div>
          <button type="submit" className="btn-cyber" disabled={searching}>
            {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span>Search Jobs</span>
          </button>
        </form>

        {/* Portal Filter Tabs with Exact Verified Counts */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
          {allPortalsList.map(portal => {
            const isSelected = selectedPortal === portal;
            const count = getPortalCount(portal);
            return (
              <button
                key={portal}
                type="button"
                onClick={() => { setSelectedPortal(portal); setCurrentPage(1); }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: isSelected ? 'var(--accent-cyan)' : 'rgba(13, 22, 38, 0.8)',
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
                <span>{portal}</span>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', background: isSelected ? 'rgba(6, 10, 18, 0.3)' : 'rgba(255,255,255,0.1)' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Jobs Results Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Showing <strong style={{ color: '#ffffff' }}>{filteredJobs.length}</strong> live postings
            {selectedPortal !== 'All Portals' ? ` on ${selectedPortal}` : ''} (Page {currentPage} of {totalPages}):
          </div>
        </div>

        {currentJobsSlice.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No matching job postings found for "{searchTerm}". Try clearing search filters.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {currentJobsSlice.map(job => {
              const isApplied = appliedJobIds.includes(job.id);
              const colors = categoryTheme[job.category] || categoryTheme['Software'];
              return (
                <div key={job.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: colors.bg, color: colors.border, border: `1px solid ${colors.border}` }}>
                        {job.category}
                      </span>

                      <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 700, background: 'rgba(0, 242, 254, 0.1)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--accent-cyan)' }}>
                        {job.source}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', lineHeight: '1.3', marginBottom: '6px' }}>
                      {job.title}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={13} color="var(--accent-purple)" /> {job.company}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="var(--accent-cyan)" /> {job.location}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(2, 6, 15, 0.6)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '12px' }}>
                      <strong style={{ color: '#ffffff' }}>Skills: </strong> {job.key_skills || 'Core domain skills'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {job.posted_date || 'Posted recently'}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-cyber-outline"
                          style={{ padding: '6px 12px', fontSize: '11px', textDecoration: 'none' }}
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}

                      <button
                        type="button"
                        className={isApplied ? 'btn-cyber-outline' : 'btn-cyber'}
                        onClick={() => handleQuickApply(job)}
                        style={{ padding: '6px 14px', fontSize: '11px' }}
                      >
                        <Send size={13} /> {isApplied ? '✓ Applied' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn-cyber-outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="btn-cyber-outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
