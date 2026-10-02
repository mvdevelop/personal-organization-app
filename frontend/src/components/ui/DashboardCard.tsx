import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardCardProps {
  title: string
  eyebrow?: string
  description?: string
  icon?: React.ReactNode
  href?: string
  actionLabel?: string
  children: React.ReactNode
  className?: string
}

const toHeadingId = (title: string) => `dashboard-card-${title
  .normalize('NFKD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .toLowerCase()}`

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  eyebrow,
  description,
  icon,
  href,
  actionLabel = 'Ver detalhes',
  children,
  className = '',
}) => {
  const headingId = toHeadingId(title)

  return (
  <section className={`dashboard-card ${className}`} aria-labelledby={headingId}>
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-3 min-w-0">
        {icon && <div className="dashboard-card__icon" aria-hidden="true">{icon}</div>}
        <div className="min-w-0">
          {eyebrow && <p className="dashboard-card__eyebrow">{eyebrow}</p>}
          <h2 id={headingId} className="dashboard-card__title">{title}</h2>
          {description && <p className="dashboard-card__description">{description}</p>}
        </div>
      </div>
      {href && (
        <Link to={href} className="dashboard-card__action" aria-label={`${actionLabel}: ${title}`}>
          <span className="sr-only">{actionLabel}</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      )}
    </div>
    {children}
  </section>
  )
}

export default DashboardCard
