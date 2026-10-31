import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchAISettings,
  saveProviderConfig,
  deleteProvider,
  testProviderConnection,
  clearTestConnection,
  type AIProviderConfig,
  type AIProviderType,
} from '../store/slices/aiSettingsSlice';

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Check, TestTube, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PROVIDER_OPTIONS = [
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'google', label: 'Google (Gemini)' },
]

const DEFAULT_MODELS: Record<string, string> = {
  openrouter: 'gpt-4o-mini',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-sonnet-20241022',
  google: 'gemini-1.5-flash',
}

const Settings: React.FC = () => {
  const dispatch = useAppDispatch()
  const { providers, loading, error, testConnectionResult } = useAppSelector(s => s.aiSettings)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProvider, setEditingProvider] = useState<AIProviderType | null>(null)
  const [formData, setFormData] = useState({
    type: 'openrouter' as string,
    apiKey: '',
    model: '',
  })

  useEffect(() => {
    dispatch(fetchAISettings())
  }, [dispatch])

  const handleOpenAdd = () => {
    setEditingProvider(null)
    setFormData({ type: 'openrouter', apiKey: '', model: DEFAULT_MODELS.openrouter })
    setShowAddModal(true)
    dispatch(clearTestConnection())
  }

  const handleEdit = (provider: AIProviderConfig) => {
    setEditingProvider(provider.type)
    setFormData({ type: provider.type, apiKey: '', model: provider.model })
    setShowAddModal(true)
    dispatch(clearTestConnection())
  }

  const handleDelete = async (type: string) => {
    if (!confirm('Remover este provedor de IA? Suas chaves serão excluídas.')) return
    try {
      await dispatch(deleteProvider(type as AIProviderType)).unwrap()
      toast.success('Provedor removido')
    } catch {
      toast.error('Erro ao remover provedor')
    }
  }

  const handleTestConnection = async () => {
    if (!formData.apiKey.trim()) {
      toast.error('Insira uma API Key para testar')
      return
    }

    try {
      const result = await dispatch(testProviderConnection({
        type: formData.type as AIProviderType,
        apiKey: formData.apiKey,
        model: formData.model,
      })).unwrap()

      if (result.success) {
        toast.success('Conexão bem-sucedida!')
      } else {
        toast.error(`Falha: ${result.error}`)
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Erro ao testar conexão'))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.apiKey.trim()) {
      toast.error('API Key é obrigatória')
      return
    }

    try {
      await dispatch(saveProviderConfig({
        type: formData.type as AIProviderType,
        apiKey: formData.apiKey,
        model: formData.model,
        isDefault: providers.length === 0 || !editingProvider,
      })).unwrap()

      toast.success(editingProvider ? 'Provedor atualizado' : 'Provedor salvo')
      setShowAddModal(false)
      setFormData({ type: 'openrouter', apiKey: '', model: '' })
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Erro ao salvar'))
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Configurações"
        subtitle="Inteligência Artificial"
        className="mb-6"
      >
        <Button variant="gold" size="sm" onClick={handleOpenAdd}>
          Adicionar Provedor
        </Button>
      </PageHeader>

      <div className="space-y-4">
        {providers.length === 0 ? (
          <div className="text-center py-12 sa-card">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhum provedor configurado
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Configure uma API Key de provedora de IA para ativar os recursos de inteligência artificial.
            </p>
            <Button variant="primary" onClick={handleOpenAdd}>
              Adicionar Provedor
            </Button>
          </div>
        ) : (
          providers.map(provider => (
            <div key={provider.type} className="sa-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {PROVIDER_OPTIONS.find(p => p.value === provider.type)?.label || provider.type}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Modelo: {provider.model}
                      {provider.isDefault && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                          Padrão
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                    {provider.apiKey || 'Não configurada'}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(provider)}>
                    Editar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(provider.type)}>
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Provider Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingProvider ? 'Editar Provedor' : 'Adicionar Provedor'}
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label-retro mb-1.5 block">Provedor</label>
            <select
              value={formData.type}
              onChange={e => {
                const newType = e.target.value
                setFormData(prev => ({
                  ...prev,
                  type: newType,
                  model: DEFAULT_MODELS[newType] || '',
                  apiKey: '',
                }))
                dispatch(clearTestConnection())
              }}
              className="select-retro w-full px-3 py-2"
            >
              {PROVIDER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <Input
            label="API Key"
            type="password"
            value={formData.apiKey}
            onChange={e => setFormData({ ...formData, apiKey: e.target.value })}
            placeholder="Digite sua API Key"
          />

          <Input
            label="Modelo"
            value={formData.model}
            onChange={e => setFormData({ ...formData, model: e.target.value })}
            placeholder={DEFAULT_MODELS[formData.type] || 'model-name'}
          />

          <div className="flex items-center justify-between">
            <span className="label-retro text-xs text-gray-500 dark:text-gray-400">
              As chaves são criptografadas e nunca expostas no frontend
            </span>
            <Button
              type="button"
              variant={testConnectionResult?.success ? 'ghost' : 'secondary'}
              size="sm"
              onClick={handleTestConnection}
              disabled={loading || !formData.apiKey}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : testConnectionResult?.success ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              Testar Conexão
            </Button>
          </div>

          {testConnectionResult && (
            <div className={`text-xs p-2 rounded ${
              testConnectionResult.success
                ? 'bg-success/10 text-success'
                : 'bg-danger/10 text-danger'
            }`}>
              {testConnectionResult.success
                ? 'Conexão verificada com sucesso!'
                : `Erro: ${testConnectionResult.error}`}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="gold"
              type="submit"
              className="flex-1"
              disabled={!formData.apiKey}
            >
              {editingProvider ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>

      {error && (
        <div className="text-sm text-danger" style={{ color: 'var(--danger)' }}>
          {error}
        </div>
      )}
    </div>
  )
}

export default Settings
