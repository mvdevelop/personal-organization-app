# Smart Agenda — Plano de UI (execução em etapas)

Este arquivo registra a reformulação visual do OrgApp/Smart Agenda. Ele é atualizado a cada
etapa: o que já foi feito, o que está em andamento e o que falta.

Legenda: `[x]` concluído · `[~]` em andamento · `[ ]` pendente

---

## 1. Direção

- Estética de SaaS premium de produtividade, dark-first, inspirada em Linear/Notion sem copiá-las.
- Paleta dark como padrão: `#111318` (fundo), `#171A21` (fundo 2), `#14161C` (sidebar),
  `#1C2029` (card), `#232835` (elevado), `#2B303D` (borda), `#F1F3F9` / `#A0A7B7` / `#747D90`
  (texto), `#7778F6` (primário), `#30304F` (primário suave), `#45C49A`, `#F0B35B`, `#E989AD`,
  `#75A8F7` (apoio).
- Cantos 14–18 px, bordas discretas, sombras suaves, Inter, Lucide como ícones.
- Tema claro funcional com os mesmos tokens; preferência persistida em `localStorage`.

---

## 2. Frontends

O repositório tem dois frontends. A UI Smart Agenda foi primeiro prototipada no
`frontend-blazor` e a implementação oficial agora acontece no **`frontend/` (React + Vite)**.

### frontend-blazor (pausado)

- [x] Tokens e camada visual inicial (`wwwroot/css/app.css`)
- [x] Tema centralizado (`Theme/ScheduleTheme.cs`), dark como padrão
- [x] Layout com sidebar de marca, colapso e drawer mobile
- [x] Novo `Dashboard.razor` com hero, IA, métricas, tarefas/hábitos, metas/notas/estudos,
      calendário e gamificação
- [ ] Páginas internas (Tasks, Notes, Habits, Goals, Studies, AI) ainda com estilos antigos
- [ ] Build do projeto validado (`dotnet build`) — bloqueado por restore de pacotes na máquina
- [ ] Página de pesquisa (`/search`) e polimento final

> Decisão: o esforço principal passa para o React. O Blazor fica sem novas alterações até
> que o React esteja consistente.

---

## 3. frontend/ (React + Vite) — escopo atual

### Etapa 1 — Fundação visual
- [x] Tokens dark-first + tema claro em `src/styles/base.css`
- [x] Paleta aplicada ao `html.dark` por padrão (sem flash de tema)
- [x] `index.html`: fontes, `theme-color`, `color-scheme`
- [x] Preferência de tema com `dark` como valor inicial (`userPreferencesSlice`)

### Etapa 2 — Shell da aplicação
- [x] `Sidebar` (248 px / 78 px recolhida) com marca geométrica, subtítulo, bloco de perfil,
      navegação com indicador lateral ativo, card promocional e botão de recolher
- [x] Drawer mobile com scrim
- [x] `Header` como topbar: breadcrumb, pesquisa, notificações (dot), tema, plano gratuito, usuário
- [x] `Layout` usando o novo shell e preservando `FloatingAIButton`/`InstallPWA`

### Etapa 3 — Dashboard
- [x] Saudação com data em caixa alta e card de clima ilustrativo (dados de demonstração)
- [x] Seção "Resumo com IA": Painel de decisão + Recomendação
- [x] Quatro indicadores de produtividade com pílulas de status
- [x] Tarefas com checkbox funcional, progresso reativo e estado "tudo concluído"
- [x] Hábitos com check-in do dia e indicadores
- [x] Metas, Notas (preview de conteúdo) e Estudos
- [x] Calendário funcional (troca de mês, dia selecionado, hoje distinto)
- [x] Gamificação: XP, conquistas bloqueadas/desbloqueadas reais
- [x] Rodapé da página

