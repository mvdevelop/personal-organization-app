import { Response, Request, NextFunction } from 'express';
import { validationResult, body, param, query } from 'express-validator';
import { AppError } from './errorHandler.js';

/**
 * Middleware de validação avançada com sanitização
 */
export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Executar todas as validações
    for (const validation of validations) {
      try {
        await validation.run(req);
      } catch (error) {
        // Express-validator adiciona erros ao req.validationErrors
        return next(error);
      }
    }

    // Verificar resultados de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value,
        location: error.location,
      }));

      throw new AppError('Dados de entrada inválidos', 400, {
        validationErrors: formattedErrors,
        requestBody: req.body,
        requestQuery: req.query,
        requestParams: req.params,
      });
    }

    // Sanitizar entradas após validação bem-sucedida
    req.body = sanitizeInput(req.body);
    req.query = sanitizeInput(req.query);
    req.params = sanitizeInput(req.params);

    next();
  };
};

/**
 * Sanitizar entradas para prevenir XSS e outras injeções
 */
function sanitizeInput(input: any): any {
  if (!input) return input;

  if (typeof input === 'string') {
    return input
      .replace(/<script[^>]*>(.*?)<\/script>/gi, '') // Remover scripts
      .replace(/javascript:/gi, '') // Remover URLs javascript:
      .replace(/on\w+=/gi, '') // Remover event handlers
      .trim();
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const key of Object.keys(input)) {
      // Filtrar chaves potencialmente perigosas
      if (key.startsWith('__') || key.includes('constructor') || key.includes('prototype')) {
        continue;
      }
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }

  return input;
}

/**
 * Validações comuns reusáveis
 */
export const commonValidations = {
  // ID de MongoDBObjectID
  mongoId: param('id')
    .matches(/^[0-9a-fA-F]{24}$/, 'ID deve ser um ObjectID válido do MongoDB'),

  // String não vazia com limites
  nonEmptyString: (field: string, min: number = 1, max: number = 255) =>
    body(field)
      .trim()
      .notEmpty({ errorMessage: `${field} é obrigatório` })
      .isLength({ min, max }, { errorMessage: `${field} deve ter entre ${min} e ${max} caracteres` }),

  // Email válido
  validEmail: body('email')
    .trim()
    .isEmail({ errorMessage: 'Email inválido' })
    .normalizeEmail(),

  // Slug seguro
  safeSlug: body('slug')
    .trim()
    .matches(/^[a-zA-Z0-9-]+$/, 'Slug deve conter apenas letras, números e hífens')
    .isLength({ min: 2, max: 100 }, { errorMessage: 'Slug deve ter entre 2 e 100 caracteres' }),

  // Cor hexadecimal válida
  validHexColor: (field: string = 'color') =>
    body(field)
      .matches(/^#[0-9a-fA-F]{6}$/, 'Cor deve ser um hex válido (ex: #3b82f6)'),

  // Data ISO valida
  validDate: (field: string) =>
    body(field)
      .isISO8601({ strict: true }, { errorMessage: `${field} deve ser uma data ISO válida` })
      .toDate(),

  // Enum validado
  validEnum: (field: string, values: string[]) =>
    body(field)
      .isIn(values, { errorMessage: `Valor deve ser um de: ${values.join(', ')}` }),

  // URL segura
  safeUrl: (field: string) =>
    body(field)
      .trim()
      .isURL({ require_tld: false }, { errorMessage: `${field} deve ser uma URL válida` })
      .custom(value => {
        // Prevenir URLs maliciosas
        if (value.startsWith('javascript:')) {
          throw new Error('URLs javascript: não são permitidas');
        }
        return value;
      }),

  // String opcional com sanitização
  optionalString: (field: string, max: number = 1000) =>
    body(field).optional({ values: 'falsy' }).trim().isLength({ max }).escape(),

  // Número positivo
  positiveNumber: (field: string) =>
    body(field)
      .isFloat({ min: 0 }, { errorMessage: `${field} deve ser um número positivo` })
      .toFloat(),

  // Consulta de data/opções segura
  safeDateRange: query('start').optional().isISO8601().toDate(),
};

/**
 * Middleware de sanitização CSRF token para APIs
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Para APIs stateless com JWT, geralmente não precisamos de CSRF
  // Mas podemos adicionar headers de proteção
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Adicionar header de prevenção de CSRF para formulários navegados
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialed');
  }

  next();
};

/**
 * Middleware de sanitização de corpo para grandes cargas úteis
 */
export const bodySanitizer = (req: Request, res: Response, next: NextFunction): void => {
  // Limitar tamanho do corpo
  const contentLength = parseInt(req.get('content-length') || '0');
  if (contentLength > 10 * 1024 * 1024) { // 10MB
    throw new AppError('Payload muito grande', 413);
  }

  // Sanitizar array de arquivos se presente
  if (req.body instanceof Buffer) {
    // Converter buffer para string para processamento posterior
    req.body = req.body.toString();
  }

  // Limpar entradas potencialmente perigosas
  if (req.body && typeof req.body === 'object') {
    const dangerousKeys = ['$where', '$expr', '$geoNear', '$text', '$text', '$search'];
    for (const key of Object.keys(req.body)) {
      if (dangerousKeys.includes(key)) {
        delete req.body[key];
      }
    }
  }

  next();
};