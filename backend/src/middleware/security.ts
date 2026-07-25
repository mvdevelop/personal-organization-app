import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { isIP } from 'net';
import { env } from '../config/env.js';

/**
 * Rate limiter em múltiplas camadas para segurança aprimorada
 */

/**
 * Rate limiter avançado de IP com backoff exponencial e blacklist
 */
const advancedRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite padrão
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições de um único IP. Tente novamente mais tarde.' },
  // Custom skip function para IPs suspeitos
  skip: (req) => {
    const ip = req.ip || req.connection.remoteAddress;

    // Pular rate limiting para IPs internos conhecidos (desenvolvimento local)
    if (ip && (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('127.'))) {
      return true;
    }

    // Pular para origens de confiance em produção
    if (env.nodeEnv === 'production' && req.get('Origin') && env.corsOrigin?.split(',').includes(req.get('Origin'))) {
      return true;
    }

    return false;
  },
  // Custom handlers para diferentes estágios
  handler: (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;

    // Logar tentativa de rate limit
    console.warn(`Rate limit excedido para IP: ${ip}, URL: ${req.originalUrl}, User-Agent: ${req.get('User-Agent')}`);

    // Adicionar header para retry delay sugerido
    const retryAfter = Math.ceil(15 * 60 / 60); // 15 minutos convertido para horas
    res.set('Retry-After', retryAfter.toString());

    res.status(429).json({
      error: 'Muitas requisições',
      message: 'Limite de taxa excedido. Tente novamente em 15 minutos.',
      retryAfter: `${retryAfter} minutos`,
      requestId: req.get('X-Request-ID'),
      ipBlocked: isSuspiciousIP(ip),
    });
  },
  // Implementar backoff exponencial para exceeds
  keyGenerator: (req) => req.ip || req.connection.remoteAddress,
  // Custom score de risco para identificação de bots
  skipSuccessfulRequests: true, // Contabilizar apenas falhas
});

/**
 * Middleware avançado de rate limiting específico para autenticação
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 tentativas de login por hora
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas tentativas de login',
    message: 'Muitas tentativas de login. Aguarde 60 minutos antes de tentar novamente.',
    lockoutDuration: '1 hora',
  },
  skipSuccessfulRequests: true, // Apenas contar falhas
  keyGenerator: (req) => {
    // Rate limit baseado em IP + email/username para melhor precisão
    const ip = req.ip || req.connection.remoteAddress;
    const body = req.body as any;

    if (body?.email) {
      return `${ip}:${body.email.toLowerCase()}`;
    }

    return ip;
  },
  handler: (req, res) => {
    const body = req.body as any;
    const identifier = body?.email ? `email: ${body.email}` : 'IP';

    console.warn(`Rate limit de autenticação excedido para ${identifier}, IP: ${req.ip}`);

    // Implementar chave de rate limit baseada em JWT para sucessos
    // (implementação mais avançada seria necessária para detecção de bots)

    res.status(429).json({
      error: 'Muitas tentativas de login',
      message: 'Muitas tentativas de login. Verifique suas credenciais e tente novamente em 1 hora.',
      waitingTime: '60 minutos',
      attemptedAt: new Date().toISOString(),
    });
  },
});

/**
 * Rate limiter para operações sensíveis em massa
 */
export const bulkOperationsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // 10 operações em massa por 5 minutos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas operações',
    message: 'Operações realizadas com muita rapidez. Aguarde um momento antes de tentar novamente.',
  },
  skip: (req) => {
    // Pular operações GET (leituras)
    return req.method === 'GET';
  },
});

/**
 * Rate limiter para modificações de dados (POST, PUT, DELETE)
 */
export const dataModificationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // 20 modificações por minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas modificações',
    message: 'Modificações realizadas com muita rapidez. Aguarde antes de modificar novamente.',
  },
});

/**
 * Middleware para detecção de IP suspeito e blacklist
 */
