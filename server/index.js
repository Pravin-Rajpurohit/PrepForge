import dotenv from 'dotenv';
dotenv.config();
console.log('ATLAS_URI:', process.env.ATLAS_URI);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'express-async-errors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Routes (will be added here)
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.send('AI Mock Interview Platform API is running');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;

const dbUri = process.env.ATLAS_URI || process.env.MONGO_URI;

// Connect to MongoDB
if (!dbUri) {
  throw new Error('ATLAS_URI or MONGO_URI environment variable is not defined');
}

mongoose.connect(dbUri)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
