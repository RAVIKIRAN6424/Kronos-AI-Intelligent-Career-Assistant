import cron from 'node-cron';
import { getOne, query } from '../config/database.js';
import { scrapeLiveJobs } from './scraperService.js';

let cronTask = null;
let isSchedulerRunning = false;

/**
 * Initialize background cron task
 */
export const initScheduler = async () => {
  const autoScrapeSetting = await getOne(`SELECT value FROM settings WHERE key = 'auto_scraper_enabled'`);
  const intervalSetting = await getOne(`SELECT value FROM settings WHERE key = 'scraper_interval_hours'`);

  if (autoScrapeSetting?.value === 'true') {
    startScheduler(parseInt(intervalSetting?.value || '24'));
  }
};

/**
 * Start cron scheduler with custom interval in hours
 */
export const startScheduler = (hours = 24) => {
  stopScheduler();

  // Convert hours to cron expression (e.g., every X hours)
  const cronExpr = hours >= 24 ? '0 0 * * *' : `0 */${Math.max(1, hours)} * * *`;
  console.log(`⏰ Starting Node-Cron Scheduler (Cron Expression: "${cronExpr}")`);

  cronTask = cron.schedule(cronExpr, async () => {
    console.log('🔄 Running automated scheduled job scraper execution...');
    try {
      const profile = await getOne(`SELECT * FROM profile WHERE id = 1`);
      const keywords = profile?.target_titles?.split(',')[0] || 'Engineer';
      const location = profile?.preferred_locations?.split(',')[0] || 'Bengaluru, India';
      const category = profile?.target_domain || 'Software';

      await scrapeLiveJobs({ keywords, location, category, max_pages: 1 });
    } catch (err) {
      console.error('❌ Scheduler task error:', err.message);
    }
  });

  
  // Automated Email Reporting Task (Checks every minute)
  cron.schedule('* * * * *', async () => {
    try {
      const profile = await getOne(`SELECT * FROM profile WHERE id = 1`);
      if (profile && profile.report_enabled === 1 && profile.report_email) {
        const now = new Date();
        const currentHHMM = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        
        if (currentHHMM === profile.report_time) {
          console.log(`✉️ Automated reporting triggered for ${profile.report_email} at ${currentHHMM}`);
          const { sendDailyJobReport } = await import('./emailService.js');
          
          // Get jobs applied today
          const todayStr = new Date().toISOString().split('T')[0];
          const jobs = await query(`SELECT * FROM jobs WHERE status = 'Applied' AND created_at >= ?`, [todayStr + ' 00:00:00']);
          
          const reportData = {
            date: new Date().toLocaleDateString('en-US', { dateStyle: 'medium' }),
            jobs: jobs.map(j => ({
              portal: j.source || 'Kronos',
              company: j.company,
              role: j.title,
              resume: 'Profile Default',
              status: j.status
            }))
          };
          
          // Attach resume if present
          let pdfAttachment = null;
          if (profile.resume_text) {
             pdfAttachment = Buffer.from(profile.resume_text);
          }
          
          await sendDailyJobReport(profile.report_email, profile.full_name || 'User', reportData, pdfAttachment);
          console.log('✅ Automated daily report sent successfully.');
        }
      }
    } catch (err) {
      console.error('❌ Email Reporting Scheduler task error:', err.message);
    }
  });

  isSchedulerRunning = true;
  return true;
};

/**
 * Stop cron scheduler
 */
export const stopScheduler = () => {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    console.log('⏸️ Node-Cron Scheduler paused.');
  }
  isSchedulerRunning = false;
};

/**
 * Get Scheduler Status
 */
export const getSchedulerStatus = () => {
  return { running: isSchedulerRunning };
};
