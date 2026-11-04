import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Target, Zap, Clock } from 'lucide-react';
import { api } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

interface AttentionSignal {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  entityId: string;
  action: string;
  actionUrl: string;
}

interface NextAction {
  action: {
    type: string;
    id: string;
    title: string;
    description: string;
  } | null;
  source: string;
  confidence: number;
  alternatives: unknown[];
}

interface DailyPlan {
  plan: {
    _id: string;
    date: string;
    actions: Array<{
      sequence: number;
      type: string;
      entityId: string;
      entityTitle: string;
      estimatedDuration: number;
      completed: boolean;
    }>;
    completionRate?: number;
  };
  isToday: boolean;
  completionRate: number;
}

const SmartLifeOS: React.FC = () => {
  const navigate = useNavigate();
  const [signals, setSignals] = useState<AttentionSignal[]>([]);
  const [nextAction, setNextAction] = useState<NextAction | null>(null);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);

        const [signalsRes, nextActionRes, planRes] = await Promise.all([
          api.post<{ signals: AttentionSignal[] }>('/smart-os/attention-signals'),
          api.post<NextAction>('/smart-os/next-action'),
          api.get<DailyPlan>('/smart-os/daily-plan'),
        ]);

        setSignals(signalsRes.signals);
        setNextAction(nextActionRes);
        setDailyPlan(planRes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      }
    };

    loadData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'var(--danger)';
      case 'warning':
        return 'var(--warning)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'rgba(227, 109, 109, 0.1)';
      case 'warning':
        return 'rgba(240, 179, 91, 0.1)';
      default:
        return 'rgba(160, 167, 183, 0.1)';
    }
  };

  const handleStartFocus = async (actionSequence: number) => {
    try {
      const action = dailyPlan?.plan.actions[actionSequence];
      if (!action) return;

      // Create a focus session
      const session = await api.post<{ session: { _id: string } }>('/smart-os/focus-session/start', {
        focusedOn: action.type,
        entityId: action.entityId,
        entityTitle: action.entityTitle,
        plannedDuration: action.estimatedDuration,
      });

      // Store in sessionStorage for Focus page to access
      sessionStorage.setItem(
        `focus_session_${session.session._id}`,
        JSON.stringify({
          _id: session.session._id,
          entityTitle: action.entityTitle,
          entityType: action.type,
          plannedDuration: action.estimatedDuration,
          startedAt: new Date().toISOString(),
        }),
      );

      // Navigate to focus page
      navigate(`/smart-os/focus/${session.session._id}`);
    } catch (err) {
      console.error('Failed to start focus session', err);
    }
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}! 👋`}
        subtitle="Smart Life OS — Seu assistente pessoal"
      />

      {error && (
        <div
          style={{
            background: 'rgba(227, 109, 109, 0.1)',
            border: '1px solid rgba(227, 109, 109, 0.4)',
            color: 'var(--danger)',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.9rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Hero Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--sa-accent)' }}>
            {dailyPlan?.completionRate.toFixed(0)}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Plano do dia
          </div>
        </div>
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold)' }}>
            {signals.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Sinais
          </div>
        </div>
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>
            {dailyPlan?.plan.actions.length || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Ações
          </div>
        </div>
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: nextAction?.confidence ? `rgb(${Math.round(255 * (1 - nextAction.confidence))}, ${Math.round(255 * nextAction.confidence)}, 100)` : 'var(--text-secondary)',
            }}
          >
            {nextAction?.confidence ? `${Math.round(nextAction.confidence * 100)}%` : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Confiança
          </div>
        </div>
      </div>

      {/* Attention Signals */}
      {signals.length > 0 ? (
        <section style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} style={{ color: 'var(--warning)' }} />
              Sinais de Atenção
            </h2>
          </div>
          <div>
            {signals.map((signal, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 16px',
                  borderBottom: idx < signals.length - 1 ? '1px solid var(--border)' : 'none',
                  borderLeft: `4px solid ${getSeverityColor(signal.severity)}`,
                  background: getSeverityBg(signal.severity),
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '4px' }}>
                  {signal.title}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {signal.description}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    window.location.href = signal.actionUrl;
                  }}
                >
                  {signal.action}
                </Button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Next Action */}
      {nextAction?.action ? (
        <section
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--sa-accent-line)',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Target size={20} style={{ color: 'var(--sa-accent)' }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Próxima Ação</h2>
            <span
              style={{
                fontSize: '0.75rem',
                background: 'var(--sa-accent)',
                color: 'var(--bg-base)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              {Math.round((nextAction.confidence || 0) * 100)}% confiança
            </span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '4px' }}>
              {nextAction.action.title}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {nextAction.action.description}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
              Motivo: {nextAction.source}
            </div>
          </div>
          <Button variant="primary" size="sm">
            Começar agora
          </Button>
        </section>
      ) : null}

      {/* Daily Plan */}
      {dailyPlan?.plan.actions && dailyPlan.plan.actions.length > 0 ? (
        <section
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} />
              Plano do Dia
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {dailyPlan.completionRate.toFixed(0)}% concluído
            </div>
          </div>
          <div>
            {dailyPlan.plan.actions.map((action, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 16px',
                  borderBottom: idx < dailyPlan.plan.actions.length - 1 ? '1px solid var(--border)' : 'none',
                  opacity: action.completed ? 0.6 : 1,
                  textDecoration: action.completed ? 'line-through' : 'none',
                }}
              >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={action.completed}
                    onChange={() => {
                      // TODO: update plan action
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>
                      {action.sequence + 1}. {action.entityTitle}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      {action.estimatedDuration} min • {action.type}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStartFocus(action.sequence)}
                    style={{ marginLeft: 'auto' }}
                  >
                    Focar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Empty State */}
      {signals.length === 0 && !nextAction?.action && !dailyPlan?.plan.actions ? (
        <EmptyState
          icon={Zap}
          title="Sem dados para hoje"
          description="Complete suas atividades para que o Smart Life OS possa guiá-lo"
        />
      ) : null}
    </div>
  );
};

export default SmartLifeOS;
