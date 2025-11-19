import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import Router from './src/routes/index.routes.js';
import authRoutes from './src/routes/auth.routes.js'; // optional placeholder if you'll implement social auth

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Serve frontend static files from publicc
const publicDir = path.join(process.cwd(), 'publicc');
app.use(express.static(publicDir));

// API routes
app.use('/api', Router);

// Optional placeholder auth routes (OAuth) — implement separately if needed
app.use('/auth', authRoutes);

// Fallback: serve index
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});