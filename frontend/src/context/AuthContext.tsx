import React, { createContext, useContext, useState, type ReactNode } from 'react';

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
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 'user-local-dev',
    name: 'Usuário Local',
    email: 'dev@local.dev',
  })
  const [isLoaded] = useState(true)

  const signIn = async (email: string, password: string) => {
    // TODO: integrar com backend futuro
    setUser({
      id: 'user-local-dev',
      name: 'Usuário Local',
      email,
    })
  }

  const signOut = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isSignedIn: !!user, isLoaded, signIn, signOut }}>
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