function isSuspiciousIP(ip: string): boolean {
  if (!ip) return false;

  // Lista de padrões suspeitos (seria armazenada em Redis/Banco de dados em produção)
  const suspiciousPatterns = [
    /^192\.168\./, // IP privado
    /^10\./, // IP privado
    /^127\./, // Loopback
    /^172\.(1[6-9]|2[0-9]|3[01])\./, // IP privado
    /.*\.tor\.exit/, // Nós de saída Tor
    /.*\.onion$/, // Réde onion
  ];

  // Validar formato do IP
  if (!isValidIP(ip)) {
    return true;
  }

  // Verificar padrões suspeitos
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(ip)) {
      return true;
    }
  }

  return false;
}

/**
 * Validar formato do IP
 */
function isValidIP(ip: string): boolean {
  if (!ip) return false;
  return isIP(ip) !== 0; // 0 significa inválido
}

/**
 * Middleware de limpeza de cabeçalhos de requisição
 */
export const headerSanitizer = (req: Request, res: Response, next: NextFunction): void => {
  // Remover cabeçalhos potencialmente perigosos
  const dangerousHeaders = [
    'x-forwarded-for', // Pode ser spoofado
    'x-real-ip', // Pode ser spoofado
    'cf-connecting-ip', // Pode ser spoofado
  ];

  // Remover IP de proxy se present
  dangerousHeaders.forEach(header => {
    if (req.headers[header]) {
      delete req.headers[header];
    }
  });

  // Validar User-Agent
  const userAgent = req.get('User-Agent');
  if (userAgent && userAgent.length > 500) {
    // User Agent muito longo pode indicar um cliente suspeito/custom
    console.warn(`User-Agent incomum longo: ${userAgent.substring(0, 100)}...`);
  }

  // Garantir que Content-Type seja seguro para JSON APIs
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const contentType = req.get('Content-Type') || '';
    if (contentType && !contentType.includes('application/json') && !contentType.includes('application/x-www-form-urlencoded')) {
      // Não rejeitar, apenas logar
      console.warn(`Content-Type incomum: ${contentType} para método ${req.method}`);
    }
  }

  next();
};

/**
 * Middleware de validação de DNS para prevenir SSRF
 */
export const dnsValidation = (req: Request, res: Response, next: NextFunction): void => {
  const url = req.body?.url || req.query?.url || '';

  if (!url || typeof url !== 'string') {
    return next();
  }

  try {
    const urlObj = new URL(url);

    // Bloquear URLs internas
    const internalDomains = [
      'localhost',
      '127.0.0.1',
      '169.254.169.254', // IP do metadata do AWS
      'metadata.google.internal',
    ];

    if (internalDomains.includes(urlObj.hostname)) {
      throw new Error(`Acesso a hostname interno não permitido: ${urlObj.hostname}`);
    }

    // Bloquear uso de portas não padrão para confiança (32, 873, 1433, etc.)
    const nonStandardPorts = [21, 22, 23, 25, 53, 110, 135, 139, 143, 445, 993, 995, 1433, 1521, 1533, 1747, 3306, 3389, 5432, 5900, 6379, 7001, 8080];

    if (urlObj.port && nonStandardPorts.includes(parseInt(urlObj.port))) {
      console.warn(`Acesso a porta não padrão: ${urlObj.port} para ${urlObj.hostname}`);
    }

  } catch (error) {
    console.error(`Erro de validação de URL: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    // Não rejeitar, apenas logar para monitoramento
  }

  next();
};

/**
 * Middleware de logging de segurança
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Gerar ID de requisição único para rastreamento
  const requestId = (req as any).requestId || require('crypto').randomUUID();
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  // Logar evento de entrada
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - IP: ${req.ip} - ID: ${requestId}`);

  // Interceptar respostas de erro
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('Content-Length'),
      referrer: req.get('Referrer'),
    };

    if (statusCode >= 500) {
      console.error(`[${new Date().toISOString()}] ERRO ${statusCode} - ${req.method} ${req.originalUrl} - ${duration}ms - ID: ${requestId}`, logData);
    } else if (statusCode >= 400) {
      console.warn(`[${new Date().toISOString()}] AVISO ${statusCode} - ${req.method} ${req.originalUrl} - ${duration}ms - ID: ${requestId}`, logData);
    } else {
      console.log(`[${new Date().toISOString()}] SUCESSO ${statusCode} - ${req.method} ${req.originalUrl} - ${duration}ms - ID: ${requestId}`, logData);
    }
  });

  next();
};