### Etapa 4 — Consistência das demais páginas
- [x] Primitivas legadas re-estilizadas com os novos tokens (botões, inputs, labels, cards, badges)
- [x] Login alinhado à nova identidade
- [~] Páginas Tasks/Notes/Habits/Goals/Studies/AI: herdam tokens; revisão fina de estados vazios
      e densidade ainda pendente
- [ ] Remover classes decorativas órfãs (`divider-diamond`, `arch-decoration`) quando não usadas

### Etapa 5 — Qualidade
- [~] `npm run build` / `npm run lint` verificados
- [ ] Revisão de contraste WCAG AA nos dois temas
- [ ] Navegação por teclado e `:focus-visible` em todos os controles
- [ ] Conferir testes existentes (`StatCard`, `DashboardCard`, `Button`, `Modal`, slices)
- [ ] Screenshot desktop/tablet/mobile para documentação

---

## 4. Dados de demonstração

- Quando a conta não tem dados, o dashboard usa conteúdo ilustrativo local
  (`src/data/dashboardDemo.ts`) e marca explicitamente como demonstração.
- Nada é apresentado como API real; checkboxes de demonstração não chamam o backend.
- Clima é sempre rotulado como dado ilustrativo (sem API meteorológica).

## 5. Restrições de trabalho

- Sem novas branches, worktrees ou diretórios de projeto.
- Commits ficam a cargo do usuário (`git add .`, `git commit -m ""`, `git push origin main`).
- Não alterar contratos da API, autenticação ou regras de negócio.

---

## 6. Backlog consolidado para as próximas sessões

Este backlog reúne as implementações pendentes identificadas na análise do projeto e no prompt
“Evolução do Smart Agenda: IA, PWA Nativa e Inteligência Pessoal”. Nenhum item abaixo deve ser
tratado como concluído apenas por existir uma tela, mock ou botão: a funcionalidade precisa ter
persistência, tratamento de erro, autorização e testes correspondentes.

### P0 — Estabilização e deploy

- [ ] Confirmar que a Vercel está construindo o branch `main` e um commit atual, não o commit antigo `445bd8d`.
- [ ] Conferir Root Directory, repositório, branch e comandos de build dos projetos frontend/backend na Vercel.
- [ ] Decidir e alinhar a versão do Node entre `package.json`, workspaces e configurações da Vercel.
- [ ] Manter manifests e lockfiles coerentes; não editar lockfiles manualmente como solução de deploy.
- [ ] Corrigir os erros restantes do lint do frontend:
  - [ ] regras de Fast Refresh em `DashboardWidgets.tsx` e `AuthContext.tsx`;
  - [ ] usos de `any` em `Settings.tsx`, `offlineDB.ts` e `aiSlice.ts`;
  - [ ] dependência instável do `useMemo` do calendário.
- [ ] Corrigir o teste de login rejeitado em `useAuth.test.tsx`, evitando rejeição não tratada.
- [ ] Investigar e estabilizar a suíte Jest do backend, incluindo MongoDB Memory Server e configuração de ambiente.
- [ ] Executar e registrar uma matriz final de `build`, `lint` e `test` de raiz, backend e frontend.
- [ ] Avaliar code splitting/lazy loading para reduzir o bundle principal acima de 500 KB.

### P1 — IA segura, extensível e realmente integrada

#### Configuração de provedores

- [ ] Revisar a tela de configurações de IA e concluir adicionar, editar, remover, ativar/desativar e definir provedor padrão.
- [ ] Permitir configurar modelo, temperatura, limite de tokens e limites de uso quando suportados.
- [ ] Exibir status real da conexão, data do último teste e mensagens de erro úteis.
- [ ] Garantir que API Keys nunca sejam retornadas integralmente, armazenadas no frontend ou incluídas em logs.
- [ ] Revisar criptografia, rotação, invalidação de cache e tratamento de chaves antigas.
- [ ] Adicionar rate limiting específico para endpoints de IA e controle de consumo por usuário/provedor.
- [ ] Cobrir OpenRouter, OpenAI, Anthropic e Google Gemini com testes de contrato e respostas de erro.

