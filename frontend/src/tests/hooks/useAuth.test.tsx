import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
import { AuthProvider } from '../../context/AuthContext';
import { api } from '../../services/api';

// Mock do API client
vi.mock('../../services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
  setAuthToken: vi.fn(),
  getAuthToken: vi.fn(),
}));

// Componente de teste para usar o hook
const TestComponent: React.FC = () => {
  const { isSignedIn, isLoaded, user, signIn, signUp, signOut } = useAuth();

  return (
    <div>
      <span data-testid="isSignedIn">{isSignedIn ? 'true' : 'false'}</span>
      <span data-testid="isLoaded">{isLoaded ? 'true' : 'false'}</span>
      <span data-testid="user-name">{user?.name || 'null'}</span>
      <span data-testid="user-email">{user?.email || 'null'}</span>
      <button onClick={() => signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => signUp('Test User', 'test@example.com', 'password')}>Sign Up</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
};

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<AuthProvider>{ui}</AuthProvider>);
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('should initialize with isLoaded false', () => {
    renderWithProvider(<TestComponent />);
    expect(screen.getByTestId('isLoaded')).toHaveTextContent('false');
    expect(screen.getByTestId('isSignedIn')).toHaveTextContent('false');
  });

  it('should set isLoaded to true after session check', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ id: '1', name: 'Test User', email: 'test@example.com' });
    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('isLoaded')).toHaveTextContent('true');
    });
  });

  it('should set isSignedIn to true when session is valid', async () => {
    (api.get as jest.Mock).mockResolvedValueOnce({ id: '1', name: 'Test User', email: 'test@example.com' });
    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('isSignedIn')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
  });

  it('should remain isSignedIn false when session is invalid', async () => {
    (api.get as jest.Mock).mockRejectedValueOnce(new Error('Unauthorized'));
    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('isLoaded')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('isSignedIn')).toHaveTextContent('false');
  });

  it('should sign in with correct credentials', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const mockToken = 'mock-jwt-token';
    (api.post as jest.Mock).mockResolvedValueOnce({ user: mockUser, token: mockToken });

    renderWithProvider(<TestComponent />);

    const signInButton = screen.getByText('Sign In');
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('isSignedIn')).toHaveTextContent('true');
    });
  });

  it('should sign up with correct data', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const mockToken = 'mock-jwt-token';
    (api.post as jest.Mock).mockResolvedValueOnce({ user: mockUser, token: mockToken });

    renderWithProvider(<TestComponent />);

    const signUpButton = screen.getByText('Sign Up');
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
      });
    });
  });

  it('should sign out by clearing token and user', async () => {
    // Primeiro, faça login
    (api.post as jest.Mock).mockResolvedValueOnce({
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      token: 'mock-jwt-token',
    });

    renderWithProvider(<TestComponent />);

    const signInButton = screen.getByText('Sign In');
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByTestId('isSignedIn')).toHaveTextContent('true');
    });

    // Realiza logout
    (api.post as jest.Mock).mockResolvedValueOnce({ message: 'Logout realizado com sucesso' });
    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(screen.getByTestId('isSignedIn')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('user-name')).toHaveTextContent('null');
  });

  it('should handle sign in error gracefully', async () => {
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('Credenciais inválidas'));

    renderWithProvider(<TestComponent />);

    const signInButton = screen.getByText('Sign In');
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByTestId('isSignedIn')).toHaveTextContent('false');
    });
  });
});
