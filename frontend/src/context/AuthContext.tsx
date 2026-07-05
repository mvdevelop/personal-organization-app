import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isSignedIn: boolean
  isLoaded: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => void
}

interface AuthResponse {
  user: User
  token: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
    const { user } = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    })
    // Cookie is set automatically by backend (httpOnly)
    setUser(user)
  }

  const signUp = async (name: string, email: string, password: string) => {
    const { user } = await api.post<AuthResponse>('/api/auth/register', {
      name,
      email,
      password,
    })
    // Cookie is set automatically by backend (httpOnly)
    setUser(user)
  }

  const signOut = async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // ignore — backend may be unreachable, clear locally anyway
    }
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
