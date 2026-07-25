import Anthropic from '@anthropic-ai/sdk';
import { getOne } from '../config/database.js';

/**
 * Get Anthropic Client initialized with user setting or env key
 */
const getAnthropicClient = async () => {
  const setting = await getOne(`SELECT value FROM settings WHERE key = 'claude_api_key'`);
  const apiKey = setting?.value || process.env.CLAUDE_API_KEY;
  if (apiKey && apiKey.trim().length > 10) {
    return new Anthropic({ apiKey });
  }
  return null;
};

/**
 * Analyze Job description against candidate profile to calculate Match Score % and key requirements
 */
export const analyzeJobWithAI = async (jobDescription, jobTitle, candidateProfile) => {
  const client = await getAnthropicClient();

  if (client) {
    try {
      const prompt = `
You are Kronos AI, an elite career match score algorithm.
Analyze the following Job Posting against the Candidate Profile.

JOB TITLE: ${jobTitle || 'N/A'}
JOB DESCRIPTION: ${jobDescription}

CANDIDATE PROFILE:
- Full Name: ${candidateProfile?.full_name || 'Candidate'}
- Target Domain: ${candidateProfile?.target_domain || 'Software'}
- Experience: ${candidateProfile?.experience_years || 0} years
- Technical/Domain Skills: ${candidateProfile?.skills || 'N/A'}
- Resume Summary: ${candidateProfile?.resume_summary || candidateProfile?.resume_text || 'N/A'}

Provide your evaluation strictly as a valid JSON object with the following fields:
{
  "match_score": <number between 0 and 100>,
  "rationale": "<2-3 sentence summary of why candidate matches>",
  "key_skills_found": ["<skill1>", "<skill2>", ...],
  "missing_skills": ["<skill1>", "<skill2>", ...],
  "job_category": "<Software|Mechanical|Electrical|Civil|Business|Data Science|Finance|Healthcare|Other>",
  "recommendations": ["<tip1>", "<tip2>"]
}
`;
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      });

      const text = response.content[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.warn('⚠️ Anthropic API call failed or unconfigured, falling back to smart heuristic:', err.message);
    }
  }

  // Fallback Smart Heuristic Scoring Engine
  return heuristicAnalyzeJob(jobDescription, jobTitle, candidateProfile);
};

/**
 * Heuristic Match Scoring Fallback Engine
 */
const heuristicAnalyzeJob = (jobDesc, jobTitle, profile) => {
  const text = `${jobTitle || ''} ${jobDesc || ''}`.toLowerCase();
  const profileSkills = (profile?.skills || 'react, node, python, javascript, cad, design, management, sql').toLowerCase().split(/,\s*/);
  
  let matchedCount = 0;
  const foundSkills = [];
  const missingSkills = [];

  profileSkills.forEach(skill => {
    if (skill.trim() && text.includes(skill.trim())) {
      matchedCount++;
      foundSkills.push(skill.trim());
    }
  });

  const domain = profile?.target_domain || 'Software';
  const domainKeywords = {
    Software: ['code', 'developer', 'react', 'node', 'api', 'python', 'software', 'cloud', 'database'],
    Mechanical: ['cad', 'solidworks', 'mechanical', 'robotics', 'mechatronics', 'cnc', 'thermal', 'manufacturing'],
    Electrical: ['pcb', 'circuit', 'embedded', 'electrical', 'voltage', 'altium', 'microcontroller', 'power'],
    Civil: ['autocad', 'revit', 'structural', 'construction', 'bim', 'civil', 'concrete', 'infrastructure'],
    Business: ['b2b', 'sales', 'marketing', 'strategy', 'finance', 'business', 'growth', 'operations'],
    'Data Science': ['python', 'pytorch', 'machine learning', 'data', 'sql', 'analytics', 'pandas', 'models']
  };

  const domainList = domainKeywords[domain] || domainKeywords.Software;
  let domainMatches = 0;
  domainList.forEach(k => {
    if (text.includes(k)) domainMatches++;
  });

  const baseScore = Math.min(98, Math.max(55, 60 + matchedCount * 8 + domainMatches * 4));
  
  // Categorize
  let category = domain;
  if (text.includes('mechanical') || text.includes('solidworks')) category = 'Mechanical';
  else if (text.includes('electrical') || text.includes('pcb')) category = 'Electrical';
  else if (text.includes('civil') || text.includes('revit') || text.includes('structural')) category = 'Civil';
  else if (text.includes('b2b') || text.includes('growth') || text.includes('sales')) category = 'Business';
  else if (text.includes('machine learning') || text.includes('pytorch') || text.includes('data scientist')) category = 'Data Science';

  return {
    match_score: baseScore,
    rationale: `Strong alignment detected for ${jobTitle || 'role'} in ${category} domain based on matching core skills (${foundSkills.join(', ') || 'technical proficiency'}) and experience background.`,
    key_skills_found: foundSkills.length > 0 ? foundSkills : ['Problem Solving', 'Domain Expertise', 'Team Collaboration'],
    missing_skills: ['Agile Project Management', 'Cloud Infrastructure Optimization', 'Advanced Enterprise Workflows'],
    job_category: category,
    recommendations: [
      'Highlight specific project deliverables in your outreach email.',
      'Tailor your resume bullet points to emphasize relevant domain achievements.'
    ]
  };
};

