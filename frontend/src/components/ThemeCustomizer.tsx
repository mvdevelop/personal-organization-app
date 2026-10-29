import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setTheme, setSidebarCollapsed } from '../store/slices/userPreferencesSlice';
import { Palette, X, Check, Sun, Moon, PanelLeft } from 'lucide-react';

interface ThemeCustomizerProps {
  onClose: () => void
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ onClose }) => {
  const dispatch = useAppDispatch()
  const { theme, sidebarCollapsed } = useAppSelector(s => s.userPreferences)

  const themes = [
    { value: 'dark' as const, label: 'Escuro', hint: 'Recomendado', icon: Moon },
    { value: 'light' as const, label: 'Claro', hint: 'Ambiente iluminado', icon: Sun },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6, 8, 12, 0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="appearance-title"
    >
      <div className="sa-card w-full max-w-md" style={{ padding: 0 }}>
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid var(--sa-border)' }}
        >
          <h2 id="appearance-title" className="sa-card-title">
            <span className="sa-glyph is-accent"><Palette /></span>
            Aparência
          </h2>
          <button type="button" onClick={onClose} className="sa-icon-btn" aria-label="Fechar aparência">
            <X />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <section>
            <h3 className="label-retro mb-3 block">Tema</h3>
            <div className="grid grid-cols-2 gap-3">
              {themes.map(({ value, label, hint, icon: Icon }) => {
                const selected = theme === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => dispatch(setTheme(value))}
                    aria-pressed={selected}
                    className="flex flex-col gap-2 rounded-xl p-3 text-left transition-colors"
                    style={{
                      border: `1px solid ${selected ? 'var(--sa-accent-line)' : 'var(--sa-border)'}`,
                      background: selected ? 'var(--sa-accent-soft)' : 'var(--sa-raised)',
                    }}
                  >
                    <span className="flex items-center justify-between">
                      <Icon
                        className="h-4 w-4"
                        style={{ color: selected ? 'var(--sa-accent)' : 'var(--sa-text-3)' }}
                        aria-hidden="true"
                      />
                      {selected && <Check className="h-4 w-4" style={{ color: 'var(--sa-accent)' }} aria-hidden="true" />}
                    </span>
                    <span style={{ color: 'var(--sa-text)', fontWeight: 600, fontSize: '0.82rem' }}>{label}</span>
                    <span style={{ color: 'var(--sa-text-3)', fontSize: '0.68rem' }}>{hint}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section>
            <h3 className="label-retro mb-3 block">Navegação</h3>
            <button
              type="button"
              onClick={() => dispatch(setSidebarCollapsed(!sidebarCollapsed))}
              aria-pressed={sidebarCollapsed}
              className="flex w-full items-center justify-between rounded-xl p-3 transition-colors"
              style={{ border: '1px solid var(--sa-border)', background: 'var(--sa-raised)' }}
            >
              <span className="flex items-center gap-2" style={{ color: 'var(--sa-text)', fontSize: '0.82rem' }}>
                <PanelLeft className="h-4 w-4" style={{ color: 'var(--sa-text-3)' }} aria-hidden="true" />
                Menu lateral recolhido
              </span>
              <span
                aria-hidden="true"
                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                style={{ background: sidebarCollapsed ? 'var(--sa-accent)' : 'var(--sa-border-strong)' }}
              >
                <span
                  className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
                  style={{ transform: `translateX(${sidebarCollapsed ? 18 : 2}px)` }}
                />
              </span>
            </button>
          </section>

          <p style={{ color: 'var(--sa-text-3)', fontSize: '0.68rem', margin: 0 }}>
            Suas preferências ficam salvas neste navegador.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ThemeCustomizer
