import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { useAuth } from '../hooks/useAuth';
import { fetchDashboard } from '../store/slices/dashboardSlice';
import { fetchGamificationStats } from '../store/slices/gamificationSlice';
import { fetchHabits, fetchLogs, fetchStreaks, createLog } from '../store/slices/habitsSlice';
import { fetchTasks, toggleTask } from '../store/slices/tasksSlice';
import GreetingHeader from '../components/dashboard/GreetingHeader';
import AIOverview from '../components/dashboard/AIOverview';
import MetricCard from '../components/dashboard/MetricCard';
import TaskList, { type TaskRow } from '../components/dashboard/TaskList';
import HabitList, { type HabitRow } from '../components/dashboard/HabitList';
import GoalsCard, { type GoalRow } from '../components/dashboard/GoalsCard';
import NotesCard from '../components/dashboard/NotesCard';
import StudiesCard from '../components/dashboard/StudiesCard';
import CalendarCard from '../components/dashboard/CalendarCard';
import GamificationCard from '../components/dashboard/GamificationCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { DEMO_GOALS, DEMO_HABITS, DEMO_NOTE, DEMO_TASKS } from '../data/dashboardDemo';
import {
  ListChecks, Flame, Flag, Notebook,
} from 'lucide-react';

const DATE_FORMAT = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long', day: '2-digit', month: 'short', year: 'numeric',
})
const SHORT_DATE_FORMAT = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' })

const formatDue = (value: string | null) => {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return SHORT_DATE_FORMAT.format(date)
}

