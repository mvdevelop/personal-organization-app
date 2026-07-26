import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { ApiClientError } from '../services/api';
import LogoIcon from '../components/LogoIcon';

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        await signUp(name, email, password)
      } else {
        await signIn(email, password)
      }
      navigate('/')
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message)
      } else {
        setError('Erro de conexão com o servidor')
      }
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsSignUp(!isSignUp)
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      {/* Decorative arch background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03] dark:opacity-[0.05]">
        <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]" viewBox="0 0 800 400" fill="none">
          <path d="M0 400 Q200 0 400 0 Q600 0 800 400" stroke="currentColor" strokeWidth="2" className="text-primary" />
          <path d="M50 400 Q200 50 400 50 Q600 50 750 400" stroke="currentColor" strokeWidth="1" className="text-primary" opacity="0.5" />
          <path d="M150 400 Q250 120 400 120 Q550 120 650 400" stroke="currentColor" strokeWidth="0.5" className="text-primary" opacity="0.3" />
        </svg>
      </div>

      <div className="relative w-full max-w-md animate-fade-in bg-white dark:bg-gray-800 shadow-warm-lg arch-decoration"
        style={{
          border: '1px solid var(--color-primary-light)',
        }}
      >
        {/* Logo + Title */}
        <div className="pt-8 pb-4 text-center">
          <div className="medal-ring !w-16 !h-16 !border-primary mx-auto mb-3 bg-primary-light">
            <LogoIcon size={32} />
          </div>
          <h1 className="font-display text-2xl font-bold text-primary">
            Schedule
          </h1>
          <p className="font-body text-sm mt-1 text-gray-500 dark:text-gray-400">
            {isSignUp ? 'Crie sua conta' : 'Entre na sua conta'}
          </p>
        </div>

        <div className="divider-diamond px-8 mb-6" />

        {/* Error */}
        {error && (
          <div className="mx-8 mb-4 p-3 flex items-center gap-2 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          {isSignUp && (
            <div>
              <label className="label-retro mb-1.5 block">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-retro w-full px-4 py-2.5"
                placeholder="Seu nome"
                required
                minLength={2}
              />
            </div>
          )}

          <div>
            <label className="label-retro mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-retro w-full px-4 py-2.5"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="label-retro mb-1.5 block">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-retro w-full px-4 py-2.5"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full py-2.5 mt-2"
          >
            {loading ? 'Aguarde...' : isSignUp ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        <div className="text-center pb-8">
          <button
            onClick={switchMode}
            className="font-ui text-sm text-primary hover:text-primary-hover transition-colors cursor-pointer"
          >
            {isSignUp
              ? 'Já tem conta? Faça login'
              : 'Não tem conta? Cadastre-se'}
          </button>
        </div>

        {/* Bottom accent line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30" />
      </div>
    </div>
  )
}

export default Login
