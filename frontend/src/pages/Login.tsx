import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { ApiClientError } from '../services/api';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50/70 dark:bg-gray-900/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          {isSignUp ? (
            <UserPlus className="w-8 h-8 text-blue-500" />
          ) : (
            <LogIn className="w-8 h-8 text-blue-500" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          {isSignUp ? 'Criar Conta' : 'Entrar'}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                placeholder="Seu nome"
                required
                minLength={2}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Aguarde...' : isSignUp ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={switchMode}
            className="text-sm text-primary hover:text-primary-hover transition-colors"
          >
            {isSignUp
              ? 'Já tem conta? Faça login'
              : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
