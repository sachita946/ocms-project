import express from 'express';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import cors from 'cors';
import apiRouter from './src/routes/index.routes.js';
import './src/config/passport.js';
import fileUpload from 'express-fileupload';

const app = express();
const __dirname = process.cwd();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://your-production-domain.com']
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow same-origin/no-origin (e.g., curl/postman)
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Session for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'ocms-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set to true in production with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload());

app.use('/api', apiRouter);

// Serve static files
app.use('/', express.static(path.join(__dirname, 'publicc')));
app.use('/uploads', express.static(path.join(__dirname, 'publicc/uploads')));
app.use('/background', express.static(path.join(__dirname, 'publicc/background')));

// SPA fallback — use a RegExp to match any path (avoids path-to-regexp '*' parsing error)
app.get(/^\/publicc\/.*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'publicc', 'index.html'), (err) => {
    if (err) res.status(404).send('Not found');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));