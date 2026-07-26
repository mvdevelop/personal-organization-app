import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { sendMessage, fetchHistory, clearHistory, addMessage, fetchDailyBriefing, fetchSuggestions } from '../store/slices/aiSlice';
import { Send, Bot, User, Trash2, Sparkles, Sun, Lightbulb, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  { icon: Sun, label: 'Resumo do dia', action: 'dailyBriefing' },
  { icon: Lightbulb, label: 'Sugerir tarefas', action: 'suggestTasks' },
  { icon: Sparkles, label: 'Dica de produtividade', action: 'tip' },
]

interface AIAssistantProps {
  onClose?: () => void
  minimal?: boolean
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, minimal }) => {
  const dispatch = useAppDispatch()
  const { messages, loading } = useAppSelector(s => s.ai)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length === 0) dispatch(fetchHistory())
  }, [dispatch, messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    dispatch(addMessage({ role: 'user', content: userMsg, timestamp: new Date().toISOString() }))

    const result = await dispatch(sendMessage(userMsg))
    if (sendMessage.fulfilled.match(result)) {
      dispatch(addMessage({ role: 'assistant', content: result.payload.response, timestamp: new Date().toISOString() }))
    } else {
      toast.error('Erro ao obter resposta')
    }
  }

  const handleSuggestion = async (action: string) => {
    if (action === 'dailyBriefing') {
      dispatch(addMessage({ role: 'user', content: '📋 Resumo do meu dia', timestamp: new Date().toISOString() }))
      const result = await dispatch(fetchDailyBriefing())
      if (fetchDailyBriefing.fulfilled.match(result)) {
        dispatch(addMessage({ role: 'assistant', content: result.payload.briefing, timestamp: new Date().toISOString() }))
      }
    } else if (action === 'suggestTasks') {
      dispatch(addMessage({ role: 'user', content: '💡 Sugira tarefas para hoje', timestamp: new Date().toISOString() }))
      const result = await dispatch(fetchSuggestions())
      if (fetchSuggestions.fulfilled.match(result)) {
        dispatch(addMessage({ role: 'assistant', content: result.payload.suggestions, timestamp: new Date().toISOString() }))
      }
    } else if (action === 'tip') {
      const tipMsg = 'Me dê uma dica rápida de produtividade para hoje'
      dispatch(addMessage({ role: 'user', content: tipMsg, timestamp: new Date().toISOString() }))
      const result = await dispatch(sendMessage(tipMsg))
      if (sendMessage.fulfilled.match(result)) {
        dispatch(addMessage({ role: 'assistant', content: result.payload.response, timestamp: new Date().toISOString() }))
      } else {
        toast.error('Erro ao obter dica')
      }
    }
  }

  const handleClear = () => {
    if (!window.confirm('Limpar histórico de conversas?')) return
    dispatch(clearHistory())
    toast.success('Histórico limpo')
  }

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`flex flex-col ${minimal ? 'h-full' : 'h-[600px]'} bg-white dark:bg-gray-800 rounded-xl shadow-warm-lg border border-gray-200 dark:border-gray-700`}>
      {/* Header */}
      <div className="arch-decoration flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="medal-ring !w-8 !h-8 !border-primary bg-primary-light dark:bg-primary/20">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-display font-semibold text-gray-900 dark:text-white">Assistente IA</h2>
          {loading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleClear} className="cursor-pointer p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400" title="Limpar conversa">
            <Trash2 className="w-4 h-4" />
          </button>
          {onClose && (
            <button onClick={onClose} className="cursor-pointer p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {messages.length === 0 && !loading && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
          <p className="font-ui text-[11px] text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Comece com um atalho:</p>
          <div className="flex gap-2 flex-wrap">
            {SUGGESTIONS.map(s => (
              <button
                key={s.action}
                onClick={() => handleSuggestion(s.action)}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg font-ui text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="font-body text-gray-500 dark:text-gray-400 text-sm">Pergunte algo sobre sua organização pessoal!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={`msg-${msg.timestamp}-${i}`} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="medal-ring !w-8 !h-8 !border-primary bg-primary-light dark:bg-primary/20">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
              <div className={`rounded-2xl px-4 py-2.5 font-body text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              <p className={`font-mono text-[10px] mt-1 text-gray-400 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="medal-ring !w-8 !h-8 !border-primary bg-primary">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={loading}
            className="input-retro flex-1 px-4 py-2.5"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-gold px-4 py-2.5 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AIAssistant
