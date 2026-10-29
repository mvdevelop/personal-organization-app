import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowUpRight } from 'lucide-react';

interface AIOverviewProps {
  attentionSignals: number
  nextTaskTitle?: string | null
}

const AIOverview: React.FC<AIOverviewProps> = ({ attentionSignals, nextTaskTitle }) => {
  const status = attentionSignals > 0 ? 'Requer atenção' : 'Tudo em ordem'

  return (
    <section className="sa-section" aria-labelledby="ai-overview-title">
      <div className="sa-section-head">
        <div>
          <h2 className="sa-section-title" id="ai-overview-title">
            <Sparkles aria-hidden="true" />
            Resumo com IA
          </h2>
          <p className="sa-section-sub">Painel de decisão · Seu foco para hoje</p>
        </div>
      </div>

      <div className="ai-grid">
        <article className="ai-decision">
          <span className="ai-badge is-accent">Painel de decisão</span>
          <h3 className="ai-decision-title">Veja o que pede atenção</h3>
          <p className="ai-decision-text">Escolha o próximo passo e avance no seu ritmo.</p>

          <div className="ai-decision-foot">
            <div className="ai-signals">
              <span className="ai-signals-dot" aria-hidden="true" />
              <strong>
                {attentionSignals} {attentionSignals === 1 ? 'sinal' : 'sinais'} de atenção
              </strong>
              <span className="ai-signals-muted">· Uma boa hora para revisar sua rotina.</span>
            </div>
            <span className="ai-status">{status}</span>
          </div>
        </article>

        <article className="ai-reco">
          <div className="ai-reco-head">
            <span className="ai-badge is-success">Recomendação</span>
            <span className="ai-reco-number" aria-hidden="true">01</span>
          </div>

          <h3 className="ai-reco-title">Próxima ação</h3>

          {nextTaskTitle ? (
            <>
              <p className="ai-reco-text">
                Continue por onde parou: <strong>{nextTaskTitle}</strong>. Um passo curto já mantém o ritmo.
              </p>
              <Link to="/tasks" className="sa-primary-btn">
                Abrir tarefas
                <ArrowRight aria-hidden="true" />
              </Link>
            </>
          ) : (
            <>
              <p className="ai-reco-text">
                Seu próximo passo aparece aqui quando houver uma tarefa.
                Por enquanto, aproveite para revisar suas metas.
              </p>
              <Link to="/tasks" className="sa-primary-btn">
                Abrir tarefas
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </>
          )}
        </article>
      </div>
    </section>
  )
}

export default AIOverview