#### Prompts e contexto

- [ ] Auditar o prompt padrão do modelo, o prompt de contexto e os prompts de briefing/sugestões.
- [ ] Definir um contrato de resposta estruturada para texto e ações, substituindo o parsing frágil baseado somente em tags.
- [ ] Validar rigorosamente tipo, campos, formato e escopo de cada ação proposta pela IA.
- [ ] Implementar proteção contra prompt injection vindo de tarefas, notas, metas ou outros dados do usuário.
- [ ] Separar instruções do sistema, dados do usuário e mensagem do usuário com limites claros de autoridade.
- [ ] Criar configuração de memória/contexto: o usuário escolhe módulos autorizados, pode limpar o contexto e pode revisar o que foi utilizado.
- [ ] Evitar que a IA invente métricas; usar somente dados disponíveis ou indicar claramente ausência de dados.
- [ ] Criar testes dos prompts para comandos em português, datas, prioridades, conflitos e entradas ambíguas.

#### Ações e auditoria

- [ ] Implementar confirmação explícita antes de qualquer criação, alteração ou exclusão.
- [ ] Exibir prévia editável das ações propostas antes da execução.
- [ ] Executar ações somente após confirmação e autorização do usuário.
- [ ] Registrar auditoria de prompt, ação proposta, decisão do usuário, resultado e erro sem armazenar segredos.
- [ ] Implementar idempotência para evitar duplicação quando uma ação for reenviada.
- [ ] Criar permissões por tipo de ação e módulo.
- [ ] Cobrir criação de tarefas, hábitos, notas, metas e atualização de tarefas com testes de integração.

### P1 — PWA e experiência mobile nativa

- [ ] Validar e completar `manifest.json`, nome, nome curto, descrição, cores, `display`, `scope` e atalhos.
- [ ] Criar/validar ícones PWA nas resoluções necessárias, incluindo máscara/adaptive icon para Android.
- [ ] Implementar tela de inicialização/splash e `theme-color` coerentes nos temas claro e escuro.
- [ ] Confirmar que o `sw.js` existe, é publicado no build e possui estratégia segura de atualização.
- [ ] Implementar aviso de nova versão e atualização controlada do Service Worker.
- [ ] Refinar a experiência mobile própria: navegação inferior, header compacto, drawers, modais e formulários para toque/teclado virtual.
- [ ] Aplicar áreas seguras (`safe-area-inset`) e tamanhos mínimos de toque.
- [ ] Implementar indicador visível de online/offline e estado de sincronização.
- [ ] Implementar notificações push somente após consentimento explícito e com revogação de permissão.
- [ ] Adicionar atalhos de teclado e navegação rápida no desktop.
- [ ] Validar instalação no Chrome desktop e Android com testes manuais/documentação.

### P1 — Smart Life OS

- [ ] Criar módulo/rota própria do Smart Life OS, sem transformar o dashboard em um conjunto de cards decorativos.
- [ ] Criar uma visão central de tarefas, calendário, hábitos, metas, estudos, notas, foco e histórico.
- [ ] Implementar painel de atenção com explicação da origem de cada sinal.
- [ ] Implementar próxima ação recomendada com fonte dos dados e ação navegável.
- [ ] Implementar planejamento diário considerando prazos, prioridades, duração, disponibilidade, hábitos e metas.
- [ ] Permitir aceitar, editar, rejeitar e regenerar sugestões do planejamento.
- [ ] Implementar revisão semanal com concluídos, pendências, metas, hábitos, estudos, conquistas e pontos de atenção.
- [ ] Implementar relatórios semanais/mensais baseados apenas em métricas suportadas pelo backend.
- [ ] Implementar Focus Mode com tarefa/objetivo, cronômetro, pausa, encerramento e registro persistente da sessão.
- [ ] Implementar comando rápido universal em qualquer tela, com prévia das ações antes da execução.
- [ ] Avaliar entrada por voz como etapa posterior, somente com fallback completo por texto e feedback de permissão.

