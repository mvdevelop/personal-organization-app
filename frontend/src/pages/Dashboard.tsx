import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchDashboard } from '../store/slices/dashboardSlice';
import { Link } from 'react-router-dom';
import GamificationPanel from '../components/GamificationPanel';
import WeatherWidget from '../components/WeatherWidget';
import { ChartsWidget, MiniCalendar } from '../components/DashboardWidgets';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  ClipboardList, Flame, Trophy, GraduationCap,
  StickyNote, AlertCircle, Sparkles,
  ArrowRight, ListTodo, BrainCircuit,
} from 'lucide-react';

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <WeatherWidget />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={ListTodo} label="Tarefas pendentes" value={t?.pending ?? 0} subtitle={t?.total ? `${t.completed}/${t.total} concluídas` : undefined} />
        <StatCard icon={Flame} label="Melhor streak" value={`${h?.bestStreak ?? 0}`} subtitle="dias seguidos" />
        <StatCard icon={Trophy} label="Metas ativas" value={`${g?.active ?? 0}`} subtitle={`${g?.completed ?? 0} concluídas`} />
        <StatCard icon={BrainCircuit} label="Horas de estudo" value={`${st?.weekStudyHours ?? 0}h`} subtitle={`${st?.weekSessions ?? 0} sessões`} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks + Habits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tasks Card */}
            <div className="arch-decoration bg-white dark:bg-gray-800 rounded-xl shadow-warm border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="medal-ring !w-10 !h-10 !border-primary bg-primary-light dark:bg-primary/20">
                    <ClipboardList className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-sm text-gray-900 dark:text-white">Tarefas</h2>
                    <p className="font-body text-xs text-gray-500 dark:text-gray-400">{t?.completed}/{t?.total} concluídas</p>
                  </div>
                </div>
                <Link to="/tasks" className="text-gray-400 hover:text-primary transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: t?.total ? `${Math.round((t.completed / t.total) * 100)}%` : '0%' }} />
              </div>

              {t?.overdue ? (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{t.overdue} tarefa{t.overdue > 1 ? 's' : ''} atrasada{t.overdue > 1 ? 's' : ''}</span>
                </div>
              ) : t?.total === 0 ? (
                <p className="font-body text-xs text-center py-6 text-gray-400">Nenhuma tarefa ainda</p>
              ) : null}

              <div className="space-y-2">
                {t?.recent?.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 font-body text-sm">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.completed ? 'bg-green-500' : task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-yellow-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <span className={`flex-1 truncate ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>{task.title}</span>
                    {task.dueDate && (
                      <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500">
                        {new Date(task.dueDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Habits Card */}
            <div className="arch-decoration bg-white dark:bg-gray-800 rounded-xl shadow-warm border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="medal-ring !w-10 !h-10 !border-orange-400 bg-orange-50 dark:bg-orange-900/20">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-sm text-gray-900 dark:text-white">Hábitos</h2>
                    <p className="font-body text-xs text-gray-500 dark:text-gray-400">{h?.todayCheckIns ?? 0} check-ins hoje</p>
                  </div>
                </div>
                <Link to="/habits" className="text-gray-400 hover:text-primary transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

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
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color || 'var(--color-primary)' }} />
                    <span className="flex-1 truncate text-xs text-gray-700 dark:text-gray-300">{s.title}</span>
                    <span className="font-mono text-xs text-orange-500">{s.streak}d</span>
                  </div>
                )) : <p className="font-body text-xs text-center py-4 text-gray-400">Nenhum hábito ainda</p>}
              </div>
            </div>
          </div>

          <ChartsWidget tasks={t} habits={h} goals={g} studies={st} />

          {/* Goals + Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="arch-decoration bg-white dark:bg-gray-800 rounded-xl shadow-warm border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="medal-ring !w-10 !h-10 !border-purple-400 bg-purple-50 dark:bg-purple-900/20">
                    <Trophy className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-sm text-gray-900 dark:text-white">Metas</h2>
                    <p className="font-body text-xs text-gray-500 dark:text-gray-400">{g?.active ?? 0} ativas · {g?.completed ?? 0} concluídas</p>
                  </div>
                </div>
                <Link to="/goals" className="text-gray-400 hover:text-primary transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {g?.recent?.length ? g.recent.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="font-body text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="truncate text-xs font-medium text-gray-900 dark:text-white">{goal.title}</span>
                      {goal.targetValue && <span className="font-mono text-xs text-gray-400">{Math.round((goal.currentValue / goal.targetValue) * 100)}%</span>}
                    </div>
                    {goal.targetValue && (
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))}%` }} />
                      </div>
                    )}
                  </div>
                )) : <p className="font-body text-xs text-center py-4 text-gray-400">Nenhuma meta ativa</p>}
              </div>
            </div>

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
