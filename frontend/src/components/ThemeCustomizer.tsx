import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setColorTheme, setFont } from '../store/slices/userPreferencesSlice';
import { COLOR_THEMES, FONT_OPTIONS } from '../theme/themes';
import { Palette, Type, X, Check } from 'lucide-react';

interface ThemeCustomizerProps {
  onClose: () => void
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ onClose }) => {
  const dispatch = useAppDispatch()
  const { colorTheme: activeColor, font: activeFont } = useAppSelector(s => s.userPreferences)
  const [previewColor, setPreviewColor] = useState(activeColor)

  const handleColorChange = (name: string) => {
    setPreviewColor(name)
    dispatch(setColorTheme(name))
  }

  const handleFontChange = (name: string) => {
    dispatch(setFont(name))
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Personalizar Tema
          </h2>
          <button onClick={onClose} className="cursor-pointer p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Color Themes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Paleta de Cores
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {COLOR_THEMES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => handleColorChange(t.name)}
                  className={`cursor-pointer relative p-3 rounded-xl border-2 transition-all text-center ${
                    previewColor === t.name
                      ? 'border-blue-500 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex gap-1 justify-center mb-2">
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: t.colors.primary }} />
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: t.colors.accent }} />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{t.label}</span>
                  {previewColor === t.name && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-600 space-y-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prévia</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Primary:</span>
              <div className="w-6 h-6 rounded" style={{ backgroundColor: `var(--color-primary)` }} />
              <div className="w-6 h-6 rounded" style={{ backgroundColor: `var(--color-primary-light)` }} />
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 text-xs text-white rounded-lg" style={{ backgroundColor: `var(--color-primary)` }}>
                Botão Primary
              </span>
              <span className="px-3 py-1.5 text-xs text-white rounded-lg" style={{ backgroundColor: `var(--color-accent)` }}>
                Botão Accent
              </span>
            </div>
          </div>

          {/* Fonts */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Type className="w-4 h-4" /> Fonte
            </h3>
            <div className="space-y-2">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.name}
                  onClick={() => handleFontChange(f.name)}
                  className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                    activeFont === f.name
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex-1 text-left">
                    <span className="block text-sm font-medium text-gray-900 dark:text-white" style={{ fontFamily: f.fontFamily }}>
                      {f.label}
                    </span>
                    <span className="block text-xs text-gray-500 mt-0.5" style={{ fontFamily: f.fontFamily }}>
                      The quick brown fox jumps over the lazy dog
                    </span>
                  </div>
                  {activeFont === f.name && (
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThemeCustomizer
