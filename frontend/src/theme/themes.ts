export interface ColorTheme {
  name: string
  label: string
  description: string
  colors: {
    // Core
    primary: string
    'primary-hover': string
    'primary-light': string
    'primary-dark': string
    accent: string
    'accent-hover': string
    sidebar: string
    'sidebar-hover': string
    // Expanded retro tokens
    gold: string
    'gold-light': string
    'gold-dark': string
    'bg-base': string
    'bg-surface': string
    'bg-elevated': string
    'text-primary': string
    'text-secondary': string
    'text-tertiary': string
    border: string
    'border-strong': string
    'border-gold': string
    success: string
    danger: string
    warning: string
  }
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    name: 'default',
    label: 'Schedule Clássico',
    description: 'Azul profundo com dourado — elegante e profissional',
    colors: {
      primary: '#3b82f6',
      'primary-hover': '#2563eb',
      'primary-light': '#eff6ff',
      'primary-dark': '#1d4ed8',
      accent: '#8b5cf6',
      'accent-hover': '#7c3aed',
      sidebar: '#3b82f6',
      'sidebar-hover': '#2563eb',
      gold: '#c9a84c',
      'gold-light': '#e8d8a0',
      'gold-dark': '#a68a2e',
      'bg-base': '#faf6f0',
      'bg-surface': '#f5ede0',
      'bg-elevated': '#fefcf8',
      'text-primary': '#2d2416',
      'text-secondary': '#7a6b5a',
      'text-tertiary': '#b0a090',
      border: '#e0d5c5',
      'border-strong': '#c9b89a',
      'border-gold': '#c9a84c',
      success: '#5a8f5a',
      danger: '#a83232',
      warning: '#c47a1a',
    },
  },
  {
    name: 'emerald',
    label: 'Esmeralda',
    description: 'Verde jade com dourado — natureza e crescimento',
    colors: {
      primary: '#10b981',
      'primary-hover': '#059669',
      'primary-light': '#ecfdf5',
      'primary-dark': '#047857',
      accent: '#14b8a6',
      'accent-hover': '#0d9488',
      sidebar: '#10b981',
      'sidebar-hover': '#059669',
      gold: '#d4a74a',
      'gold-light': '#e8d8a0',
      'gold-dark': '#a68a2e',
      'bg-base': '#f6faf4',
      'bg-surface': '#ebf3e8',
      'bg-elevated': '#fcfdfb',
      'text-primary': '#1a2e1a',
      'text-secondary': '#5a7a5a',
      'text-tertiary': '#9ab09a',
      border: '#d0e0d0',
      'border-strong': '#b0c9b0',
      'border-gold': '#c9a84c',
      success: '#5a8f5a',
      danger: '#a83232',
      warning: '#c47a1a',
    },
  },
  {
    name: 'violet',
    label: 'Violeta',
    description: 'Roxo real com dourado — realeza e criatividade',
    colors: {
      primary: '#8b5cf6',
      'primary-hover': '#7c3aed',
      'primary-light': '#f5f3ff',
      'primary-dark': '#6d28d9',
      accent: '#ec4899',
      'accent-hover': '#db2777',
      sidebar: '#8b5cf6',
      'sidebar-hover': '#7c3aed',
      gold: '#d4a74a',
      'gold-light': '#e8d8a0',
      'gold-dark': '#a68a2e',
      'bg-base': '#f8f4fc',
      'bg-surface': '#f0eaf5',
      'bg-elevated': '#fdfcfe',
      'text-primary': '#241a30',
      'text-secondary': '#6a5a7a',
      'text-tertiary': '#a99ab5',
      border: '#ddd0e8',
      'border-strong': '#c0b0d0',
      'border-gold': '#c9a84c',
      success: '#5a8f5a',
      danger: '#a83232',
      warning: '#c47a1a',
    },
  },
  {
    name: 'rose',
    label: 'Rosa',
    description: 'Coral vibrante com dourado — paixão e energia',
    colors: {
      primary: '#f43f5e',
      'primary-hover': '#e11d48',
      'primary-light': '#fff1f2',
      'primary-dark': '#be123c',
      accent: '#f97316',
      'accent-hover': '#ea580c',
      sidebar: '#f43f5e',
      'sidebar-hover': '#e11d48',
      gold: '#d4a74a',
      'gold-light': '#e8d8a0',
      'gold-dark': '#a68a2e',
      'bg-base': '#fcf4f4',
      'bg-surface': '#f5e8e8',
      'bg-elevated': '#fefcfc',
      'text-primary': '#301a1a',
      'text-secondary': '#7a5a5a',
      'text-tertiary': '#b09a9a',
      border: '#e8d0d0',
      'border-strong': '#d0b0b0',
      'border-gold': '#c9a84c',
      success: '#5a8f5a',
      danger: '#a83232',
      warning: '#c47a1a',
    },
  },
  {
    name: 'amber',
    label: 'Âmbar',
    description: 'Dourado queimado com cobre — calor e conforto',
    colors: {
      primary: '#f59e0b',
      'primary-hover': '#d97706',
      'primary-light': '#fffbeb',
      'primary-dark': '#b45309',
      accent: '#ef4444',
      'accent-hover': '#dc2626',
      sidebar: '#f59e0b',
      'sidebar-hover': '#d97706',
      gold: '#d4a74a',
      'gold-light': '#e8d8a0',
      'gold-dark': '#b88a2e',
      'bg-base': '#fcf6ee',
      'bg-surface': '#f5ece0',
      'bg-elevated': '#fefbf7',
      'text-primary': '#2d2416',
      'text-secondary': '#7a6a4a',
      'text-tertiary': '#b0a080',
      border: '#e8d8c0',
      'border-strong': '#d0c0a0',
      'border-gold': '#c9a84c',
      success: '#5a8f5a',
      danger: '#a83232',
      warning: '#c47a1a',
    },
  },
  {
    name: 'teal',
    label: 'Turquesa',
    description: 'Azul esverdeado com dourado — frescor e sofisticação',
    colors: {
      primary: '#14b8a6',
      'primary-hover': '#0d9488',
      'primary-light': '#f0fdfa',
      'primary-dark': '#0f766e',
      accent: '#3b82f6',
      'accent-hover': '#2563eb',
      sidebar: '#14b8a6',
      'sidebar-hover': '#0d9488',
      gold: '#d4a74a',
      'gold-light': '#e8d8a0',
      'gold-dark': '#a68a2e',
      'bg-base': '#f0f8f6',
      'bg-surface': '#e6f0ee',
      'bg-elevated': '#fafdfc',
      'text-primary': '#162a26',
      'text-secondary': '#4a7a72',
      'text-tertiary': '#8ab0a8',
      border: '#c8e0da',
      'border-strong': '#a8c9c2',
      'border-gold': '#c9a84c',
      success: '#5a8f5a',
      danger: '#a83232',
      warning: '#c47a1a',
    },
  },
]

export interface FontOption {
  name: string
  label: string
  fontFamily: string
  googleFont?: string
  category: 'sans' | 'serif' | 'mono'
}

export const FONT_OPTIONS: FontOption[] = [
  {
    name: 'system',
    label: 'Sistema',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    category: 'sans',
  },
  {
    name: 'inter',
    label: 'Inter',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    googleFont: 'Inter:wght@300;400;500;600;700',
    category: 'sans',
  },
  {
    name: 'playfair',
    label: 'Playfair Display',
    fontFamily: '"Playfair Display", Georgia, serif',
    googleFont: 'Playfair+Display:wght@400;600;700;800;900',
    category: 'serif',
  },
  {
    name: 'roboto',
    label: 'Roboto',
    fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
    googleFont: 'Roboto:wght@300;400;500;700',
    category: 'sans',
  },
  {
    name: 'jetbrains',
    label: 'JetBrains Mono',
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    googleFont: 'JetBrains+Mono:wght@400;500;700',
    category: 'mono',
  },
]
