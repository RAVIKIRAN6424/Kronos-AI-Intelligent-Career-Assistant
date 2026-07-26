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

if (!process.env.RESEND_API_KEY) {
  console.error('❌ ERROR: RESEND_API_KEY is missing from environment variables!');
} else {
  console.log('✅ RESEND_API_KEY validated.');
}

if (!process.env.RESEND_FROM_EMAIL) {
  console.warn('⚠️ WARNING: RESEND_FROM_EMAIL is not set in environment variables! Defaulting to "Kronos AI <onboarding@resend.dev>". For production custom domain sending, set RESEND_FROM_EMAIL=no-reply@yourdomain.com');
} else {
  console.log(`✅ RESEND_FROM_EMAIL configured: ${process.env.RESEND_FROM_EMAIL}`);
}

import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 8080;

// CORS Configuration for Render Backend <-> Vercel Frontend
const allowedOrigins = [
  'https://kronos-ai-intelligent-career-assist.vercel.app',
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.options('*', cors());

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
