import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Configuração do MSW (Mock Service Worker) para testes
// Isso permite mockar respostas de API sem depender de um backend real
export const server = setupServer(...handlers);
