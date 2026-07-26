import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDb } from './config/database.js';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import { initScheduler } from './services/schedulerService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Loading .env...');
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

if (!process.env.EMAIL_USER) {
  console.warn('EMAIL_USER not found');
}
if (!process.env.EMAIL_PASS) {
  console.warn('EMAIL_PASS not found');
}

console.log('Loading Gmail SMTP...');
console.log('Connecting...');

import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Mounting API Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Serve Production Frontend Dist files
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
const rootDistPath = path.resolve(__dirname, '../../dist');
const rootPath = path.resolve(__dirname, '../../');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}
if (fs.existsSync(rootDistPath)) {
  app.use(express.static(rootDistPath));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Kronos AI CRM Engine',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Fallback to index.html for single page application routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  let indexPath = null;
  if (fs.existsSync(path.join(frontendDistPath, 'index.html'))) {
    indexPath = path.join(frontendDistPath, 'index.html');
  } else if (fs.existsSync(path.join(rootDistPath, 'index.html'))) {
    indexPath = path.join(rootDistPath, 'index.html');
  }

  if (indexPath) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Kronos AI CRM - Production build missing. Run npm run build.');
  }
});

// Initialize Database & Start Express Server
initDb()
  .then(() => {
    console.log('✅ Database initialization complete.');
    initScheduler();

    app.listen(PORT, () => {
      console.log(`
=========================================================
⚡ KRONOS AI CRM - BACKEND & FRONTEND ENGINE RUNNING
=========================================================
📡 Full App URL : http://localhost:${PORT}
🚀 Health Check : http://localhost:${PORT}/health
📊 API Base     : http://localhost:${PORT}/api
=========================================================
      `);
    });
  })
  .catch((err) => {
    console.error('❌ Server startup aborted due to DB failure:', err);
  });
