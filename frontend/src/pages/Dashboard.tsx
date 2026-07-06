import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchDashboard } from '../store/slices/dashboardSlice';
import { Link } from 'react-router-dom';
import GamificationPanel from '../components/GamificationPanel';
import WeatherWidget from '../components/WeatherWidget';
import { ChartsWidget, MiniCalendar } from '../components/DashboardWidgets';
import {
  CheckSquare, Flame, Target, BookOpen,
  FileText, AlertCircle, Loader2, Sparkles,
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
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const t = data?.tasks;
  const h = data?.habits;
  const g = data?.goals;
  const st = data?.studies;
  const n = data?.notes;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* === Weather / Greeting Header === */}
      <WeatherWidget />

      {/* === Quick Stats Row === */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat icon={ListTodo} label="Tarefas" highlight={t?.pending ? `${t.pending}` : '0'} color="text-primary" />
        <MiniStat icon={Flame} label="Streak" highlight={`${h?.bestStreak ?? 0}`} color="text-orange-500" />
        <MiniStat icon={Target} label="Metas ativas" highlight={`${g?.active ?? 0}`} color="text-purple-500" />
        <MiniStat icon={BrainCircuit} label="Horas estudo" highlight={`${st?.weekStudyHours ?? 0}h`} color="text-green-500" />
      </div>

      {/* === Main 2-Column Grid === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* --- Left Column (2/3) --- */}
        <div className="lg:col-span-2 space-y-6">

          {/* Row: Tasks + Habits side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Tasks Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <CheckSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Tarefas</h2>
                    <p className="text-xs text-gray-500">{t?.completed}/{t?.total} concluídas</p>
                  </div>
                </div>
                <Link to="/tasks" className="text-xs text-gray-400 hover:text-primary transition-colors"><ArrowRight className="w-4 h-4" /></Link>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: t?.total ? `${Math.round((t.completed / t.total) * 100)}%` : '0%' }} />
              </div>

              {/* Overdue alert */}
              {t?.overdue ? (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{t.overdue} tarefa{t.overdue > 1 ? 's' : ''} atrasada{t.overdue > 1 ? 's' : ''}</span>
                </div>
              ) : t?.total === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Nenhuma tarefa ainda</p>
              ) : null}

              {/* Recent tasks */}
              <div className="space-y-2">
                {t?.recent?.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.completed ? 'bg-green-500' : task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                    <span className={`flex-1 truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>{task.title}</span>
                    {task.dueDate && <span className="text-[11px] text-gray-400 flex-shrink-0">{new Date(task.dueDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Habits Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Hábitos</h2>
                    <p className="text-xs text-gray-500">{h?.todayCheckIns ?? 0} check-ins hoje</p>
                  </div>
                </div>
                <Link to="/habits" className="text-xs text-gray-400 hover:text-primary transition-colors"><ArrowRight className="w-4 h-4" /></Link>
              </div>

              {/* Streak highlight */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-2xl font-bold text-orange-500">{h?.bestStreak ?? 0}</span>
                  <span className="text-gray-500">🔥 max</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">{h?.total ?? 0}</span>
                  <span className="text-gray-500">hábitos</span>
                </div>
              </div>

              {/* Streak list */}
              <div className="space-y-1.5">
                {h?.streaks?.length ? h.streaks.slice(0, 4).map((s) => (
                  <div key={s.title} className="flex items-center gap-2 text-sm py-0.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="flex-1 truncate text-gray-700 dark:text-gray-300 text-xs">{s.title}</span>
                    <span className="text-xs text-orange-500 font-medium">{s.streak}d</span>
                  </div>
                )) : <p className="text-xs text-gray-400 text-center py-4">Nenhum hábito ainda</p>}
              </div>
            </div>
          </div>

          {/* Charts */}
          <ChartsWidget tasks={t} habits={h} goals={g} studies={st} />

          {/* Row: Goals + Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Goals Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Metas</h2>
                    <p className="text-xs text-gray-500">{g?.active ?? 0} ativas · {g?.completed ?? 0} concluídas</p>
                  </div>
                </div>
                <Link to="/goals" className="text-xs text-gray-400 hover:text-primary transition-colors"><ArrowRight className="w-4 h-4" /></Link>
              </div>
              <div className="space-y-3">
                {g?.recent?.length ? g.recent.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-700 dark:text-gray-300 truncate text-xs font-medium">{goal.title}</span>
                      {goal.targetValue && <span className="text-[11px] text-gray-400">{Math.round((goal.currentValue / goal.targetValue) * 100)}%</span>}
                    </div>
                    {goal.targetValue && (
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))}%` }} />
                      </div>
                    )}
                  </div>
                )) : <p className="text-xs text-gray-400 text-center py-4">Nenhuma meta ativa</p>}
              </div>
            </div>

            {/* Notes Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Notas</h2>
                    <p className="text-xs text-gray-500">{n?.total ?? 0} notas criadas</p>
                  </div>
                </div>
                <Link to="/notes" className="text-xs text-gray-400 hover:text-primary transition-colors"><ArrowRight className="w-4 h-4" /></Link>
              </div>
              <div className="space-y-2">
                {n?.recent?.length ? n.recent.slice(0, 4).map((note) => (
                  <div key={note.id} className="flex items-center gap-2 text-sm py-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-400 flex-shrink-0" />
                    <span className="flex-1 truncate text-gray-700 dark:text-gray-300 text-xs">{note.title}</span>
                    <span className="text-[11px] text-gray-400 flex-shrink-0">{new Date(note.updatedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
                  </div>
                )) : <p className="text-xs text-gray-400 text-center py-4">Nenhuma nota ainda</p>}
              </div>
            </div>
          </div>

          {/* Studies mini + Gamification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Estudos</h2>
                    <p className="text-xs text-gray-500">{st?.subjects ?? 0} matérias</p>
                  </div>
                </div>
                <Link to="/studies" className="text-xs text-gray-400 hover:text-primary transition-colors"><ArrowRight className="w-4 h-4" /></Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center py-4 px-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-green-500">{st?.weekSessions ?? 0}</div>
                  <div className="text-[11px] text-gray-500 mt-1">Sessões na semana</div>
                </div>
                <div className="text-center py-4 px-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-cyan-500">{st?.weekStudyHours ?? 0}h</div>
                  <div className="text-[11px] text-gray-500 mt-1">Horas na semana</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Assistente IA</h2>
                <p className="text-xs text-gray-500 mt-0.5">Peça um resumo do seu dia ou sugestões</p>
                <Link to="/ai" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover mt-1.5 transition-colors">
                  Abrir chat <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* --- Right Column (1/3) --- */}
        <div className="space-y-6">
          <MiniCalendar tasks={data?.tasks as { recent?: { id: string; title: string; dueDate: string | null }[] } | undefined} />
          <GamificationPanel />
        </div>
      </div>
    </div>
  );
};

/* Mini Stat — compact stat card for the top row */
function MiniStat({ icon: Icon, label, highlight, color }: {
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>; label: string; highlight: string; color: string
}) {
  const bgMap: Record<string, string> = {
    'text-primary': 'bg-blue-50 dark:bg-blue-900/20',
    'text-orange-500': 'bg-orange-50 dark:bg-orange-900/20',
    'text-purple-500': 'bg-purple-50 dark:bg-purple-900/20',
    'text-green-500': 'bg-green-50 dark:bg-green-900/20',
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgMap[color] || 'bg-gray-100 dark:bg-gray-700'}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <div className={`text-xl font-bold ${color}`}>{highlight}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard
