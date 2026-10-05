import React from 'react';
import { render, screen } from '@testing-library/react';
import StatCard from '../../components/ui/StatCard';
import { ListTodo } from 'lucide-react';

describe('StatCard Component', () => {
  const defaultProps = {
    icon: ListTodo,
    label: 'Tarefas pendentes',
    value: 5,
  };

  it('should render with default props', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByText('Tarefas pendentes')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render with status neutral by default', () => {
    render(<StatCard {...defaultProps} />);
    const card = screen.getByText('5').parentElement?.parentElement;
    expect(card).toHaveClass('dashboard-kpi--neutral');
  });

  it('should render with positive status', () => {
    render(<StatCard {...defaultProps} status="positive" />);
    const card = screen.getByText('5').parentElement?.parentElement;
    expect(card).toHaveClass('dashboard-kpi--positive');
  });

  it('should render with attention status', () => {
    render(<StatCard {...defaultProps} status="attention" />);
    const card = screen.getByText('5').parentElement?.parentElement;
    expect(card).toHaveClass('dashboard-kpi--attention');
  });

  it('should render subtitle when provided', () => {
    render(<StatCard {...defaultProps} subtitle="10 total" />);
    expect(screen.getByText('10 total')).toBeInTheDocument();
  });

  it('should render status label for attention', () => {
    render(<StatCard {...defaultProps} status="attention" />);
    expect(screen.getByText('Requer atenção')).toBeInTheDocument();
  });

  it('should render status label for positive', () => {
    render(<StatCard {...defaultProps} status="positive" />);
    expect(screen.getByText('Em progresso')).toBeInTheDocument();
  });

  it('should render action label when provided', () => {
    render(<StatCard {...defaultProps} actionLabel="2 atrasadas" />);
    expect(screen.getByText('2 atrasadas')).toBeInTheDocument();
  });

  it('should apply custom color when provided', () => {
    render(<StatCard {...defaultProps} color="#ef4444" />);
    const valueElement = screen.getByText('5');
    expect(valueElement).toHaveStyle({ color: '#ef4444' });
  });

  it('should render with string value', () => {
    render(<StatCard {...defaultProps} value="100%" />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should render icon', () => {
    render(<StatCard {...defaultProps} />);
    expect(screen.getByTestId('list-todo-icon') || screen.getByLabelText('icone') || document.querySelector('svg')).toBeInTheDocument();
  });
});
