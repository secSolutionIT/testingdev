import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRoutes from './api/auth.js';
import scanRoutes from './api/scans.js';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Connected to database');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();