// IMPORTANT: Load environment variables FIRST before any imports that use them
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
dotenv.config({ path: join(__dirname, '..', '.env') });

// Now import other modules that depend on env vars
import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.js';
import sessionRoutes from './routes/session.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Continuum AI Companion API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/session', sessionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Continuum AI Companion Backend                  ║
║                                                       ║
║   Server running on: http://localhost:${PORT}        ║
║   Environment: ${process.env.NODE_ENV || 'development'}                    ║
║   Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}           ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