/**
 * Generate Hyper-Personalized Cold Outreach Email
 */
export const generateColdEmailWithAI = async ({ job, profile, templateType = 'Technical', customPrompt = '' }) => {
  const client = await getAnthropicClient();

  if (client) {
    try {
      const prompt = `
You are Kronos AI, an expert executive recruiter & career agent.
Generate a hyper-personalized cold outreach email from candidate to recruiter.

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Description Summary: ${job.description}
- Recruiter Name: ${job.recruiter_name || 'Hiring Manager'}

CANDIDATE DETAILS:
- Name: ${profile.full_name || 'Candidate'}
- Target Domain: ${profile.target_domain || 'Engineering'}
- Years Experience: ${profile.experience_years || '4'}
- Top Skills: ${profile.skills}
- Resume Highlights: ${profile.resume_summary || profile.resume_text}

EMAIL TEMPLATE STYLE: ${templateType} (Formal / Technical / Startup / Casual / Executive)
CUSTOM NOTES: ${customPrompt}

Return strictly a valid JSON object:
{
  "subject": "<Compelling Email Subject Line>",
  "body": "<Complete email body with placeholders filled, ready to copy/send>"
}
`;
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }]
      });

      const text = response.content[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.warn('⚠️ Claude API call failed, generating email via local engine:', err.message);
    }
  }

  // Fallback Local Generator
  const candidateName = profile?.full_name || 'Alex Vance';
  const recruiterName = job.recruiter_name || 'Hiring Team';
  const company = job.company || 'Innovators Inc';
  const title = job.title || 'Specialist Role';
  const domain = profile?.target_domain || 'Engineering';

  let subject = `Application / Inquiry: ${title} at ${company} - ${candidateName}`;
  let greeting = `Dear ${recruiterName},`;

  if (templateType === 'Startup') {
    subject = `Fast-growing ${domain} talent interested in ${company}'s ${title} role`;
    greeting = `Hi ${recruiterName},`;
  } else if (templateType === 'Casual') {
    subject = `Quick note regarding the ${title} opening at ${company}`;
    greeting = `Hey ${recruiterName},`;
  } else if (templateType === 'Executive') {
    subject = `Strategic Inquiry: ${title} - ${candidateName}`;
    greeting = `Dear ${recruiterName},`;
  } else if (templateType === 'Technical') {
    subject = `Technical Candidate: ${title} (${profile?.skills?.split(',')[0] || 'Core Stack'}) - ${candidateName}`;
    greeting = `Hello ${recruiterName},`;
  }

  const body = `${greeting}

I noticed the ${title} position at ${company} and wanted to reach out directly. With over ${profile?.experience_years || 4} years of focused experience in ${domain} (specializing in ${profile?.skills || 'scalable system architecture, execution, and analytical solutions'}), I am confident I can make an immediate high-value impact on your team.

At my previous position, I led high-stakes projects delivering robust outcomes, optimizing workflows, and driving system efficiency. Given ${company}'s current trajectory, my expertise in ${job.key_skills || profile?.skills || 'domain execution'} directly matches what you are looking for.

I would love to schedule a brief 10-minute conversation to discuss how my background aligns with your engineering and strategic goals.

Thank you for your time and consideration.

Best regards,

${candidateName}
Email: ${profile?.email || 'candidate@kronos-ai.io'}
Phone: ${profile?.phone || '+91 98765 43210'}
Location: ${profile?.location || 'Bengaluru, India'}`;

  return { subject, body };
};
