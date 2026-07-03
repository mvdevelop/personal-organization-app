import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchDashboard } from '../store/slices/dashboardSlice';
import { Link } from 'react-router-dom';
import {
  CheckSquare, TrendingUp, Flame, Target, BookOpen,
  FileText, AlertCircle, Loader2, Sparkles, Clock,
  ArrowRight,
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
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const t = data?.tasks;
  const h = data?.habits;
  const g = data?.goals;
  const st = data?.studies;
  const n = data?.notes;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {new Date().getHours() < 12 ? 'Bom dia!' : new Date().getHours() < 18 ? 'Boa tarde!' : 'Boa noite!'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          icon={CheckSquare}
          label="Tarefas hoje"
          value={t?.today ?? 0}
          color="text-blue-500"
          bg="bg-blue-50 dark:bg-blue-900/20"
          sub={t?.pending ? `${t.pending} pendentes` : undefined}
        />
        <StatCard
          icon={Flame}
          label="Streak máximo"
          value={h?.bestStreak ?? 0}
          suffix="dias"
          color="text-orange-500"
          bg="bg-orange-50 dark:bg-orange-900/20"
        />
        <StatCard
          icon={Target}
          label="Metas ativas"
          value={g?.active ?? 0}
          color="text-purple-500"
          bg="bg-purple-50 dark:bg-purple-900/20"
        />
        <StatCard
          icon={BookOpen}
          label="Matérias"
          value={st?.subjects ?? 0}
          color="text-green-500"
          bg="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          icon={TrendingUp}
          label="Horas estudo/sem"
          value={st?.weekStudyHours ?? 0}
          suffix="h"
          color="text-cyan-500"
          bg="bg-cyan-50 dark:bg-cyan-900/20"
        />
        <StatCard
          icon={FileText}
          label="Notas"
          value={n?.total ?? 0}
          color="text-pink-500"
          bg="bg-pink-50 dark:bg-pink-900/20"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-500" /> Tarefas
            </h2>
            <Link to="/tasks" className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {t?.overdue ? (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{t.overdue} tarefa{t.overdue > 1 ? 's' : ''} atrasada{t.overdue > 1 ? 's' : ''}</span>
            </div>
          ) : null}

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                <span>Progresso</span>
                <span>{t?.completed}/{t?.total}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: t?.total ? `${Math.round((t.completed / t.total) * 100)}%` : '0%' }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {t?.recent?.length ? (
              t.recent.slice(0, 4).map((task: any) => (
                <div key={task.id} className="flex items-center gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-500' : task.priority === 'high' ? 'bg-red-500' : 'bg-gray-400'}`} />
                  <span className={`flex-1 truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {task.title}
                  </span>
                  {task.dueDate && (
                    <span className="text-xs text-gray-400">
                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Nenhuma tarefa ainda</p>
            )}
          </div>
        </div>

        {/* Habits Streaks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" /> Hábitos
            </h2>
            <Link to="/habits" className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{h?.todayCheckIns ?? 0}</div>
              <div className="text-xs text-gray-500">check-ins hoje</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{h?.total ?? 0}</div>
              <div className="text-xs text-gray-500">hábitos</div>
            </div>
          </div>

          <div className="space-y-2">
            {h?.streaks?.length ? (
              h.streaks.slice(0, 5).map((s: any) => (
                <div key={s.title} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{s.title}</span>
                  <span className="text-xs font-medium text-orange-500">🔥 {s.streak}d</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum hábito ainda</p>
            )}
          </div>
        </div>

        {/* Active Goals */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" /> Metas
            </h2>
            <Link to="/goals" className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {g?.recent?.length ? (
              g.recent.map((goal: any) => (
                <div key={goal.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300 truncate">{goal.title}</span>
                    {goal.targetValue && (
                      <span className="text-xs text-gray-500">
                        R$ {goal.currentValue}/{goal.targetValue}
                      </span>
                    )}
                  </div>
                  {goal.targetValue && (
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))}%` }}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Nenhuma meta ativa</p>
            )}
          </div>
        </div>

        {/* Recent Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-pink-500" /> Notas Recentes
            </h2>
            <Link to="/notes" className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {n?.recent?.length ? (
              n.recent.map((note: any) => (
                <div key={note.id} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 flex-shrink-0" />
                  <span className="flex-1 truncate">{note.title}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Nenhuma nota ainda</p>
            )}
          </div>
        </div>

        {/* Study stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-green-500" /> Estudos
            </h2>
            <Link to="/studies" className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1">
              Ver tudo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-500">{st?.weekSessions ?? 0}</div>
              <div className="text-xs text-gray-500 mt-1">Sessões na semana</div>
            </div>
            <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
              <div className="text-2xl font-bold text-cyan-500">{st?.weekStudyHours ?? 0}h</div>
              <div className="text-xs text-gray-500 mt-1">Horas na semana</div>
            </div>
          </div>
        </div>

        {/* AI Quick Briefing */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" /> Assistente IA
            </h2>
            <Link to="/ai" className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1">
              Abrir chat <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <Clock className="w-4 h-4" />
            <span>Peça um resumo do seu dia ou sugestões</span>
          </div>
          <Link
            to="/ai"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Falar com IA
          </Link>
        </div>
      </div>
    </div>
  );
};

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
  bg,
  sub,
}: {
  icon: any
  label: string
  value: number
  suffix?: string
  color: string
  bg: string
  sub?: string
}) {
  return (
    <div className={`${bg} rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        {value}
        {suffix && <span className="text-sm ml-0.5">{suffix}</span>}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

export default Dashboard
