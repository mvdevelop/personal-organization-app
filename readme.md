# ◆ OrgApp — Organizador Pessoal

> Sua super agenda inteligente para tarefas, hábitos, metas e estudos, com assistente integrado por IA.

## 🎯 Sobre o Projeto

O **OrgApp** é um organizador pessoal completo criado para unificar todas as áreas da vida num só lugar. Ideal para estudantes, profissionais, concurseiros e qualquer pessoa que queira gerenciar **tarefas, hábitos, metas, estudos e notas** com o suporte de um **assistente de IA** (OpenRouter).

### Para quem é?

- 🎓 **Estudantes** — organize matérias, cronograma de estudos e sessões Pomodoro
- 💼 **Profissionais** — gerencie tarefas do trabalho, projetos e metas de carreira
- 🏋️ **Saúde e bem-estar** — acompanhe hábitos diários, streaks e metas fitness
- 📚 **Leitores** — registre leituras e acompanhe metas literárias
- 🎯 **Sonhadores** — planeje viagens, compras e objetivos de longo prazo

## 🚀 Tecnologias

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | Framework UI |
| TypeScript | 6 | Tipagem estática |
| Vite | 8 | Build e dev server |
| Tailwind CSS | 4 | Estilização utilitária |
| Redux Toolkit | 2 | Estado global |
| React Router | 7 | Roteamento SPA |
| Framer Motion | 11 | Animações |
| Lucide React | — | Ícones |
| React Hot Toast | — | Notificações |

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 22+ | Runtime |
| Express | 4 | Servidor HTTP |
| Mongoose | 8 | ODM MongoDB |
| JWT | 9 | Autenticação |
| Zod | 3 | Validação de schemas |
| Swagger | 6 | Documentação OpenAPI |
| Helmet | 8 | Segurança HTTP |
| Bcrypt | 2 | Hash de senhas |

## ✨ Funcionalidades

### 📋 Módulos

| Módulo | Descrição | Status |
|---|---|---|
| **Tarefas** | CRUD completo com prioridades, filtros, busca e datas | ✅ |
| **Notas** | Cards coloridos com grid responsivo e busca | ✅ |
| **Hábitos** | Check-in diário/semanal com streak tracking 🔥 | ✅ |
| **Metas** | Metas financeiras, milestones, progresso visual | ✅ |
| **Estudos** | Matérias por categoria, sessões de estudo | ✅ |
| **Calendário** | Visualização mensal/semanal | 🔄 Em breve |
| **Assistente IA** | Chat inteligente com OpenRouter (GPT-4o-mini) | ✅ |

### 🧠 Assistente IA

- 🤖 **Chat livre** — tire dúvidas, peça conselhos, organize ideias
- 📋 **Resumo do dia** — briefing matinal personalizado
- 💡 **Sugestão de tarefas** — recomendações baseadas no seu perfil
- 🎯 **Contexto completo** — a IA conhece suas tarefas, hábitos e metas
- 🔘 **Botão flutuante** — acesso rápido de qualquer página

### 🎨 Experiência do Usuário

- 🌓 **Tema dark/light** — alternância suave com persistência local
- 📱 **Responsivo** — sidebar vira drawer em mobile
- ✨ **Animações** — transições fluidas com Framer Motion
- 🔐 **Autenticação** — JWT com registro e login
- 💾 **Preferências** — salvam automaticamente no navegador

## 📁 Estrutura do Projeto

