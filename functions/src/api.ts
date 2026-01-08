import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import adminRoutes from './routes/admin.routes.js';
import driverRoutes from './routes/driver.routes.js';
import syncRoutes from './routes/sync.routes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for mobile apps
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (PDFs)
app.use('/storage/pdfs', express.static(join(__dirname, '../../storage/pdfs')));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Inex API is running' });
});

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/sync', syncRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);
