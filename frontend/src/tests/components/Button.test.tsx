import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../components/ui/Button';
import { Plus } from 'lucide-react';

describe('Button Component', () => {
  it('should render children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('should render with primary variant by default', () => {
    render(<Button>Primary Button</Button>);
    const button = screen.getByRole('button', { name: 'Primary Button' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
  });

  it('should render with gold variant', () => {
    render(<Button variant="gold">Gold Button</Button>);
    const button = screen.getByRole('button', { name: 'Gold Button' });
    expect(button).toHaveClass('btn-gold');
  });

  it('should render with secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole('button', { name: 'Secondary Button' });
    expect(button).toHaveClass('btn-outline');
  });

  it('should render with danger variant', () => {
    render(<Button variant="danger">Danger Button</Button>);
    const button = screen.getByRole('button', { name: 'Danger Button' });
    expect(button).toHaveClass('btn-danger');
  });

  it('should render with ghost variant', () => {
    render(<Button variant="ghost">Ghost Button</Button>);
    const button = screen.getByRole('button', { name: 'Ghost Button' });
    expect(button).toHaveClass('bg-transparent');
  });

  it('should render different sizes', () => {
    render(
      <>
        <Button size="sm" data-testid="small">Small</Button>
        <Button size="md" data-testid="medium">Medium</Button>
        <Button size="lg" data-testid="large">Large</Button>
      </>
    );
    const small = screen.getByTestId('small');
    const medium = screen.getByTestId('medium');
    const large = screen.getByTestId('large');

    expect(small).toHaveClass('px-3', 'py-1.5', 'text-xs');
    expect(medium).toHaveClass('px-4', 'py-2', 'text-sm');
    expect(large).toHaveClass('px-6', 'py-3', 'text-base');
  });

  it('should render with icon', () => {
    render(
      <Button icon={<Plus data-testid="icon" />}>
        With Icon
      </Button>
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'With Icon' })).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Clickable' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('should apply custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button', { name: 'Custom' });
    expect(button).toHaveClass('custom-class');
  });
});
