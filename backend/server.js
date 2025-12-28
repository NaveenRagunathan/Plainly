import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Route imports
import authRoutes from './src/routes/auth.js';
import subscriberRoutes from './src/routes/subscribers.js';
import sequenceRoutes from './src/routes/sequences.js';
import broadcastRoutes from './src/routes/broadcasts.js';
import landingPageRoutes from './src/routes/landingPages.js';
import analyticsRoutes from './src/routes/analytics.js';
import paymentRoutes from './src/routes/payments.js';
import trackingRoutes from './src/routes/tracking.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Stripe webhook needs raw body, so handle it before json middleware
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/sequences', sequenceRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/landing-pages', landingPageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/track', trackingRoutes);
app.use('/api/unsubscribe', trackingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start job processor if Redis is available
async function startJobProcessor() {
  try {
    const { startSequenceProcessor } = await import('./src/jobs/queueProcessor.js');
    await startSequenceProcessor();
    console.log('✅ Job processor started');
  } catch (error) {
    console.warn('⚠️ Job processor not started (Redis may not be available):', error.message);
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Plainly server running on port ${PORT}`);
  // Start job processor after server is up
  startJobProcessor();
});

export default app;

