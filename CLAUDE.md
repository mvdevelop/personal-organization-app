# OrgApp — Arquitetura e Guia de Refactor

## Visão Geral

Este documento descreve a estratégia de refactoring do **OrgApp** para transformar um monólito de arquitetura monolítica em uma aplicação moderna, escalável e modular. Este projeto serve como um exemplo abrangente das habilidades de um desenvolvedor junior/pleno, demonstrando:

- Design patterns e arquiteturas escalonáveis
- Boas práticas de codificação e qualidade de software
- Testes abrangentes e documentação
- Integração de CI/CD e observabilidade
- Colaboração entre frontend e backend

## Estratégia de Arquitetura

### 1. Estrutura em Microsserviços

#### Backend como Microsserviços

**Frontend (React + TypeScript):**
- `src/`
  - `components/` → Componentes reutilizáveis
  - `features/` → Módulos de domínio (tasks, notes, habits, goals, studies, ai, gamification)
  - `pages/` → Views principais
  - `hooks/` → Hooks personalizados
  - `services/` → Clientes de API e utilitários
  - `store/` → State management (Redux Toolkit)
  - `context/` → Contexts de autenticação e tema
  - `theme/` → Systemas de design e temas
  - `utils/` → Funções auxiliares e segurança

**Backend (Node.js + TypeScript):**
- `src/`
  - `api/` → Handlers para Vercel
  - `gateway/` → API Gateway Express (middleware de auth, rate limiting, logging)
  - `services/` → Microsserviços:
    - `auth/` → Autenticação e JWTs
    - `tasks/` → Gestão de tarefas
    - `notes/` → Gestão de notas
    - `habits/` → Sistema de hábitos
    - `goals/` → Gestão de metas
    - `studies/` → Sistema de estudos
    - `domains/` → Gestão de domínios/categorias
    - `gamification/` → Sistema de XP, níveis e conquistas
    - `ai/` → 🤖 Cliente OpenRouter
    - `dashboard/` → Analytics e agregação de dados
  - `models/` → Schemas Mongoose
  - `validators/` → Validação Zod
  - `middleware/` → Autenticação, rate limiting, tratamento de erros
  - `utils/` → Utilitários, segurança e logging

#### Arquitetura de Containers

```yaml
# docker-compose.yml
version: '3.8'
services:
  # API Gateway
  gateway:
    build: ./backend
    command: node dist/gateway/server.js
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/orgapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    networks:
      - app-network
      - monitoring

  # Microsserviços
  auth-service:
    build: ./backend/services/auth
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
    networks:
      - app-network

  tasks-service:
    build: ./backend/services/tasks
    environment:
      - NODE_ENV=production
    networks:
      - app-network

  # ... outros serviços

  # Banco de dados
  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    networks:
      - app-network

  # Prometheus + Grafana para monitoramento
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - monitoring

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - monitoring

volumes:
  mongo-data:
  grafana-data:

networks:
  app-network:
    driver: bridge
  monitoring:
    driver: bridge
```

### 2. Middleware e Segurança Avançada

#### Pipeline de Request Middleware

```typescript
// middleware/requestLogger.ts
import { createLogger } from '../utils/winstonLogger.js';
import { NextFunction, Request, Response } from 'express';

const logger = createLogger('request');

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: (req as any).user?.id,
      requestId: req.get('X-Request-ID'),
    };
    
    if (res.statusCode >= 500) {
      logger.error('Request failed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Request error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });
  
  next();
};
```

#### Validação e Sanitização Abrangente

```typescript
// middleware/validation.ts
import DOMPurify from 'dompurify';
import { body, param, query } from 'express-validator';
import { validate } from '../utils/validator.js';
import { Request, Response, NextFunction } from 'express';

export const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .isLength({ min: 1, max: 200 })
    .escape(),
  body('description')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 1000 }),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']),
  body('dueDate')
    .optional()
    .isISO8601()
    .toDate(),
  // Sanitize HTML content
  body('description').custom((value) => {
    if (value && value.includes('<script>')) {
      throw new Error('Conteúdo malformado detectado');
    }
    return DOMPurify.sanitize(value || '');
  }),
  validate,
];
```

### 3. Gateway de API com Service Discovery

