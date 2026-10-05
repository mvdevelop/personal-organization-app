import { http, HttpResponse } from 'msw';

// Handlers de API mockados para testes
// Simula todas as respostas do backend sem precisar de um servidor real

export const handlers = [
  // ========== Auth ==========
  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as { name: string; email: string; password: string };
    return HttpResponse.json({
      user: { id: '1', name: body.name, email: body.email, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      token: 'mock-jwt-token',
    }, { status: 201 });
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    return HttpResponse.json({
      user: { id: '1', name: 'Test User', email: body.email, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      token: 'mock-jwt-token',
    });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logout realizado com sucesso' });
  }),

  // ========== Tasks ==========
  http.get('/api/tasks', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Tarefa de teste',
        description: 'Descrição da tarefa',
        completed: false,
        priority: 'medium',
        dueDate: null,
        userId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Tarefa concluída',
        description: '',
        completed: true,
        priority: 'high',
        dueDate: null,
        userId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }),

  http.post('/api/tasks', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'new-task',
      title: body.title,
      description: body.description || '',
      completed: false,
      priority: body.priority || 'medium',
      dueDate: body.dueDate || null,
      userId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.put('/api/tasks/:id', async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: params.id,
      title: body.title || 'Updated Task',
      description: body.description || '',
      completed: body.completed ?? false,
      priority: body.priority || 'medium',
      dueDate: body.dueDate || null,
      userId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete('/api/tasks/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.patch('/api/tasks/:id/toggle', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Tarefa alternada',
      description: '',
      completed: true,
      priority: 'medium',
      dueDate: null,
      userId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  // ========== Notes ==========
  http.get('/api/notes', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Nota de exemplo',
        content: 'Conteúdo da nota',
        color: '#fef3c7',
        userId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }),

  http.post('/api/notes', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'new-note',
      title: body.title,
      content: body.content || '',
      color: body.color || '#ffffff',
      userId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.put('/api/notes/:id', async ({ request, params }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: params.id,
      title: body.title || 'Nota atualizada',
      content: body.content || '',
      color: body.color || '#ffffff',
      userId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete('/api/notes/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ========== Habits ==========
  http.get('/api/habits', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Hábito de exemplo',
        description: 'Descrição do hábito',
        frequency: 'daily',
        daysOfWeek: [1, 2, 3, 4, 5],
        domainId: null,
        color: '#3b82f6',
        reminderTime: null,
        userId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }),

  http.get('/api/habits/streaks', () => {
    return HttpResponse.json([
      { habitId: '1', title: 'Hábito de exemplo', streak: 5, color: '#3b82f6' },
    ]);
  }),

  http.post('/api/habits', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'new-habit',
      title: body.title,
      description: body.description || '',
      frequency: body.frequency || 'daily',
      daysOfWeek: body.daysOfWeek || [1, 2, 3, 4, 5],
      color: body.color || '#3b82f6',
      reminderTime: body.reminderTime || null,
      userId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.post('/api/habits/logs', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'new-log',
      habitId: body.habitId,
      userId: '1',
      date: body.date || new Date().toISOString(),
      completed: body.completed ?? true,
      note: body.note || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  // ========== Goals ==========
  http.get('/api/goals', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Meta de exemplo',
        description: 'Descrição da meta',
        type: 'learning',
        targetValue: 100,
        currentValue: 50,
        deadline: new Date('2025-12-31').toISOString(),
        domainId: null,
        status: 'active',
        milestones: [],
        userId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }),

  http.post('/api/goals', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'new-goal',
      title: body.title,
      description: body.description || '',
      type: body.type || 'custom',
      targetValue: body.targetValue || null,
      currentValue: body.currentValue || 0,
      deadline: body.deadline || null,
      domainId: body.domainId || null,
      status: 'active',
      milestones: body.milestones || [],
      userId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  // ========== Studies ==========
  http.get('/api/subjects', () => {
    return HttpResponse.json([
      {
        id: '1',
        name: 'Matemática',
        category: 'faculdade',
        color: '#3b82f6',
        workload: 60,
        userId: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }),

  http.post('/api/subjects', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      id: 'new-subject',
      name: body.name,
      category: body.category || 'personal',
      color: body.color || '#3b82f6',
      workload: body.workload || 0,
      userId: '1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.get('/api/study-sessions', () => {
    return HttpResponse.json([
      {
        id: '1',
        subjectId: '1',
        userId: '1',
        duration: 25,
        content: 'Estudo de cálculo',
        technique: 'pomodoro',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  }),

  // ========== Dashboard ==========
  http.get('/api/dashboard', () => {
    return HttpResponse.json({
      tasks: {
        total: 10,
        pending: 5,
        completed: 5,
        today: 2,
        overdue: 1,
        recent: [
          { id: '1', title: 'Tarefa recente', completed: false, priority: 'high', dueDate: null },
        ],
      },
      habits: {
        total: 3,
        todayCheckIns: 2,
        bestStreak: 7,
        streaks: [{ title: 'Exercício', streak: 7, color: '#3b82f6' }],
      },
      goals: {
        active: 2,
        completed: 1,
        recent: [
          { id: '1', title: 'Meta de estudo', type: 'learning', targetValue: 100, currentValue: 50, deadline: '2025-12-31' },
        ],
      },
      studies: {
        subjects: 3,
        weekSessions: 5,
        weekStudyHours: 3.5,
      },
      notes: {
        total: 8,
        recent: [
          { id: '1', title: 'Nota recente', updatedAt: new Date().toISOString() },
        ],
      },
    });
  }),

  // ========== Gamification ==========
  http.get('/api/gamification/stats', () => {
    return HttpResponse.json({
      level: 5,
      currentXp: 450,
      nextLevelXp: 225,
      progress: 200,
      totalXp: 1250,
      unlockedAchievements: [
        {
          slug: 'first-task',
          title: 'Primeira Tarefa',
          description: 'Criou sua primeira tarefa',
          icon: 'check-square',
          category: 'tasks',
          xpReward: 10,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        },
      ],
      counters: {
        tasksCreated: 15,
        tasksCompleted: 12,
        habitsCreated: 3,
        goalsCreated: 2,
        goalsCompleted: 1,
        studySessions: 8,
        studyMinutes: 300,
        notesCreated: 5,
      },
    });
  }),

  http.get('/api/gamification/achievements', () => {
    return HttpResponse.json([
      {
        slug: 'first-task',
        title: 'Primeira Tarefa',
        description: 'Criou sua primeira tarefa',
        icon: 'check-square',
        category: 'tasks',
        xpReward: 10,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      },
      {
        slug: 'ten-tasks',
        title: 'Produtivo',
        description: 'Completou 10 tarefas',
        icon: 'zap',
        category: 'tasks',
        xpReward: 50,
        unlocked: false,
        unlockedAt: null,
      },
    ]);
  }),

  // ========== AI ==========
  http.post('/api/ai/chat', async ({ request }) => {
    const body = await request.json() as { message: string };
    return HttpResponse.json({
      response: `Recebi sua mensagem: "${body.message}". Como posso ajudar?`,
      tokensUsed: 50,
      historyLength: 2,
    });
  }),

  http.get('/api/ai/history', () => {
    return HttpResponse.json({ messages: [] });
  }),

  http.get('/api/ai/daily-briefing', () => {
    return HttpResponse.json({ briefing: 'Bom dia! Você tem 3 tarefas pendentes e 2 check-ins de hábitos hoje.' });
  }),

  http.get('/api/ai/suggest-tasks', () => {
    return HttpResponse.json({ suggestions: '1. Termine o relatório. 2. Estude para o exame. 3. Faça check-in dos hábitos.' });
  }),

  // ========== CSRF Token ==========
  http.get('/api/csrf-token', () => {
    return HttpResponse.json({ csrfToken: 'mock-csrf-token' });
  }),
];
