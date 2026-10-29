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
