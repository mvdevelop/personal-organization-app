import React from 'react';
import { Link } from 'react-router-dom';
import { NotebookPen, ArrowUpRight } from 'lucide-react';
import type { DemoNote } from '../../data/dashboardDemo';

interface NotesCardProps {
  note: DemoNote
  total: number
  isDemo?: boolean
}

const NotesCard: React.FC<NotesCardProps> = ({ note, total, isDemo }) => {
  const subtitle = total === 0
    ? 'Nenhuma nota ainda'
    : `${total} ${total === 1 ? 'nota criada' : 'notas criadas'}`

  return (
    <section className="sa-card" aria-labelledby="dash-notes-title">
      <div className="sa-card-head">
        <div>
          <h2 className="sa-card-title" id="dash-notes-title">
            <span className="sa-glyph is-blue" aria-hidden="true"><NotebookPen /></span>
            Notas
          </h2>
          <p className="sa-card-sub">{subtitle}</p>
        </div>
        <Link to="/notes" className="sa-link-btn">
          Abrir notas
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>

      <div className="note-preview">
        <div className="note-preview-title">{note.title}</div>
        <div className="note-preview-meta">
          <span>{note.date}</span>
          <span aria-hidden="true">·</span>
          <span>{note.category}</span>
        </div>
        <p className="note-preview-text">{note.excerpt}</p>
      </div>

      {isDemo && (
        <p className="demo-note">Prévia ilustrativa — suas notas aparecem aqui.</p>
      )}

      <p className="sa-card-sub" style={{ marginTop: 12 }}>
        Capture ideias importantes e encontre tudo em um só lugar.
      </p>
    </section>
  )
}

export default NotesCard