```
personal-organization-app/
├── frontend/                        # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/              # Componentes reutilizáveis
│   │   │   ├── Header.tsx           # Topo com alternância de tema
│   │   │   ├── Sidebar.tsx          # Navegação principal
│   │   │   ├── Layout.tsx           # Layout base com Outlet
│   │   │   ├── TaskCard.tsx         # Card de tarefa
│   │   │   ├── TaskModal.tsx        # Modal de criar/editar tarefa
│   │   │   ├── NoteCard.tsx         # Card de nota colorido
│   │   │   ├── NoteModal.tsx        # Modal de criar/editar nota
│   │   │   ├── AIAssistant.tsx      # Chat com IA
│   │   │   └── FloatingAIButton.tsx # Botão flutuante da IA
│   │   ├── pages/                   # Páginas da aplicação
│   │   │   ├── Login.tsx            # Login e cadastro
│   │   │   ├── Tasks.tsx            # Gerenciamento de tarefas
│   │   │   ├── Notes.tsx            # Gerenciamento de notas
│   │   │   ├── Habits.tsx           # Hábitos e check-in
│   │   │   ├── Goals.tsx            # Metas e progresso
│   │   │   ├── Studies.tsx          # Matérias e estudos
│   │   │   └── AIAssistantPage.tsx  # Página completa do chat IA
│   │   ├── store/
│   │   │   ├── index.ts             # Configuração Redux
│   │   │   └── slices/              # Slices do Redux Toolkit
│   │   │       ├── tasksSlice.ts
│   │   │       ├── notesSlice.ts
│   │   │       ├── habitsSlice.ts
│   │   │       ├── goalsSlice.ts
│   │   │       ├── studiesSlice.ts
│   │   │       ├── domainsSlice.ts
│   │   │       ├── aiSlice.ts
│   │   │       └── userPreferencesSlice.ts
│   │   ├── context/AuthContext.tsx   # Contexto de autenticação
│   │   ├── services/api.ts          # Cliente HTTP (fetch + JWT)
│   │   └── hooks/redux.ts           # Hooks tipados Redux
│   ├── public/icon.svg              # Favicon da aplicação
│   └── index.html
│
├── backend/                         # Express + MongoDB + JWT
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts               # Variáveis de ambiente
│   │   │   └── db.ts                # Conexão MongoDB
│   │   ├── models/                  # Mongoose schemas
│   │   │   ├── User.ts, Task.ts, Note.ts
│   │   │   ├── Domain.ts, Habit.ts, Goal.ts, Subject.ts
│   │   │   └── AIChat.ts
│   │   ├── controllers/             # Handlers MVC
│   │   │   ├── authController.ts
│   │   │   ├── taskController.ts, noteController.ts
│   │   │   ├── domainController.ts, habitController.ts
│   │   │   ├── goalController.ts, studyController.ts
│   │   │   └── aiController.ts
│   │   ├── services/
│   │   │   └── aiService.ts         # Cliente OpenRouter
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT middleware
│   │   │   └── errorHandler.ts      # Error handler global
│   │   ├── validators/              # Schemas Zod
│   │   ├── routes/index.ts          # Rotas (35+ endpoints)
│   │   ├── app.ts                   # Config Express + Swagger
│   │   └── server.ts                # Entry point
│   ├── api/index.ts                 # Handler Vercel
│   └── vercel.json
│
└── readme.md
```

## 🛠️ Como Rodar

### Pré-requisitos

- **Node.js** 22+
- **MongoDB** rodando localmente ou **MongoDB Atlas** (uri no `.env`)
- (Opcional) **Chave da OpenRouter** para funcionalidades de IA

### Backend

```bash
cd backend
cp .env.example .env    # Configure suas variáveis
npm install
npm run dev
# → http://localhost:3001
# → Swagger: http://localhost:3001/api-docs
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Variáveis de Ambiente

#### Backend (`.env`)
| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3001` | Porta do servidor |
| `MONGODB_URI` | `mongodb://localhost:27017/personal-org` | URI do MongoDB |
| `JWT_SECRET` | — | Chave secreta JWT |
| `JWT_EXPIRES_IN` | `7d` | Expiração do token |
| `CORS_ORIGIN` | `http://localhost:5173` | Origem CORS |
| `OPENROUTER_API_KEY` | — | Chave da API OpenRouter |
| `OPENROUTER_MODEL` | `gpt-4o-mini` | Modelo de IA |

#### Frontend (`.env`)
| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3001` | URL do backend |

## 📚 API (Swagger)

Com o backend rodando, acesse: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

### Endpoints Principais

```
Autenticação     POST /api/auth/register  POST /api/auth/login  GET /api/auth/me
Tarefas          GET|POST /api/tasks  PUT|DELETE /api/tasks/:id  PATCH /api/tasks/:id/toggle
Notas            GET|POST /api/notes  PUT|DELETE /api/notes/:id
Domínios         GET|POST /api/domains  POST /api/domains/seed
Hábitos          GET|POST /api/habits  PUT|DELETE /api/habits/:id
Metas            GET|POST /api/goals  PUT|DELETE /api/goals/:id
Estudos          GET|POST /api/subjects  GET|POST /api/study-sessions
IA               POST /api/ai/chat  GET /api/ai/daily-briefing  GET /api/ai/suggest-tasks
```

## 🧪 Roadmap

| Fase | O que inclui | Status |
|---|---|---|
| **Fase 1** | Base refinada: Notas, persistência localStorage, animações, responsividade | ✅ |
| **Fase 2** | Expansão: Domínios, Hábitos, Metas, Estudos, Sidebar renovada | ✅ |
| **Fase 3** | IA: OpenRouter, chat inteligente, briefing diário, sugestões | ✅ |
| **Fase 4** | Dashboard inteligente com widgets e analytics | ✅ |
| **Fase 5** | Gamificação: XP, níveis, conquistas | ✅ |
| **Fase 6** | Deploy Vercel + MongoDB Atlas | 📅 Planejado |

---

*OrgApp — Organize sua vida, conquiste seus objetivos.*
