import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { ApiClientError } from '../services/api';
import AppMark from '../components/AppMark';

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
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <AppMark size={44} />
          <div>
            <h1 className="auth-title">
              {isSignUp ? 'Comece seu espaço' : 'Bem-vindo de volta'}
            </h1>
            <p className="auth-sub">Organize o que importa, um dia de cada vez.</p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 rounded-lg p-3"
            style={{
              border: '1px solid rgba(227, 109, 109, 0.4)',
              background: 'rgba(227, 109, 109, 0.1)',
              color: 'var(--danger)',
              fontSize: '0.8rem',
            }}
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="label-retro mb-1.5 block" htmlFor="auth-name">Nome</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-retro w-full px-4 py-2.5"
                placeholder="Seu nome"
                autoComplete="name"
                required
                minLength={2}
              />
            </div>
          )}

          <div>
            <label className="label-retro mb-1.5 block" htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-retro w-full px-4 py-2.5"
              placeholder="seu@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="label-retro mb-1.5 block" htmlFor="auth-password">Senha</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-retro w-full px-4 py-2.5"
              placeholder="Mínimo 6 caracteres"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full py-2.5">
            <span className="inline-flex items-center justify-center gap-2">
              {loading ? 'Aguarde...' : isSignUp ? 'Criar conta' : 'Entrar'}
              {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </span>
          </button>
        </form>

        <div className="auth-foot">
          <span>{isSignUp ? 'Já tem conta?' : 'Não tem conta?'}</span>
          <button type="button" onClick={switchMode} className="text-primary hover:text-primary-hover cursor-pointer">
            {isSignUp ? 'Faça login' : 'Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
