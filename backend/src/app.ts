import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { csrfProtection } from './middleware/csrfProtection.js';

const app = express();

// Security headers — Helmet with full protection (CSP enabled)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for Swagger UI
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openrouter.ai"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin || env.corsOrigins.includes(origin) || env.corsOrigins.includes('*')) {
      callback(null, true);
    } else {
      // In development, be more permissive
      if (env.nodeEnv !== 'production') {
        callback(null, true);
      } else {
        console.warn(`[SECURITY] CORS blocked origin: ${origin}`);
        callback(null, false);
      }
    }
  },
  credentials: true,
}));

// HSTS — enforce HTTPS in production (only over TLS)
if (env.nodeEnv === 'production') {
  app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    next();
  });
}

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie parser (for httpOnly JWT cookie)
app.use(cookieParser());

// CSRF Protection — for state-changing requests using cookies
app.use('/api/', csrfProtection);

// Rate limiting
app.use('/api/', apiLimiter);

// Swagger
const isProduction = env.nodeEnv === 'production';
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Personal Organization API',
      version: '1.0.0',
      description: 'API de organização pessoal — tarefas, notas e autenticação',
      contact: {
        name: 'mvdevelop',
      },
    },
    servers: [
      { url: `http://localhost:${env.port}`, description: 'Development' },
      ...(isProduction ? [{ url: env.corsOrigin.replace(/\/$/, ''), description: 'Production' }] : []),
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
});

// Swagger — only in development (prevents info disclosure in production)
if (env.nodeEnv !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Personal Org API Docs',
  }));
}

// Root — status do backend (mounted at /api by Vercel)
app.get('/', (_req, res) => {
  res.json({
    message: '🚀 Backend do Personal Organization está rodando!',
    version: '1.0.0',
    health: '/health',
    timestamp: new Date().toISOString(),
  });
});

// Health check (also under /api from Vercel)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
