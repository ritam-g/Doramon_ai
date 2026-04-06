import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser'
import morgan from 'morgan';
import chatRouter from './routes/chat.route.js';
import fileRouter from './routes/file.route.js';
import userRouter from './routes/user.route.js';
import { errorHandler } from './middleware/error.middleware.js';
import path from 'path'
import fs from 'fs';
import { fileURLToPath } from 'url';
// Load environment variables from .env file
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseAllowedOrigins(value = '') {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const allowedOrigins = parseAllowedOrigins(process.env.CLIENT_URL || '');
const corsOptions = {
  origin(origin, callback) {
    // Allow tools like curl/Postman and same-origin requests with no origin header.
    if (!origin) {
      return callback(null, true);
    }

    // If CLIENT_URL is not set, allow all origins (useful for local development).
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

// Render and other reverse proxies need this for secure cookie handling.
app.set('trust proxy', 1);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(morgan("dev"))

const projectRoot = path.resolve(__dirname, '../../');
const clientBuildCandidates = [
  process.env.CLIENT_BUILD_DIR
    ? path.resolve(projectRoot, process.env.CLIENT_BUILD_DIR)
    : null,
  path.resolve(projectRoot, 'Frontend/dist'),
].filter(Boolean);

const clientBuildDir = clientBuildCandidates.find((candidate) =>
  fs.existsSync(path.join(candidate, 'index.html'))
);
const clientIndexFile = clientBuildDir
  ? path.join(clientBuildDir, 'index.html')
  : null;

if (clientBuildDir) {
  app.use(express.static(clientBuildDir));
}


// NOTE - Routers
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});
app.use('/api/auth', authRouter);
app.use('/api/chats', chatRouter)
app.use("/api/files", fileRouter);
// User profile routes live under /api/users, including PATCH /api/users/profile.
app.use('/api/users', userRouter)

app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// SPA fallback for React Router in production.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }

  if (!clientIndexFile) {
    return res.status(404).json({
      success: false,
      message: 'Frontend build not found. Set CLIENT_BUILD_DIR or build Frontend/dist before starting the server.',
    });
  }

  return res.sendFile(clientIndexFile);
});

// Error handling middleware
app.use(errorHandler);

export default app;