```typescript
// gateway/server.ts
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from './middleware/auth.js';
import { rateLimiters } from './middleware/rateLimiting.js';
import { Request, Response, NextFunction } from 'express';

const app = express();

// Global middleware
app.use(express.json({ limit: '10mb' }));
app.use(authMiddleware);
app.use('/api/', rateLimiters.api);

// Service registry with health checks
const serviceRegistry = {
  'auth': { url: 'http://auth-service:3001', health: '/health' },
  'tasks': { url: 'http://tasks-service:3002', health: '/health' },
  // ... outros serviços
};

// Health check endpoint
app.get('/gateway/health', async (req: Request, res: Response): Promise<void> => {
  const health = {};
  for (const [name, service] of Object.entries(serviceRegistry)) {
    try {
      const response = await fetch(`${service.url}${service.health}`);
      health[name] = response.ok ? 'healthy' : 'unhealthy';
    } catch {
      health[name] = 'unhealthy';
    }
  }
  res.json({ status: 'ok', services: health });
});

// Dynamic routing based on service registry
function proxyMiddleware(serviceName: string): any {
  const service = serviceRegistry[serviceName];
  if (!service) {
    return (req: Request, res: Response, next: NextFunction): void => {
      res.status(404).json({ error: 'Serviço não encontrado' });
    };
  }
  
  return createProxyMiddleware({
    target: service.url,
    changeOrigin: true,
    onProxyReq: (proxyReq: any, req: Request, res: Response) => {
      // Add authentication headers
      if (req.headers.authorization) {
        proxyReq.setHeader('Authorization', req.headers.authorization);
      }
      // Add request ID for tracing
      proxyReq.setHeader('X-Request-ID', req.get('X-Request-ID') || crypto.randomUUID());
    },
    onError: (err: Error, req: Request, res: Response) => {
      console.error('Proxy error:', err);
      res.status(500).json({ 
        error: 'Erro interno do proxy',
        requestId: req.get('X-Request-ID'),
      });
    },
  });
}

// Route כל בקשה ל-microservice המתאים
app.use('/api/auth/', proxyMiddleware('auth'));
app.use('/api/tasks/', proxyMiddleware('tasks'));
app.use('/api/notes/', proxyMiddleware('notes'));

export default app;
```

## Sistema de Logs e Observabilidade

### Winston para Logging Estruturado

```typescript
// utils/winstonLogger.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.prettyPrint(),
  ),
  defaultMeta: { service: 'orgapp' },
  transports: [
    // Logs de erro para arquivo
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
    }),
    // Todos os logs para arquivo
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
    }),
    // Console para ambiente de desenvolvimento
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  ],
});

export { logger };
```

### Tracing Distribuído

```typescript
// middleware/tracing.ts
import { trace, metrics } from '@opentelemetry/api';

export const tracingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const tracer = trace.getTracer('orgapp-tracer');
  const span = tracer.startSpan('http-request', {
    attributes: {
      'http.method': req.method,
      'http.url': req.url,
      'http.user_agent': req.get('User-Agent'),
      'network.protocol': req.protocol,
      'network.host': req.get('Host'),
    },
  });
  
  const requestId = req.get('X-Request-ID') || crypto.randomUUID();
  (req as any).span = span;
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  // Record metrics
  const counter = metrics.getMeter('orgapp-meter').createCounter('http.requests', {
    description: 'Número de requisições HTTP',
  });
  
  res.on('finish', () => {
    span.setAttributes({
      'http.status_code': res.statusCode,
      'http.duration': Date.now() - parseInt(res.getHeader('X-Request-Start') as string || '0'),
    });
    
    counter.add(1, {
      'http.method': req.method,
      'http.status_code': res.statusCode,
      'http.route': req.route?.path || req.path,
    });
    
    span.end();
  });
  
  next();
};
```

## Configuração do Frontend como Módulos

### Modalidades de Feature Modules

```typescript
// src/features/tasks/
├── index.ts (re-exports)
├── store/ (Redux Toolkit slice)
├── api/ (clients de API)
├── components/ (componentes específicos do domínio)
├── hooks/ (hooks personalizados do domínio)
├── types/ (interfaces específicas do domínio)
└── utils/ (funções auxiliares do domínio)

// src/features/gamification/
├── components/ (painel de gamificação)
├── store/ (slice de gamificação)
└── hooks/ (hooks de XP e níveis)
```

### Sistema de Roteamento Baseado em Módulos

