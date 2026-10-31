import { createContext } from 'react'
import type { User } from './authTypes'

export interface AuthContextType {
  user: User | null
  isSignedIn: boolean
  isLoaded: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