const greetingFor = (hour: number) => {
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { data, loading } = useAppSelector(s => s.dashboard)
  const gamification = useAppSelector(s => s.gamification)
  const habitState = useAppSelector(s => s.habits)
  const taskState = useAppSelector(s => s.tasks)

  const [demoTaskState, setDemoTaskState] = useState<Record<string, boolean>>({})
  const [demoHabitState, setDemoHabitState] = useState<Record<string, boolean>>({})

  useEffect(() => {
    dispatch(fetchDashboard())
    dispatch(fetchGamificationStats())
    dispatch(fetchHabits())
    dispatch(fetchStreaks())
    dispatch(fetchTasks({ filter: 'all' }))
    const today = new Date().toISOString().slice(0, 10)
    dispatch(fetchLogs({ start: today, end: today }))
  }, [dispatch])

  const firstName = user?.name?.split(' ')[0] ?? 'você'
  const now = useMemo(() => new Date(), [])
  const dateLabel = DATE_FORMAT.format(now).toUpperCase().replace('.', '')
  const greeting = greetingFor(now.getHours())

  // ----- Tasks -----
  const { rows: taskRows, isDemo: tasksAreDemo } = useMemo(() => {
    const recent = data?.tasks.recent ?? []
    if (recent.length > 0) {
      return {
        isDemo: false,
        rows: recent.slice(0, 3).map<TaskRow>(task => ({
          id: task.id,
          title: task.title,
          category: task.priority === 'high' ? 'Alta' : task.priority === 'low' ? 'Baixa' : 'Média',
          tagClass: task.priority === 'high' ? 'is-high' : task.priority === 'low' ? 'is-low' : 'is-medium',
          due: formatDue(task.dueDate),
          completed: task.completed,
        })),
      }
    }

    return {
      isDemo: true,
      rows: DEMO_TASKS.map<TaskRow>(task => ({
        ...task,
        completed: demoTaskState[task.id] ?? task.completed,
      })),
    }
  }, [data, demoTaskState])

  const handleToggleTask = useCallback(async (task: TaskRow) => {
    if (task.isDemo || tasksAreDemo) {
      setDemoTaskState(prev => ({ ...prev, [task.id]: !task.completed }))
      return
    }

    try {
      await dispatch(toggleTask(task.id)).unwrap()
      dispatch(fetchDashboard())
      toast.success(task.completed ? 'Tarefa reaberta.' : 'Tarefa concluída!')
    } catch {
      toast.error('Não foi possível atualizar a tarefa.')
    }
  }, [dispatch, tasksAreDemo])

  const pendingTasks = data ? data.tasks.pending : taskRows.filter(t => !t.completed).length
  const completedTasks = data ? data.tasks.completed : taskRows.filter(t => t.completed).length
  const totalTasks = data?.tasks.total ?? taskRows.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // ----- Habits -----
  const { rows: habitRows, isDemo: habitsAreDemo } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)

    if (habitState.habits.length > 0) {
      return {
        isDemo: false,
        rows: habitState.habits.map<HabitRow>(habit => {
          const log = habitState.logs.find(l => l.habitId === habit.id && l.date.slice(0, 10) === today)
          const streak = habitState.streaks.find(s => s.habitId === habit.id)
          return {
            id: habit.id,
            title: habit.title,
            description: habit.description || 'Hábito pessoal',
            color: habit.color || '#7778F6',
            streak: streak?.streak ?? 0,
            checkedToday: log?.completed ?? false,
          }
        }),
      }
    }

    return {
      isDemo: true,
      rows: DEMO_HABITS.map<HabitRow>(habit => ({
        ...habit,
        checkedToday: demoHabitState[habit.id] ?? habit.checkedToday,
      })),
    }
  }, [habitState, demoHabitState])

  const handleToggleHabit = useCallback(async (habit: HabitRow) => {
    if (habit.isDemo || habitsAreDemo) {
      setDemoHabitState(prev => ({ ...prev, [habit.id]: !habit.checkedToday }))
      return
    }

    try {
      await dispatch(createLog({
        habitId: habit.id,
        date: new Date().toISOString().slice(0, 10),
        completed: !habit.checkedToday,
      })).unwrap()
      dispatch(fetchStreaks())
      toast.success(habit.checkedToday ? 'Check-in removido.' : 'Check-in registrado!')
    } catch {
      toast.error('Não foi possível registrar o check-in.')
    }
  }, [dispatch, habitsAreDemo])

  const bestStreak = habitRows.length > 0
    ? Math.max(...habitRows.map(h => h.streak))
    : data?.habits.bestStreak ?? 0

  // ----- Goals / notes -----
  const { rows: goalRows, isDemo: goalsAreDemo, activeGoals, completedGoals } = useMemo(() => {
    const recent = data?.goals.recent ?? []

    if (recent.length > 0) {
      return {
        isDemo: false,
        activeGoals: data?.goals.active ?? recent.length,
        completedGoals: data?.goals.completed ?? 0,
        rows: recent.slice(0, 4).map<GoalRow>(goal => {
          const percent = goal.targetValue && goal.targetValue > 0
            ? Math.min(100, (goal.currentValue / goal.targetValue) * 100)
            : 0
          return {
            title: goal.title,
            icon: goal.type === 'purchase' ? 'monitor' : 'sparkles',
            percent,
          }
        }),
      }
    }

    return {
      isDemo: true,
      activeGoals: DEMO_GOALS.length,
      completedGoals: 0,
      rows: DEMO_GOALS,
    }
  }, [data])

  const note = useMemo(() => {
    const recent = data?.notes.recent?.[0]
    if (!recent) return { note: DEMO_NOTE, isDemo: true }
    const date = new Date(recent.updatedAt)
    return {
      isDemo: false,
      note: {
        title: recent.title,
        date: Number.isNaN(date.getTime()) ? '' : SHORT_DATE_FORMAT.format(date),
        category: 'Nota pessoal',
        excerpt: 'Capture ideias importantes e encontre tudo em um só lugar.',
      },
    }
  }, [data])

  const nextTaskTitle = taskRows.find(t => !t.completed)?.title ?? null
  const attentionSignals = (data?.tasks.overdue ?? 0) + (taskRows.filter(t => !t.completed).length)

  if (loading && !data && taskState.loading === false && habitState.habits.length === 0) {
    return <LoadingSpinner size="lg" text="Carregando seu painel..." />
  }

  return (
    <div>
      <GreetingHeader name={firstName} dateLabel={dateLabel} greeting={greeting} />

      <AIOverview attentionSignals={attentionSignals} nextTaskTitle={nextTaskTitle} />

      <section className="metrics-grid" aria-label="Indicadores de produtividade">
        <MetricCard
          label="Tarefas pendentes"
          value={pendingTasks}
          pill={totalTasks > 0 ? `${completionRate}% concluídas` : 'Sem tarefas'}
          tone="success"
          note="Tudo em dia · excelente ritmo"
          icon={ListChecks}
        />
        <MetricCard
          label="Melhor streak"
          value={bestStreak}
          unit="dias"
          pill="dias seguidos"
          tone="warning"
          note="Faça um check-in hoje"
          icon={Flame}
        />
        <MetricCard
          label="Metas ativas"
          value={activeGoals}
          pill={`${completedGoals} concluídas`}
          tone="pink"
          note="Continue progredindo"
          icon={Flag}
        />
        <MetricCard
          label="Horas de estudo"
          value={data?.studies.weekStudyHours ?? 0}
          unit="h"
          pill="na semana"
          tone="accent"
          note="Que tal uma sessão curta?"
          icon={Notebook}
        />
      </section>

      <div className="grid-2">
        <TaskList tasks={taskRows} onToggle={handleToggleTask} isDemo={tasksAreDemo} />
        <HabitList
          habits={habitRows}
          bestStreak={bestStreak}
          onToggle={handleToggleHabit}
          isDemo={habitsAreDemo}
        />
      </div>

      <div className="grid-3">
        <GoalsCard
          goals={goalRows}
          active={activeGoals}
          completed={completedGoals}
          isDemo={goalsAreDemo}
        />
        <NotesCard note={note.note} total={data?.notes.total ?? 0} isDemo={note.isDemo} />
        <StudiesCard
          subjects={data?.studies.subjects ?? 0}
          sessions={data?.studies.weekSessions ?? 0}
          hours={data?.studies.weekStudyHours ?? 0}
        />
      </div>

      <div className="grid-2">
        <CalendarCard />
        <GamificationCard
          level={gamification.level}
          currentXp={gamification.currentXp}
          nextLevelXp={gamification.nextLevelXp}
          progress={gamification.progress}
          tasksCompleted={gamification.counters.tasksCompleted}
          habitsCreated={gamification.counters.habitsCreated}
          studySessions={gamification.counters.studySessions}
          notesCreated={gamification.counters.notesCreated}
          unlockedAchievements={gamification.achievements.filter(a => a.unlocked).map(a => a.slug)}
          totalAchievements={gamification.achievements.length}
        />
      </div>

      <footer className="dash-foot">
        Smart Agenda · Um dia mais leve começa com clareza.
      </footer>
    </div>
  )
}

export default Dashboard
