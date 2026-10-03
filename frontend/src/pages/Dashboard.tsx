import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchDashboard } from '../store/slices/dashboardSlice';
import { Link } from 'react-router-dom';
import GamificationPanel from '../components/GamificationPanel';
import WeatherWidget from '../components/WeatherWidget';
import { ChartsWidget, MiniCalendar } from '../components/DashboardWidgets';
import StatCard from '../components/ui/StatCard';
import DashboardCard from '../components/ui/DashboardCard';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  ClipboardList, Flame, Trophy, GraduationCap,
  StickyNote, AlertCircle, Sparkles,
  ArrowRight, ListTodo, BrainCircuit,
} from 'lucide-react';

const getAttentionSignals = (tasks: { overdue?: number } | undefined, habits: { total?: number; todayCheckIns?: number } | undefined) => ({
  overdueTasks: tasks?.overdue ?? 0,
  uncheckedHabits: Math.max(0, (habits?.total ?? 0) - (habits?.todayCheckIns ?? 0)),
})

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((s) => s.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (loading && !data) {
    return (
      <LoadingSpinner size="lg" text="Carregando dashboard..." />
    );
  }

  const t = data?.tasks;
  const h = data?.habits;
  const g = data?.goals;
  const st = data?.studies;
  const n = data?.notes;
  const completionRate = t?.total ? Math.round((t.completed / t.total) * 100) : 0;
  const attentionSignals = getAttentionSignals(t, h)
  const attentionCount = attentionSignals.overdueTasks + attentionSignals.uncheckedHabits
  const hasDashboardData = Boolean(data)
  const nextTask = t?.recent?.find((task) => !task.completed);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <WeatherWidget />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="dashboard-card__eyebrow">Painel de decisão</p>
          <h1 className="page-header text-2xl sm:text-3xl">Seu foco para hoje</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Veja o que pede atenção e escolha o próximo passo.</p>
        </div>
        <span className="badge-retro self-start sm:self-auto">{!hasDashboardData ? 'Aguardando dados' : attentionCount ? `${attentionCount} sinais de atenção` : 'Tudo em dia'}</span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={ListTodo} label="Tarefas pendentes" value={t?.pending ?? 0} subtitle={t?.total ? `${completionRate}% concluídas` : 'Comece adicionando uma'} status={t?.overdue ? 'attention' : 'neutral'} actionLabel={t?.overdue ? `${t.overdue} atrasadas` : undefined} />
        <StatCard icon={Flame} label="Melhor streak" value={`${h?.bestStreak ?? 0}`} subtitle="dias seguidos" status={h?.todayCheckIns ? 'positive' : 'attention'} actionLabel={!h?.todayCheckIns && h?.total ? 'Faça um check-in' : undefined} />
        <StatCard icon={Trophy} label="Metas ativas" value={`${g?.active ?? 0}`} subtitle={`${g?.completed ?? 0} concluídas`} status="positive" />
        <StatCard icon={BrainCircuit} label="Horas de estudo" value={`${st?.weekStudyHours ?? 0}h`} subtitle={`${st?.weekSessions ?? 0} sessões na semana`} />
      </div>

      <DashboardCard title="Próxima ação" eyebrow="Recomendação" description={nextTask ? 'Retome o trabalho com maior impacto agora.' : 'Seu próximo passo aparece aqui quando houver uma tarefa.'} icon={<Sparkles className="w-5 h-5" />} href="/tasks" actionLabel="Abrir tarefas">
        {nextTask ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg p-3" style={{ background: 'var(--bg-elevated)' }}>
            <div className="min-w-0"><p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{nextTask.title}</p><p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Prioridade {nextTask.priority}</p></div>
            <Link to="/tasks" className="btn-outline rounded-md px-3 py-2 text-xs text-center">Continuar</Link>
          </motion.div>
        ) : <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Nenhuma tarefa pendente. Aproveite para revisar suas metas.</p>}
      </DashboardCard>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks + Habits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tasks Card */}
            <DashboardCard title="Tarefas" description={t?.total ? `${t.completed}/${t.total} concluídas` : 'Organize seu próximo passo'} icon={<ClipboardList className="w-5 h-5" />} href="/tasks" actionLabel="Abrir tarefas">
              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mb-4 overflow-hidden" role="progressbar" aria-label="Progresso das tarefas" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completionRate}>
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
              </div>
              {t?.overdue ? (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  <span>{t.overdue} tarefa{t.overdue > 1 ? 's' : ''} atrasada{t.overdue > 1 ? 's' : ''}</span>
                </div>
              ) : t?.total === 0 ? (
                <p className="font-body text-xs text-center py-6 text-gray-400">Nenhuma tarefa ainda</p>
              ) : null}
              <div className="space-y-2">
                {t?.recent?.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 font-body text-sm">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.completed ? 'bg-green-500' : task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-yellow-400' : 'bg-gray-300 dark:bg-gray-600'}`} aria-hidden="true" />
                    <span className={`flex-1 truncate ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>{task.title}</span>
                    {task.dueDate && <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500">{new Date(task.dueDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                ))}
              </div>
            </DashboardCard>

            {/* Habits Card */}
            <DashboardCard title="Hábitos" description={`${h?.todayCheckIns ?? 0} check-ins hoje`} icon={<Flame className="w-5 h-5" />} href="/habits" actionLabel="Abrir hábitos">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 font-body text-sm">
                  <span className="font-display text-2xl font-bold text-orange-500">{h?.bestStreak ?? 0}</span>
                  <span className="text-xs text-gray-500">🔥 max</span>
                </div>
                <div className="flex items-center gap-1.5 font-body text-sm">
                  <span className="font-display text-2xl font-bold text-gray-900 dark:text-white">{h?.total ?? 0}</span>
                  <span className="text-xs text-gray-500">hábitos</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {h?.streaks?.length ? h.streaks.slice(0, 4).map((s) => (
                  <div key={s.title} className="flex items-center gap-2 font-body text-sm py-0.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color || 'var(--color-primary)' }} aria-hidden="true" />
                    <span className="flex-1 truncate text-xs text-gray-700 dark:text-gray-300">{s.title}</span>
                    <span className="font-mono text-xs text-orange-500">{s.streak}d</span>
                  </div>
                )) : <p className="font-body text-xs text-center py-4 text-gray-400">Nenhum hábito ainda</p>}
              </div>
            </DashboardCard>
          </div>

          <ChartsWidget tasks={t} habits={h} goals={g} studies={st} />

          {/* Goals + Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DashboardCard title="Metas" description={`${g?.active ?? 0} ativas · ${g?.completed ?? 0} concluídas`} icon={<Trophy className="w-5 h-5" />} href="/goals" actionLabel="Abrir metas">
              <div className="space-y-3">
                {g?.recent?.length ? g.recent.slice(0, 3).map((goal) => {
                  const progress = goal.targetValue ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0
                  return <div key={goal.id} className="font-body text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="truncate text-xs font-medium text-gray-900 dark:text-white">{goal.title}</span>
                      {goal.targetValue ? <span className="font-mono text-xs text-gray-400">{progress}%</span> : null}
                    </div>
                    {goal.targetValue ? <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden" role="progressbar" aria-label={`Progresso da meta ${goal.title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div> : null}
                  </div>
                }) : <p className="font-body text-xs text-center py-4 text-gray-400">Nenhuma meta ativa</p>}
              </div>
            </DashboardCard>

            <div className="arch-decoration bg-white dark:bg-gray-800 rounded-xl shadow-warm border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="medal-ring !w-10 !h-10 !border-pink-400 bg-pink-50 dark:bg-pink-900/20">
                    <StickyNote className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-sm text-gray-900 dark:text-white">Notas</h2>
                    <p className="font-body text-xs text-gray-500 dark:text-gray-400">{n?.total ?? 0} notas criadas</p>
                  </div>
                </div>
                <Link to="/notes" className="text-gray-400 hover:text-primary transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-2">
                {n?.recent?.length ? n.recent.slice(0, 4).map((note) => (
                  <div key={note.id} className="flex items-center gap-2 font-body text-sm py-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-400 flex-shrink-0" />
                    <span className="flex-1 truncate text-xs text-gray-700 dark:text-gray-300">{note.title}</span>
                    <span className="font-mono text-[11px] text-gray-400">{new Date(note.updatedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
                  </div>
                )) : <p className="font-body text-xs text-center py-4 text-gray-400">Nenhuma nota ainda</p>}
              </div>
            </div>
          </div>

          {/* Studies + AI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="arch-decoration bg-white dark:bg-gray-800 rounded-xl shadow-warm border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="medal-ring !w-10 !h-10 !border-green-400 bg-green-50 dark:bg-green-900/20">
                    <GraduationCap className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-sm text-gray-900 dark:text-white">Estudos</h2>
                    <p className="font-body text-xs text-gray-500 dark:text-gray-400">{st?.subjects ?? 0} matérias</p>
                  </div>
                </div>
                <Link to="/studies" className="text-gray-400 hover:text-primary transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center py-4 px-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="font-display text-2xl font-bold text-green-500">{st?.weekSessions ?? 0}</div>
                  <div className="font-ui text-[11px] text-gray-500 mt-1">Sessões na semana</div>
                </div>
                <div className="text-center py-4 px-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                  <div className="font-display text-2xl font-bold text-cyan-500">{st?.weekStudyHours ?? 0}h</div>
                  <div className="font-ui text-[11px] text-gray-500 mt-1">Horas na semana</div>
                </div>
              </div>
            </div>

            <div className="arch-decoration bg-white dark:bg-gray-800 rounded-xl shadow-warm border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4">
              <div className="medal-ring !w-12 !h-12 !border-primary bg-gradient-to-br from-yellow-400 to-yellow-500">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display font-semibold text-sm text-gray-900 dark:text-white">Assistente IA</h2>
                <p className="font-body text-xs text-gray-500 mt-0.5">Peça um resumo do seu dia ou sugestões</p>
                <Link to="/ai" className="inline-flex items-center gap-1 font-ui text-xs font-semibold text-primary hover:text-primary-hover mt-1.5 transition-colors">
                  Abrir chat <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <MiniCalendar tasks={data?.tasks as { recent?: { id: string; title: string; dueDate: string | null }[] } | undefined} />
          <GamificationPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard
