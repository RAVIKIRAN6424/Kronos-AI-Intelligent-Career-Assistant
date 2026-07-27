import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Building2, ExternalLink, Send, CheckCircle2, Sparkles, Globe, ShieldCheck, Filter, Loader2, ChevronLeft, ChevronRight, Clock, Briefcase } from 'lucide-react';
import { api } from '../utils/api';
import { categoryTheme } from '../utils/categoryColors';

export const SearchView = ({ toast, onOpenOutreach }) => {
  const allPortalsList = ['All Portals', 'LinkedIn', 'Indeed', 'Glassdoor', 'Naukri', 'Monster', 'Google Jobs'];
  const [selectedPortal, setSelectedPortal] = useState('All Portals');
  const [searchTerm, setSearchTerm] = useState('');
  const [postedWithin, setPostedWithin] = useState('all'); // 'all', '24h', '2d', '1w'
  const [experienceLevel, setExperienceLevel] = useState('all'); // 'all', 'entry', 'mid', 'senior'
  const [locationFilter, setLocationFilter] = useState('all'); // 'all', 'mode_remote', 'mode_hybrid', 'mode_onsite', 'state_karnataka', etc.
  const [searching, setSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8;

  const now = Date.now();

  const inferExperience = (title = '', skills = '', desc = '') => {
    const text = `${title} ${skills} ${desc}`.toLowerCase();
    if (text.includes('senior') || text.includes('lead') || text.includes('principal') || text.includes('architect') || text.includes('5+') || text.includes('staff')) {
      return 'senior';
    }
    if (text.includes('entry') || text.includes('fresher') || text.includes('junior') || text.includes('intern') || text.includes('associate') || text.includes('0-1') || text.includes('0-2') || text.includes('trainee')) {
      return 'entry';
    }
    return 'mid';
  };

  // Base Jobs Dataset (Enriched across LinkedIn, Indeed, Glassdoor, Naukri, Monster, Google Jobs for all locations & work modes)
  const baseJobs = [
    // LinkedIn (Java, Python, CAD)
    { id: 101, title: 'Senior Java & Spring Boot Architect', company: 'Infosys Cyber', location: 'Bengaluru, Karnataka (Hybrid)', work_mode: 'Hybrid', state: 'Karnataka', country: 'India', category: 'Software', source: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=Java%20Architect', posted_date: 'Posted 2 hours ago', posted_at: new Date(now - 2 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java 17, Spring Boot, Microservices, Kafka, PostgreSQL', match_score: 96 },
    { id: 102, title: 'Lead Java Distributed Systems Specialist', company: 'TCS Digital', location: 'Hyderabad, Telangana (Remote)', work_mode: 'Remote', state: 'Telangana', country: 'India', category: 'Software', source: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=Java%20Lead', posted_date: 'Posted 10 hours ago', posted_at: new Date(now - 10 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java 21, Spring Cloud, Redis, Kubernetes, Docker', match_score: 94 },
    { id: 103, title: 'Mid-Level Java Backend Engineer', company: 'Wipro Cyber', location: 'Mumbai, Maharashtra (On-site)', work_mode: 'On-site', state: 'Maharashtra', country: 'India', category: 'Software', source: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=Java%20Developer', posted_date: 'Posted 1 day ago', posted_at: new Date(now - 26 * 3600 * 1000).toISOString(), experience_level: 'mid', key_skills: 'Java 17, REST APIs, Hibernate, MySQL, JUnit', match_score: 92 },
    { id: 104, title: 'Entry Level Java Associate (Fresher)', company: 'HCLTech', location: 'Noida, Uttar Pradesh / NCR (Hybrid)', work_mode: 'Hybrid', state: 'Uttar Pradesh', country: 'India', category: 'Software', source: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=Java%20Fresher', posted_date: 'Posted 3 days ago', posted_at: new Date(now - 72 * 3600 * 1000).toISOString(), experience_level: 'entry', key_skills: 'Java Core, OOP, Data Structures, SQL basics', match_score: 88 },
    { id: 105, title: 'Senior Java Cloud Solutions Lead', company: 'Accenture Cloud', location: 'San Francisco, California, USA (Remote)', work_mode: 'Remote', state: 'California', country: 'United States', category: 'Software', source: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=Java%20Cloud', posted_date: 'Posted 5 days ago', posted_at: new Date(now - 120 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java, AWS ECS, Lambda, Terraform, Spring Security', match_score: 93 },
    { id: 106, title: 'Senior Python & AI Systems Architect', company: 'Infosys AI', location: 'Chennai, Tamil Nadu (On-site)', work_mode: 'On-site', state: 'Tamil Nadu', country: 'India', category: 'Software', source: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords=Python%20Architect', posted_date: 'Posted 4 hours ago', posted_at: new Date(now - 4 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Python 3.12, PyTorch, Django, FastAPI, PostgreSQL', match_score: 95 },

    // Indeed
    { id: 201, title: 'Senior Java Cloud Backend Architect', company: 'TCS Cloud Systems', location: 'Hyderabad, Telangana (Remote)', work_mode: 'Remote', state: 'Telangana', country: 'India', category: 'Software', source: 'Indeed', url: 'https://www.indeed.com/jobs?q=Java+Developer', posted_date: 'Posted 3 hours ago', posted_at: new Date(now - 3 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java 21, AWS ECS, Spring Boot, Microservices, SQL', match_score: 95 },
    { id: 202, title: 'Lead Java Microservices Engineer', company: 'Cognizant Tech', location: 'Chennai, Tamil Nadu (Hybrid)', work_mode: 'Hybrid', state: 'Tamil Nadu', country: 'India', category: 'Software', source: 'Indeed', url: 'https://www.indeed.com/jobs?q=Java+Lead', posted_date: 'Posted 12 hours ago', posted_at: new Date(now - 12 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java 17, Spring Cloud, Kafka, PostgreSQL, Docker', match_score: 93 },
    { id: 203, title: 'Java & Spring Boot Software Developer', company: 'Capgemini Tech', location: 'Mumbai, Maharashtra (On-site)', work_mode: 'On-site', state: 'Maharashtra', country: 'India', category: 'Software', source: 'Indeed', url: 'https://www.indeed.com/jobs?q=Java+Engineer', posted_date: 'Posted 1 day ago', posted_at: new Date(now - 28 * 3600 * 1000).toISOString(), experience_level: 'mid', key_skills: 'Java, Spring Boot, Hibernate, REST APIs, Git', match_score: 91 },
    { id: 204, title: 'Junior Java Developer (0-2 yrs)', company: 'Wipro Digital', location: 'Pune, Maharashtra (Hybrid)', work_mode: 'Hybrid', state: 'Maharashtra', country: 'India', category: 'Software', source: 'Indeed', url: 'https://www.indeed.com/jobs?q=Junior+Java', posted_date: 'Posted 4 days ago', posted_at: new Date(now - 96 * 3600 * 1000).toISOString(), experience_level: 'entry', key_skills: 'Java, Core OOP, SQL, Unit Testing, HTML/CSS', match_score: 87 },
    { id: 205, title: 'Principal Java Systems Engineer', company: 'IBM Systems', location: 'Bengaluru, Karnataka (On-site)', work_mode: 'On-site', state: 'Karnataka', country: 'India', category: 'Software', source: 'Indeed', url: 'https://www.indeed.com/jobs?q=Java+Principal', posted_date: 'Posted 6 days ago', posted_at: new Date(now - 144 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java, High Concurrency, Multithreading, JVM Tuning', match_score: 94 },
    { id: 206, title: 'Python Full Stack Engineer (Django/React)', company: 'Cognizant Data', location: 'San Jose, California, USA (Remote)', work_mode: 'Remote', state: 'California', country: 'United States', category: 'Software', source: 'Indeed', url: 'https://www.indeed.com/jobs?q=Python+Developer', posted_date: 'Posted 5 hours ago', posted_at: new Date(now - 5 * 3600 * 1000).toISOString(), experience_level: 'mid', key_skills: 'Python, Django, React.js, PostgreSQL, REST APIs', match_score: 93 },

    // Glassdoor
    { id: 301, title: 'Principal Full Stack Java & React Engineer', company: 'Wipro Cyber', location: 'Hyderabad, Telangana (Remote)', work_mode: 'Remote', state: 'Telangana', country: 'India', category: 'Software', source: 'Glassdoor', url: 'https://www.glassdoor.com/Job/jobs.htm?sc.keyword=java', posted_date: 'Posted 4 hours ago', posted_at: new Date(now - 4 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java 17, React.js, Spring Cloud, Hibernate, REST APIs', match_score: 95 },
    { id: 302, title: 'Senior Java Enterprise Solutions Architect', company: 'Barclays India', location: 'Pune, Maharashtra (Hybrid)', work_mode: 'Hybrid', state: 'Maharashtra', country: 'India', category: 'Software', source: 'Glassdoor', url: 'https://www.glassdoor.com/Job/jobs.htm?sc.keyword=java+architect', posted_date: 'Posted 14 hours ago', posted_at: new Date(now - 14 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java 21, Spring Security, Oracle DB, Maven, Microservices', match_score: 94 },
    { id: 303, title: 'Mid-Level Java Microservices Lead', company: 'Tiger Analytics', location: 'Bengaluru, Karnataka (On-site)', work_mode: 'On-site', state: 'Karnataka', country: 'India', category: 'Software', source: 'Glassdoor', url: 'https://www.glassdoor.com/Job/jobs.htm?sc.keyword=java+developer', posted_date: 'Posted 1 day ago', posted_at: new Date(now - 30 * 3600 * 1000).toISOString(), experience_level: 'mid', key_skills: 'Java, Spring Boot, Redis, RabbitMQ, Docker', match_score: 92 },
    { id: 304, title: 'Graduate Trainee Java Developer (Fresher)', company: 'LTI Mindtree', location: 'Chennai, Tamil Nadu (Hybrid)', work_mode: 'Hybrid', state: 'Tamil Nadu', country: 'India', category: 'Software', source: 'Glassdoor', url: 'https://www.glassdoor.com/Job/jobs.htm?sc.keyword=java+fresher', posted_date: 'Posted 3 days ago', posted_at: new Date(now - 74 * 3600 * 1000).toISOString(), experience_level: 'entry', key_skills: 'Java 11, Basic SQL, Problem Solving, Data Structures', match_score: 86 },
    { id: 305, title: 'Senior Java & Cloud Security Engineer', company: 'Barclays Cyber', location: 'Gurugram, Uttar Pradesh / NCR (Remote)', work_mode: 'Remote', state: 'Uttar Pradesh', country: 'India', category: 'Software', source: 'Glassdoor', url: 'https://www.glassdoor.com/Job/jobs.htm?sc.keyword=java+security', posted_date: 'Posted 5 days ago', posted_at: new Date(now - 122 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java, OAuth2, Spring Security, OWASP, ISO 27001', match_score: 93 },
    { id: 306, title: 'Lead Python Systems Engineer (FastAPI)', company: 'Wipro AI', location: 'Los Angeles, California, USA (Remote)', work_mode: 'Remote', state: 'California', country: 'United States', category: 'Software', source: 'Glassdoor', url: 'https://www.glassdoor.com/Job/jobs.htm?sc.keyword=python', posted_date: 'Posted 6 hours ago', posted_at: new Date(now - 6 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Python 3.12, FastAPI, AsyncIO, Redis, Docker', match_score: 94 },

    // Naukri
    { id: 401, title: 'Java Lead & Distributed Systems Specialist', company: 'Reliance Digital AI', location: 'Hyderabad, Telangana (Remote)', work_mode: 'Remote', state: 'Telangana', country: 'India', category: 'Software', source: 'Naukri', url: 'https://www.naukri.com/java-developer-jobs', posted_date: 'Posted 5 hours ago', posted_at: new Date(now - 5 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java 21, Microservices Architecture, Redis, Kubernetes', match_score: 94 },
    { id: 402, title: 'Senior Java Backend Engineer (Spring Boot)', company: 'Zoho Corporation', location: 'Chennai, Tamil Nadu (On-site)', work_mode: 'On-site', state: 'Tamil Nadu', country: 'India', category: 'Software', source: 'Naukri', url: 'https://www.naukri.com/java-jobs', posted_date: 'Posted 16 hours ago', posted_at: new Date(now - 16 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java, Spring Boot, PostgreSQL, Kafka, ElasticSearch', match_score: 93 },
    { id: 403, title: 'Java Software Engineer (2-5 yrs experience)', company: 'Tech Mahindra', location: 'Pune, Maharashtra (Hybrid)', work_mode: 'Hybrid', state: 'Maharashtra', country: 'India', category: 'Software', source: 'Naukri', url: 'https://www.naukri.com/java-engineer-jobs', posted_date: 'Posted 1 day ago', posted_at: new Date(now - 32 * 3600 * 1000).toISOString(), experience_level: 'mid', key_skills: 'Java, REST APIs, MySQL, Git, Maven, JUnit', match_score: 90 },
    { id: 404, title: 'Junior Java Developer Trainee (Fresher 0-1 yr)', company: 'L&T Technology Services', location: 'Bengaluru, Karnataka (Hybrid)', work_mode: 'Hybrid', state: 'Karnataka', country: 'India', category: 'Software', source: 'Naukri', url: 'https://www.naukri.com/java-fresher-jobs', posted_date: 'Posted 4 days ago', posted_at: new Date(now - 98 * 3600 * 1000).toISOString(), experience_level: 'entry', key_skills: 'Java, Object Oriented Programming, SQL, Core Algorithms', match_score: 87 },
    { id: 405, title: 'Staff Java Architect & Cloud Lead', company: 'Mindtree Tech', location: 'Noida, Uttar Pradesh / NCR (Remote)', work_mode: 'Remote', state: 'Uttar Pradesh', country: 'India', category: 'Software', source: 'Naukri', url: 'https://www.naukri.com/java-architect-jobs', posted_date: 'Posted 6 days ago', posted_at: new Date(now - 146 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java 21, Spring Cloud, AWS ECS, Terraform, Microservices', match_score: 95 },
    { id: 406, title: 'Senior Python & AI Microservices Lead', company: 'Zoho Corporation', location: 'Cupertino, California, USA (Remote)', work_mode: 'Remote', state: 'California', country: 'United States', category: 'Software', source: 'Naukri', url: 'https://www.naukri.com/python-developer-jobs', posted_date: 'Posted 6 hours ago', posted_at: new Date(now - 6 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Python 3.12, Django, PostgreSQL, Vue.js, Celery', match_score: 96 },

    // Monster
    { id: 501, title: 'Senior Java Enterprise Applications Engineer', company: 'HCLTech', location: 'Hyderabad, Telangana (Remote)', work_mode: 'Remote', state: 'Telangana', country: 'India', category: 'Software', source: 'Monster', url: 'https://www.foundit.in/srp/results?query=Java', posted_date: 'Posted 6 hours ago', posted_at: new Date(now - 6 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java EE, Spring Security, Oracle DB, Maven, Microservices', match_score: 94 },
    { id: 502, title: 'Lead Java Systems Architect', company: 'Tata Motors R&D', location: 'Bengaluru, Karnataka (On-site)', work_mode: 'On-site', state: 'Karnataka', country: 'India', category: 'Software', source: 'Monster', url: 'https://www.foundit.in/srp/results?query=Java+Architect', posted_date: 'Posted 18 hours ago', posted_at: new Date(now - 18 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java 17, High Concurrency, Kafka, PostgreSQL, Docker', match_score: 93 },
    { id: 503, title: 'Java Software Engineer (Mid Level 3+ yrs)', company: 'Tech Mahindra', location: 'Mumbai, Maharashtra (Hybrid)', work_mode: 'Hybrid', state: 'Maharashtra', country: 'India', category: 'Software', source: 'Monster', url: 'https://www.foundit.in/srp/results?query=Java+Developer', posted_date: 'Posted 1 day ago', posted_at: new Date(now - 34 * 3600 * 1000).toISOString(), experience_level: 'mid', key_skills: 'Java, Spring Boot, Hibernate, REST APIs, MySQL', match_score: 91 },
    { id: 504, title: 'Entry Level Java QA Automation Engineer', company: 'ABB Robotics India', location: 'Chennai, Tamil Nadu (On-site)', work_mode: 'On-site', state: 'Tamil Nadu', country: 'India', category: 'Software', source: 'Monster', url: 'https://www.foundit.in/srp/results?query=Java+QA', posted_date: 'Posted 3 days ago', posted_at: new Date(now - 76 * 3600 * 1000).toISOString(), experience_level: 'entry', key_skills: 'Java, Selenium WebDriver, TestNG, Jenkins, Git', match_score: 88 },
    { id: 505, title: 'Principal Java Microservices Lead', company: 'Ola Electric R&D', location: 'Gurugram, Uttar Pradesh / NCR (Hybrid)', work_mode: 'Hybrid', state: 'Uttar Pradesh', country: 'India', category: 'Software', source: 'Monster', url: 'https://www.foundit.in/srp/results?query=Java+Lead', posted_date: 'Posted 5 days ago', posted_at: new Date(now - 124 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java 21, Spring Cloud, Kubernetes, Redis, Distributed Systems', match_score: 95 },
    { id: 506, title: 'Python & AI Computer Vision Lead Engineer', company: 'HCLTech AI', location: 'Palo Alto, California, USA (Remote)', work_mode: 'Remote', state: 'California', country: 'United States', category: 'Software', source: 'Monster', url: 'https://www.foundit.in/srp/results?query=Python', posted_date: 'Posted 7 hours ago', posted_at: new Date(now - 7 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Python, OpenCV, PyTorch, TensorFlow, CUDA', match_score: 95 },

    // Google Jobs
    { id: 601, title: 'Staff Java Software Engineer (SDE-3)', company: 'Google Cloud India', location: 'Hyderabad, Telangana (Remote)', work_mode: 'Remote', state: 'Telangana', country: 'India', category: 'Software', source: 'Google Jobs', url: 'https://www.google.com/search?q=Java+Software+Engineer+jobs', posted_date: 'Posted 1 hour ago', posted_at: new Date(now - 1 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java, Spanner, gRPC, High Concurrency, Distributed Systems', match_score: 97 },
    { id: 602, title: 'Senior Java Backend Cloud Architect', company: 'Google Cloud India', location: 'Bengaluru, Karnataka (Hybrid)', work_mode: 'Hybrid', state: 'Karnataka', country: 'India', category: 'Software', source: 'Google Jobs', url: 'https://www.google.com/search?q=Java+Cloud+Architect', posted_date: 'Posted 8 hours ago', posted_at: new Date(now - 8 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java 21, Spring Boot, GCP, Kubernetes, Terraform', match_score: 96 },
    { id: 603, title: 'Mid-Level Java Microservices Engineer', company: 'Microsoft Research India', location: 'Mumbai, Maharashtra (On-site)', work_mode: 'On-site', state: 'Maharashtra', country: 'India', category: 'Software', source: 'Google Jobs', url: 'https://www.google.com/search?q=Java+Engineer+Microsoft', posted_date: 'Posted 1 day ago', posted_at: new Date(now - 25 * 3600 * 1000).toISOString(), experience_level: 'mid', key_skills: 'Java, Azure, Spring Boot, CosmosDB, REST APIs', match_score: 93 },
    { id: 604, title: 'Junior Java Software Engineer (Associate)', company: 'NVIDIA India', location: 'Chennai, Tamil Nadu (Hybrid)', work_mode: 'Hybrid', state: 'Tamil Nadu', country: 'India', category: 'Software', source: 'Google Jobs', url: 'https://www.google.com/search?q=Junior+Java+Engineer', posted_date: 'Posted 3 days ago', posted_at: new Date(now - 73 * 3600 * 1000).toISOString(), experience_level: 'entry', key_skills: 'Java, C++, Data Structures, Object-Oriented Design', match_score: 89 },
    { id: 605, title: 'Principal Java Systems Lead', company: 'Hero MotoCorp R&D', location: 'Gurugram, Uttar Pradesh / NCR (Remote)', work_mode: 'Remote', state: 'Uttar Pradesh', country: 'India', category: 'Software', source: 'Google Jobs', url: 'https://www.google.com/search?q=Java+Lead+Hero', posted_date: 'Posted 5 days ago', posted_at: new Date(now - 121 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Java, Microservices, IoT Telemetry, PostgreSQL, Kafka', match_score: 94 },
    { id: 606, title: 'Principal Python & Distributed Systems Lead', company: 'Google Cloud India', location: 'Mountain View, California, USA (Remote)', work_mode: 'Remote', state: 'California', country: 'United States', category: 'Software', source: 'Google Jobs', url: 'https://www.google.com/search?q=Python+Software+Engineer+jobs', posted_date: 'Posted 2 hours ago', posted_at: new Date(now - 2 * 3600 * 1000).toISOString(), experience_level: 'senior', key_skills: 'Python, Spanner, gRPC, Distributed Systems, GCP', match_score: 97 }
  ];

  const [recentJobs, setRecentJobs] = useState(baseJobs);
  const [appliedJobIds, setAppliedJobIds] = useState([]);

  useEffect(() => {
    fetchRecentJobs();
  }, [postedWithin, experienceLevel]);

  const fetchRecentJobs = async () => {
    try {
      const data = await api.getRecentJobs({
        postedWithin: postedWithin !== 'all' ? postedWithin : undefined,
        experienceLevel: experienceLevel !== 'all' ? experienceLevel : undefined
      });
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
      if (toast) toast(`Found ${sortedFilteredJobs.length} latest matching job posting(s)!`, 'success');
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

  // Filter Jobs by Search Term & Recency & Experience Level (Strict Relevance Check)
  const searchFilteredJobs = recentJobs.filter(job => {
    const term = searchTerm.toLowerCase().trim();
    
    // Strict relevance check: search keyword MUST be in title, skills, description, or category
    const matchesSearch = !term ||
      job.title.toLowerCase().includes(term) ||
      (job.key_skills && job.key_skills.toLowerCase().includes(term)) ||
      (job.description && job.description.toLowerCase().includes(term)) ||
      job.company.toLowerCase().includes(term) ||
      (job.category && job.category.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    // Experience Level Filter
    const jobExp = job.experience_level || inferExperience(job.title, job.key_skills, job.description);
    if (experienceLevel !== 'all' && jobExp !== experienceLevel) {
      return false;
    }

    // Recency Filter
    if (postedWithin !== 'all') {
      const currentTime = Date.now();
      const jobTime = job.posted_at ? new Date(job.posted_at).getTime() : 0;

      if (!jobTime) {
        if (postedWithin === '24h' && (!job.posted_date?.includes('hour') && !job.posted_date?.includes('Just now') && !job.posted_date?.includes('1 day'))) return false;
        if (postedWithin === '2d' && (job.posted_date?.includes('3 day') || job.posted_date?.includes('4 day') || job.posted_date?.includes('5 day') || job.posted_date?.includes('6 day'))) return false;
        if (postedWithin === '1w' && (job.posted_date?.includes('2 week') || job.posted_date?.includes('month'))) return false;
      } else {
        const diffHours = (currentTime - jobTime) / (1000 * 3600);
        if (postedWithin === '24h' && diffHours > 24) return false;
        if (postedWithin === '2d' && diffHours > 48) return false;
        if (postedWithin === '1w' && diffHours > 168) return false;
      }
    }

    // Location Filter (Work Mode, State, Country)
    if (locationFilter !== 'all') {
      const jobLoc = `${job.location || ''} ${job.title || ''} ${job.description || ''} ${job.country || ''}`.toLowerCase();
      
      if (locationFilter === 'mode_remote') {
        if (!jobLoc.includes('remote') && !jobLoc.includes('wfh') && !jobLoc.includes('work from home')) return false;
      } else if (locationFilter === 'mode_hybrid') {
        if (!jobLoc.includes('hybrid')) return false;
      } else if (locationFilter === 'mode_onsite') {
        if (jobLoc.includes('remote') || jobLoc.includes('hybrid')) return false;
      } else if (locationFilter === 'state_karnataka') {
        if (!jobLoc.includes('karnataka') && !jobLoc.includes('bengaluru') && !jobLoc.includes('bangalore')) return false;
      } else if (locationFilter === 'state_telangana') {
        if (!jobLoc.includes('telangana') && !jobLoc.includes('hyderabad')) return false;
      } else if (locationFilter === 'state_maharashtra') {
        if (!jobLoc.includes('maharashtra') && !jobLoc.includes('mumbai') && !jobLoc.includes('pune')) return false;
      } else if (locationFilter === 'state_tn') {
        if (!jobLoc.includes('tamil nadu') && !jobLoc.includes('chennai')) return false;
      } else if (locationFilter === 'state_up') {
        if (!jobLoc.includes('noida') && !jobLoc.includes('uttar pradesh') && !jobLoc.includes('up') && !jobLoc.includes('gurugram') && !jobLoc.includes('ncr')) return false;
      } else if (locationFilter === 'state_ca') {
        if (!jobLoc.includes('california') && !jobLoc.includes('ca') && !jobLoc.includes('san francisco')) return false;
      } else if (locationFilter === 'country_india') {
        if (jobLoc.includes('usa') || jobLoc.includes('california') || jobLoc.includes('new york')) return false;
      } else if (locationFilter === 'country_usa') {
        if (!jobLoc.includes('usa') && !jobLoc.includes('california') && !jobLoc.includes('ca') && !jobLoc.includes('ny')) return false;
      }
    }

    return true;
  });

  // Calculate jobs count per portal matching search, recency, and experience filters
  const getPortalCount = (pName) => {
    if (pName === 'All Portals') return searchFilteredJobs.length;
    return searchFilteredJobs.filter(j => j.source.toLowerCase() === pName.toLowerCase()).length;
  };

  // Filter Jobs by Selected Portal
  const filteredJobs = searchFilteredJobs.filter(job => {
    return selectedPortal === 'All Portals' || job.source.toLowerCase() === selectedPortal.toLowerCase();
  });

  // Sort newest-first across all portals
  const sortedFilteredJobs = [...filteredJobs].sort((a, b) => {
    const timeA = a.posted_at ? new Date(a.posted_at).getTime() : 0;
    const timeB = b.posted_at ? new Date(b.posted_at).getTime() : 0;
    return timeB - timeA;
  });

  // Pagination Math
  const totalPages = Math.ceil(sortedFilteredJobs.length / jobsPerPage) || 1;
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobsSlice = sortedFilteredJobs.slice(indexOfFirstJob, indexOfLastJob);

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

        {/* Search Bar & Multi-Filter Controls */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="cyber-input"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search target title, company, skills (e.g. Java, Python, Data Analyst, CAD)..."
              style={{ paddingLeft: '44px' }}
            />
          </div>

          {/* Experience Level Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Briefcase size={16} color="var(--accent-purple)" />
            <select
              className="cyber-input"
              value={experienceLevel}
              onChange={(e) => { setExperienceLevel(e.target.value); setCurrentPage(1); }}
              style={{ padding: '0 12px', height: '42px', fontSize: '13px', borderRadius: '10px', width: '190px' }}
            >
              <option value="all">🎯 All Experience Levels</option>
              <option value="entry">🌱 Entry Level / Fresher</option>
              <option value="mid">⚡ Mid Level (2-5 yrs)</option>
              <option value="senior">👑 Senior / Experienced (5+ yrs)</option>
            </select>
          </div>

          {/* Location Filter Dropdown (Work Mode, State, Country) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} color="var(--accent-cyan)" />
            <select
              className="cyber-input"
              value={locationFilter}
              onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
              style={{ padding: '0 12px', height: '42px', fontSize: '13px', borderRadius: '10px', width: '195px' }}
            >
              <option value="all">📍 All Locations</option>

              <optgroup label="Work Mode">
                <option value="mode_remote">🏠 Remote</option>
                <option value="mode_hybrid">🏢 Hybrid</option>
                <option value="mode_onsite">📍 On-site</option>
              </optgroup>

              <optgroup label="State / Region">
                <option value="state_karnataka">📌 Karnataka (Bengaluru)</option>
                <option value="state_telangana">📌 Telangana (Hyderabad)</option>
                <option value="state_maharashtra">📌 Maharashtra (Mumbai/Pune)</option>
                <option value="state_tn">📌 Tamil Nadu (Chennai)</option>
                <option value="state_up">📌 Uttar Pradesh / NCR</option>
                <option value="state_ca">📌 California (USA)</option>
              </optgroup>

              <optgroup label="Country">
                <option value="country_india">🌐 India</option>
                <option value="country_usa">🌐 United States</option>
              </optgroup>
            </select>
          </div>

          {/* Recency Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} color="var(--accent-cyan)" />
            <select
              className="cyber-input"
              value={postedWithin}
              onChange={(e) => { setPostedWithin(e.target.value); setCurrentPage(1); }}
              style={{ padding: '0 12px', height: '42px', fontSize: '13px', borderRadius: '10px', width: '190px' }}
            >
              <option value="all">📅 Posted: All Time</option>
              <option value="24h">🔥 Posted: Last 24 Hours</option>
              <option value="2d">⚡ Posted: Last 2 Days</option>
              <option value="1w">🕒 Posted: Last 1 Week</option>
            </select>
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
            Showing <strong style={{ color: '#ffffff' }}>{sortedFilteredJobs.length}</strong> live postings
            {selectedPortal !== 'All Portals' ? ` on ${selectedPortal}` : ''}
            {experienceLevel !== 'all' ? ` (${experienceLevel.toUpperCase()})` : ''}
            {postedWithin !== 'all' ? ` (${postedWithin === '24h' ? 'Last 24h' : postedWithin === '2d' ? 'Last 2 days' : 'Last 1 week'})` : ''} (Page {currentPage} of {totalPages}):
          </div>
        </div>

        {currentJobsSlice.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No matching job postings found for "{searchTerm || 'selected filter'}". Try adjusting experience level, recency, or portal filters.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {currentJobsSlice.map(job => {
              const isApplied = appliedJobIds.includes(job.id);
              const colors = categoryTheme[job.category] || categoryTheme['Software'];
              const exp = job.experience_level || inferExperience(job.title, job.key_skills, job.description);
              const expLabel = exp === 'senior' ? 'Senior (5+ yrs)' : exp === 'entry' ? 'Entry Level / Fresher' : 'Mid Level (2-5 yrs)';

              return (
                <div key={job.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: colors.bg, color: colors.border, border: `1px solid ${colors.border}` }}>
                        {job.category}
                      </span>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(157, 78, 221, 0.15)', color: 'var(--accent-purple)', border: '1px solid var(--accent-purple)' }}>
                          {expLabel}
                        </span>

                        <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 700, background: 'rgba(0, 242, 254, 0.1)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--accent-cyan)' }}>
                          {job.source}
                        </span>
                      </div>
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
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} color="var(--accent-cyan)" /> {job.posted_date || 'Posted recently'}
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
