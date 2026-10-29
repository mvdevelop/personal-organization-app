import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowUpRight } from 'lucide-react';

interface StudiesCardProps {
  subjects: number
  sessions: number
  hours: number
}

const StudiesCard: React.FC<StudiesCardProps> = ({ subjects, sessions, hours }) => (
  <section className="sa-card" aria-labelledby="dash-studies-title">
    <div className="sa-card-head">
      <div>
        <h2 className="sa-card-title" id="dash-studies-title">
          <span className="sa-glyph is-success" aria-hidden="true"><GraduationCap /></span>
          Estudos
        </h2>
        <p className="sa-card-sub">Seu aprendizado em números</p>
      </div>
      <Link to="/studies" className="sa-link-btn">
        Abrir
        <ArrowUpRight aria-hidden="true" />
      </Link>
    </div>

    <div className="study-hero">
      <strong>{subjects}</strong>
      <span>{subjects === 1 ? 'matéria' : 'matérias'}</span>
    </div>
    <p className="study-sub">
      {subjects === 0 ? 'Comece a organizar seus estudos' : 'Sua rotina de aprendizado está ativa'}
    </p>

    <div className="study-stats">
      <div className="study-stat">
        <strong>{sessions}</strong>
        <span>sessões na semana</span>
      </div>
      <div className="study-stat">
        <strong>{hours}h</strong>
        <span>na semana</span>
      </div>
    </div>
  </section>
)

export default StudiesCard
