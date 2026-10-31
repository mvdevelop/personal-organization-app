import React, { useState, useEffect, type ReactNode } from 'react';
import { AuthContext } from './AuthContextValue';
import type { User } from './authTypes';
import { api, setAuthToken } from '../services/api';

export type { AuthContextType } from './AuthContextValue';
export { AuthContext } from './AuthContextValue';
export type { User } from './authTypes';


interface AuthResponse {
  user: User
  token: string
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Restore session on mount — cookie is sent automatically
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const user = await api.get<User>('/api/auth/me')
        setUser(user)
      } catch {
        // No valid session — user will see login page
      } finally {
        setIsLoaded(true)
      }
    }

    restoreSession()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { user, token } = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    })
    // Store the token in session storage for cross-origin API calls.
    setAuthToken(token)
    setUser(user)
  }

  const signUp = async (name: string, email: string, password: string) => {
    const { user, token } = await api.post<AuthResponse>('/api/auth/register', {
      name,
      email,
      password,
    })
    setAuthToken(token)
    setUser(user)
  }

  const signOut = async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // ignore — backend may be unreachable, clear locally anyway
    }
    setAuthToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isSignedIn: !!user,
        isLoaded,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

