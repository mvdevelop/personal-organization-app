export interface ColorTheme {
  name: string
  label: string
  colors: {
    primary: string
    'primary-hover': string
    'primary-light': string
    'primary-dark': string
    accent: string
    'accent-hover': string
    sidebar: string
    'sidebar-hover': string
  }
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    name: 'default',
    label: 'Azul Padrão',
    colors: {
      primary: '#3b82f6',
      'primary-hover': '#2563eb',
      'primary-light': '#eff6ff',
      'primary-dark': '#1d4ed8',
      accent: '#8b5cf6',
      'accent-hover': '#7c3aed',
      sidebar: '#3b82f6',
      'sidebar-hover': '#2563eb',
    },
  },
  {
    name: 'emerald',
    label: 'Esmeralda',
    colors: {
      primary: '#10b981',
      'primary-hover': '#059669',
      'primary-light': '#ecfdf5',
      'primary-dark': '#047857',
      accent: '#14b8a6',
      'accent-hover': '#0d9488',
      sidebar: '#10b981',
      'sidebar-hover': '#059669',
    },
  },
  {
    name: 'violet',
    label: 'Violeta',
    colors: {
      primary: '#8b5cf6',
      'primary-hover': '#7c3aed',
      'primary-light': '#f5f3ff',
      'primary-dark': '#6d28d9',
      accent: '#ec4899',
      'accent-hover': '#db2777',
      sidebar: '#8b5cf6',
      'sidebar-hover': '#7c3aed',
    },
  },
  {
    name: 'rose',
    label: 'Rosa',
    colors: {
      primary: '#f43f5e',
      'primary-hover': '#e11d48',
      'primary-light': '#fff1f2',
      'primary-dark': '#be123c',
      accent: '#f97316',
      'accent-hover': '#ea580c',
      sidebar: '#f43f5e',
      'sidebar-hover': '#e11d48',
    },
  },
  {
    name: 'amber',
    label: 'Âmbar',
    colors: {
      primary: '#f59e0b',
      'primary-hover': '#d97706',
      'primary-light': '#fffbeb',
      'primary-dark': '#b45309',
      accent: '#ef4444',
      'accent-hover': '#dc2626',
      sidebar: '#f59e0b',
      'sidebar-hover': '#d97706',
    },
  },
  {
    name: 'teal',
    label: 'Turquesa',
    colors: {
      primary: '#14b8a6',
      'primary-hover': '#0d9488',
      'primary-light': '#f0fdfa',
      'primary-dark': '#0f766e',
      accent: '#3b82f6',
      'accent-hover': '#2563eb',
      sidebar: '#14b8a6',
      'sidebar-hover': '#0d9488',
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
    name: 'roboto',
    label: 'Roboto',
    fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
    googleFont: 'Roboto:wght@300;400;500;700',
    category: 'sans',
  },
  {
    name: 'merriweather',
    label: 'Merriweather',
    fontFamily: '"Merriweather", Georgia, serif',
    googleFont: 'Merriweather:wght@300;400;700',
    category: 'serif',
  },
]
