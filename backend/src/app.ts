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

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || env.corsOrigins.includes(origin) || env.corsOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Cookie parser (for httpOnly JWT cookie)
app.use(cookieParser());

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Personal Org API Docs',
}));

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
