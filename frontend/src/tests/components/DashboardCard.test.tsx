import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardCard from '../../components/ui/DashboardCard';
import { ClipboardList } from 'lucide-react';

describe('DashboardCard Component', () => {
  const defaultProps = {
    title: 'Minha Tarefa',
    description: 'Descrição da tarefa',
    icon: <ClipboardList className="w-5 h-5" />,
    children: <p>Conteúdo do card</p>,
  };

  const renderWithRouter = (element: React.ReactElement) => {
    render(<BrowserRouter>{element}</BrowserRouter>);
  };

  it('should render title and description', () => {
    renderWithRouter(<DashboardCard {...defaultProps} />);
    expect(screen.getByText('Minha Tarefa')).toBeInTheDocument();
    expect(screen.getByText('Descrição da tarefa')).toBeInTheDocument();
  });

  it('should render children content', () => {
    renderWithRouter(<DashboardCard {...defaultProps} />);
    expect(screen.getByText('Conteúdo do card')).toBeInTheDocument();
  });

  it('should render eyebrow when provided', () => {
    renderWithRouter(<DashboardCard {...defaultProps} eyebrow="Recomendação" />);
    expect(screen.getByText('Recomendação')).toBeInTheDocument();
  });

  it('should render action link when href is provided', () => {
    renderWithRouter(<DashboardCard {...defaultProps} href="/tasks" actionLabel="Abrir tarefas" />);
    const link = screen.getByRole('link', { name: 'Abrir tarefas: Minha Tarefa' });
    expect(link).toHaveAttribute('href', '/tasks');
  });

  it('should use default action label "Ver detalhes"', () => {
    renderWithRouter(<DashboardCard {...defaultProps} href="/tasks" />);
    expect(screen.getByRole('link', { name: 'Ver detalhes: Minha Tarefa' })).toBeInTheDocument();
  });

  it('should not render action link when href is not provided', () => {
    renderWithRouter(<DashboardCard {...defaultProps} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should generate accessible heading id from title', () => {
    renderWithRouter(<DashboardCard {...defaultProps} />);
    const heading = screen.getByText('Minha Tarefa');
    expect(heading.id).toBe('dashboard-card-minha-tarefa');
  });

  it('should handle special characters in title for id', () => {
    renderWithRouter(<DashboardCard {...defaultProps} title="Tarefa #1! @test" />);
    const heading = screen.getByText('Tarefa #1! @test');
    expect(heading.id).toBe('dashboard-card-tarefa-1-test');
  });

  it('should apply custom className', () => {
    renderWithRouter(<DashboardCard {...defaultProps} className="custom-class" />);
    const card = document.querySelector('.dashboard-card');
    expect(card).toHaveClass('custom-class');
  });
});