### P2 — Offline, sincronização e consistência de dados

- [ ] Definir o modelo de dados offline para tarefas, notas, hábitos, metas, estudos e dashboard.
- [ ] Corrigir a fila de sincronização para enviar autenticação e tratar respostas HTTP não bem-sucedidas.
- [ ] Evitar API Keys, tokens sensíveis e segredos no IndexedDB, localStorage ou cache do Service Worker.
- [ ] Implementar IDs/client mutation IDs idempotentes para operações offline.
- [ ] Definir estratégia de conflitos: versão, `updatedAt`, rejeição, merge ou resolução pelo usuário.
- [ ] Exibir itens pendentes, falhas e tentativas de sincronização.
- [ ] Implementar retry com backoff e limite sem descartar silenciosamente alterações do usuário.
- [ ] Adicionar testes offline/online, recarga da página, expiração de sessão e reconexão.
- [ ] Validar cache inteligente, invalidação e carregamento progressivo sem exibir dados obsoletos como atuais.

### P2 — Segurança, privacidade e dados do usuário

- [ ] Revisar autenticação por cookie/token, expiração, logout e isolamento entre usuários.
- [ ] Confirmar proteção CSRF compatível com o modo de autenticação usado em produção.
- [ ] Revisar CSP, Helmet, CORS, rate limiting e headers de segurança.
- [ ] Garantir escopo por `userId` em todos os controllers, serviços e consultas.
- [ ] Implementar exportação dos dados do usuário em formato documentado.
- [ ] Implementar exclusão da conta e dados associados com confirmação e tratamento de falhas.
- [ ] Registrar ações relevantes de segurança e administração sem dados sensíveis.
- [ ] Revisar vulnerabilidades de dependências e o histórico de credenciais expostas conforme `backend/SECURITY.md`.

### P2 — Qualidade visual, acessibilidade e produto

- [ ] Fazer revisão de contraste WCAG AA nos temas claro e escuro.
- [ ] Garantir `:focus-visible`, ordem de foco, labels, nomes acessíveis e operação por teclado em todos os controles.
- [ ] Revisar estados default, hover, active, disabled, loading, empty, error e offline.
- [ ] Remover classes decorativas órfãs como `divider-diamond` e `arch-decoration` quando não utilizadas.
- [ ] Harmonizar tokens legados ainda presentes (`gray-*`, `white`, sombras e raios) com o design system atual.
- [ ] Revisar estados vazios e densidade de Tasks, Notes, Habits, Goals, Studies e AI.
- [ ] Produzir screenshots desktop, tablet e mobile após a estabilização.
- [ ] Testar navegação real com mouse, teclado, toque e leitor de tela quando possível.

### P3 — Testes e documentação final

- [ ] Criar testes unitários para reducers, serviços offline, validações e transformação de dados.
- [ ] Criar testes de integração para autenticação, CRUD, IA, ações confirmadas e sincronização.
- [ ] Criar testes E2E dos fluxos principais desktop/mobile.
- [ ] Testar falhas de provedor, timeout, rate limit, token expirado, offline e conflito.
- [ ] Atualizar README, `PROJECT_CONTEXT.txt`, Swagger e documentação de variáveis de ambiente.
- [ ] Documentar decisões de arquitetura, contratos de ação da IA, privacidade e estratégia offline.
- [ ] Não marcar uma etapa como concluída sem evidência de build/teste ou validação manual correspondente.

### Ordem de execução planejada

1. Estabilização local e Vercel.
2. Lint, testes e segurança básica.
3. IA: prompts, ações confirmadas, permissões e auditoria.
4. PWA/mobile e atualização do Service Worker.
5. Smart Life OS, planejamento, revisão semanal e Focus Mode.
6. Offline/sincronização/notificações.
7. Acessibilidade, performance, testes E2E e documentação.

**Estado:** backlog registrado para execução posterior. As alterações de código já existentes no
working tree não foram commitadas.