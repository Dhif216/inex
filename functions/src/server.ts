import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import driverRoutes from './routes/driver.routes';
import adminRoutes from './routes/admin.routes';
import syncRoutes from './routes/sync.routes';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../public')));

// Serve PDF files from storage
app.use('/storage/pdfs', express.static(path.join(__dirname, '../storage/pdfs')));

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist/client')));
}

// API Routes
app.use('/api/driver', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/verify', driverRoutes); // Verification endpoint

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Serve frontend pages
app.get('/', (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../dist/client/index.html'));
  } else {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});

app.get('/driver', (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../dist/client/index.html'));
  } else {
    res.redirect('http://localhost:5173/driver');
  }
});

app.get('/admin', (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../dist/client/index.html'));
  } else {
    res.redirect('http://localhost:5173/admin');
  }
});

app.get('/verify', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/verify.html'));
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   Pickup Management System                    ║
║   Server running on http://localhost:${PORT}    ║
╚═══════════════════════════════════════════════╝

Environment: ${process.env.NODE_ENV || 'development'}

Driver Portal:  http://localhost:${PORT}/
Admin Dashboard: http://localhost:${PORT}/admin

API Endpoints:
  - POST /api/driver/reserve
  - GET  /api/driver/check/:ref
  - GET  /api/admin/pickups
  - GET  /api/admin/pickups/today
  - POST /api/admin/confirm-loading/:id
  - POST /api/sync/outlook
  - GET  /api/sync/status
  `);
});

// Handle server errors
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop other servers or change the PORT in .env`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

// Keep process alive
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