```typescript
// router/featureRoutes.ts
import { lazy, LazyRoute } from './lazyRoutes.js';

export const featureRoutes: LazyRoute[] = [
  {
    path: '/tasks',
    component: lazy(() => import('../features/tasks/pages/TaskPage')),
    loader: () => import('../features/tasks/store/').then(m => m.fetchTasks()),
    chunk: 'tasks-chunk',
  },
  {
    path: '/habits',
    component: lazy(() => import('../features/habits/pages/HabitPage')),
    loader: () => import('../features/habits/store/').then(m => m.fetchHabits()),
    chunk: 'habits-chunk',
  },
  // ... outros módulos de features
];
```

### Provedor de Carga Adiável com Pré-carregamento

```typescript
// router/lazyRoutes.ts
import React, { Suspense } from 'react';
import { RouteObject } from 'react-router-dom';

function lazyImport<T extends Record<string, React.ComponentType>>(importFn: () => Promise<T>): T {
  return React.lazy(importFn as any) as T;
}

export function createLazyRoute(path: string, importFn: () => Promise<any>, preload?: () => Promise<any>): RouteObject {
  return {
    path,
    element: (
      <Suspense fallback={<div className="loading">Carregando...</div>}>
        {React.createElement(lazyImport(importFn))}
      </Suspense>
    ),
    loader: preload || (() => Promise.resolve(null)),
  };
}
```

## Testes e Validação

### Configuração do Jest com TypeScript

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/backend/tests', '<rootDir>/frontend/tests'],
  modulePathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/build'],
  collectCoverageFrom: [
    'backend/src/**/*.ts',
    'frontend/src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
};
```

### Clientes de API Testáveis

```typescript
// tests/mocks/apiClient.ts
import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/node';

export const handlers = [
  http.get('/api/tasks', () => {
    return HttpResponse.json([
      { id: '1', title: 'Tarefa de teste', completed: false, priority: 'medium' },
    ]);
  }),
  // ... outras simulações
];

export const worker = setupWorker(...handlers);
```

## Pipelines de CI/CD

### GitHub Actions com Fluxo de Trabalho Completo

```yaml
# .github/workflows/quality.yml
name: Quality Checks

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [backend, frontend]

    services:
      mongo:
        image: mongo:7
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
          cache-dependency-path: |
            backend/package-lock.json
            frontend/package-lock.json

      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd frontend && npm ci

      - name: Lint
        run: |
          cd backend && npm run lint
          cd frontend && npm run lint

      - name: TypeScript
        run: |
          cd backend && npx tsc --noEmit
          cd frontend && npx tsc -b --noEmit

      - name: Test
        run: |
          cd backend && npm test
          cd frontend && npm test

      - name: Build
        run: |
          cd frontend && npm run build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Dependências seguras
        run: |
          cd backend && npm audit --audit-level=high
          cd frontend && npm audit --audit-level=high

      - name: SonarCloud
        uses: sonarsource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  # Deploy to staging (apenas pull requests)
  deploy-staging:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel (Backend)
        uses: amin-ahmady/vercel-deploy@v1.7.1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-scope: ${{ secrets.VERCEL_SCOPE }}
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Deploy to Vercel (Frontend)
        uses: amin-ahmady/vercel-deploy@v1.7.1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}-frontend
          vercel-scope: ${{ secrets.VERCEL_SCOPE }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Ferramentas de Qualidade de Código

```yaml
# .github/workflows/quality.yml - seção adicional
name: Code Quality Checks

jobs:
  codeql:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript, go

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Instalar dependências
        run: |
          cd backend && npm ci
          cd frontend && npm ci

      - name: ESLint
        run: |
          cd backend && npx eslint src/
          cd frontend && npx eslint src/

      - name: Prettier
        run: |
          cd backend && npx prettier --check src/
          cd frontend && npx prettier --check src/

      - name: Tipo Mistmatch da ESLint
        run: |
          cd backend && npx tsc --noEmit
          cd frontend && npx tsc -b --noEmit
```

## Documentação

### README Gerado por Docstrings (Versão API)

```typescript
/**
 * Gerencia tarefas do usuário
 * @namespace api.tasks
 * @api {get} /api/tasks Obter todas as tarefas
 * @apiParam {string} [filter] Filtrar tarefas ('all', 'active', 'completed')
 * @apiParam {string} [search] Pesquisar tarefas
 * @apiSuccess {Object[]} tasks Lista de tarefas
 * @apiSuccessExample {json} Sucesso:
   [
     {
       "id": "task_123",
       "title": "Minha tarefa",
       "description": "Descrição da tarefa",
       "completed": false,
       "priority": "medium",
       "dueDate": "2024-02-01T00:00:00.000Z",
       "userId": "user_456",
       "createdAt": "2024-01-15T10:00:00.000Z",
       "updatedAt": "2024-01-15T10:00:00.000Z"
     }
   ]
 */nexport async function listTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  // implementação
}
```

### Documentação de API com Swagger

```yaml
# swagger.yaml (gerado programaticamente)
swagger: '3.0.0'
info:
  title: OrgApp API
  description: API moderna e escalável para organização pessoal
  version: '1.0.0'
  contact:
    name: mvdevelop
    email: developer@example.com
  license:
    name: MIT

servers:
  - url: http://localhost:3001/api
    description: Servidor de desenvolvimento
  - url: https://api.orgapp.com/api
    description: Servidor de produção

tags:
  - name: Autenticação
    description: Operações de autenticação e registro
  - name: Tarefas
    description: Gestão de tarefas
  - name: Hábitos
    description: Rastreamento e registro de hábitos
  - name: Metas
    description: Gestão de metas financeiras e de vida
  - name: Estudos
    description: Gerenciamento de matérias e sessões de estudo
  - name: Gamificação
    description: Sistema de níveis, XP e conquistas
  - name: IA
    description: Chatbot assistente pessoal

paths:
  /api/auth/register:
    post:
      tags: [Autenticação]
      summary: Registrar novo usuário
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterInput'
      responses:
        201:
          description: Usuário criado com sucesso
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          description: ID único do usuário
        name:
          type: string
          description: Nome completo do usuário
        email:
          type: string
          format: email
          description: Endereço de email do usuário
        createdAt:
          type: string
          format: date-time
          description: Data e hora de criação
    AuthResponse:
      type: object
      properties:
        user:
          $ref: '#/components/schemas/User'
        token:
          type: string
          description: Token JWT para autenticação
```

## Guia de Contribuição

### Convenções de Commit

```bash
# Commits de features
feat: nome da feature (ex: add gamification dashboard)
feat: modificar existing UI
feat: adicionar nova API endpoint

# Commits de correção de bugs
fix: corrigir bug no sistema de hábitos
fix: resolver problema de leak de memória no backend

# Commits de refatoração
refactor: reestruturar serviços em microsserviços
refactor: extrair módulo de frontend
refactor: renomear variáveis de instanciais

# Commits de documentação
docs: adicionar documentação de API
perf: melhorar desempenho do módulo de estudos
```

### Estilo de Commit com Emoji

```bash
# Geral
e 🗂️ :commit: Descrição do commit
✨ :sparkles: Nova funcionalidade
🐛 :bug: Correção de bug
🔧 :wrench: Mudança na configuração/ferramentas
📝 :memo: Documentação
🎨 :art: Formatação de código
🚀 :rocket: Deploy
🧪 :test_tube: Testes
📦 :package: Liberação
🚨 :rotating_light: Lint/Fix de problemas
�/css :palette: Tema/cores de UI
```

## Referências de Qualidade de Código

### Divisão de Arquivos Lógica (< 100 linhas por arquivo)

- **Controllers**: 30-50 linhas
- **Modelos**: 100-200 linhas  
- **Serviços**: 50-100 linhas
- **Middleware**: 20-40 linhas
- **Validação**: < 30 linhas

### Manutenção e Evolução

1. **Planos de Escalabilidade Semanais**:
   - 📅 Configuração do Docker para desenvolvimento local
   - 📅 Mock servidores para testes E2E
   - 📅 Health checks para microsserviços
   - 📅 Monitoramento de métricas com Prometheus

2. **Hoardes de Segurança**:
   - 🔒 RLS para MongoDB
   - 🛡️ Headers de segurança implementados
   - 🔐 Proteção contra CSRF (para APIs stateless)
   - 📊 Compliance com LGPD (local)

3. **Otimização de Performance**:
   - ⚡ Cache Redis para dados quentes (caching de sessão)
   - 🎯 Parallelização de consultas MongoDB
   - 📈 Circuit breakers e retry com backoff exponencial
   - 🔄 Stream processing para dados assíncronos

Este projeto demonstra as habilidades de um desenvolvedor **full-stack profissional**, capaz de projetar, implementar e manter aplicações enterprise-grade com uma estrutura moderna e escalável. A implementação mostra competição saudável e um portfólio sólido de habilidades. 🚀

---

*OrgApp — Organize sua vida, conquiste seus objetivos.*

**Versão:** 1.0.0 (de referência)
**Data:** 2026-07-25
**Autor:** mvdevelop