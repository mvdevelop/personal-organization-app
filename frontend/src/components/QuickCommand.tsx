import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, X } from 'lucide-react';
import { createFocusTrap } from '../utils/a11y';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  action: () => void;
  category: 'navigation' | 'action' | 'settings';
  icon?: React.ReactNode;
}

interface QuickCommandProps {
  isOpen: boolean;
  onClose: () => void;
}

function fuzzyMatch(query: string, text: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();

  if (lowerText.includes(lowerQuery)) return 100;

  let score = 0;
  let queryIdx = 0;
  let textIdx = 0;

  while (queryIdx < lowerQuery.length && textIdx < lowerText.length) {
    if (lowerQuery[queryIdx] === lowerText[textIdx]) {
      score += 10;
      queryIdx++;
    }
    textIdx++;
  }

  return queryIdx === lowerQuery.length ? score : 0;
}

const QuickCommand: React.FC<QuickCommandProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupFocusTrap = useRef<(() => void) | null>(null);

  const commands: CommandItem[] = [
    {
      id: 'go-dashboard',
      label: 'Dashboard',
      description: 'Ir para o painel principal',
      category: 'navigation',
      action: () => {
        navigate('/');
        onClose();
      },
    },
    {
      id: 'go-tasks',
      label: 'Tarefas',
      description: 'Gerenciar suas tarefas',
      category: 'navigation',
      action: () => {
        navigate('/tasks');
        onClose();
      },
    },
    {
      id: 'go-notes',
      label: 'Notas',
      description: 'Ver e criar notas',
      category: 'navigation',
      action: () => {
        navigate('/notes');
        onClose();
      },
    },
    {
      id: 'go-habits',
      label: 'Hábitos',
      description: 'Rastrear seus hábitos',
      category: 'navigation',
      action: () => {
        navigate('/habits');
        onClose();
      },
    },
    {
      id: 'go-goals',
      label: 'Metas',
      description: 'Gerenciar suas metas',
      category: 'navigation',
      action: () => {
        navigate('/goals');
        onClose();
      },
    },
    {
      id: 'go-studies',
      label: 'Estudos',
      description: 'Gerenciar sessões de estudo',
      category: 'navigation',
      action: () => {
        navigate('/studies');
        onClose();
      },
    },
    {
      id: 'go-ai',
      label: 'Assistente IA',
      description: 'Chat com IA',
      category: 'navigation',
      action: () => {
        navigate('/ai');
        onClose();
      },
    },
    {
      id: 'go-smart-os',
      label: 'Smart Life OS',
      description: 'Planejamento inteligente',
      category: 'navigation',
      action: () => {
        navigate('/smart-os');
        onClose();
      },
    },
    {
      id: 'go-settings',
      label: 'Configurações',
      description: 'Ajustar preferências',
      category: 'settings',
      action: () => {
        navigate('/settings');
        onClose();
      },
    },
  ];

  const filtered = commands
    .map(cmd => ({ ...cmd, score: query ? fuzzyMatch(query, cmd.label + ' ' + cmd.description) : 100 }))
    .filter(cmd => cmd.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);

      // Setup focus trap
      if (containerRef.current) {
        cleanupFocusTrap.current = createFocusTrap(containerRef.current);
      }
    }

    return () => {
      cleanupFocusTrap.current?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (selectedIndex >= filtered.length) setSelectedIndex(Math.max(0, filtered.length - 1));
  }, [filtered.length, selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filtered.length === 0 && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter')) {
      e.preventDefault();
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center pt-16"
      onClick={onClose}
      role="presentation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" style={{ backdropFilter: 'blur(4px)' }} />

      {/* Modal */}
      <div
        ref={containerRef}
        className="relative w-full max-w-md rounded-lg shadow-lg"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-labelledby="qc-title"
        aria-describedby="qc-desc"
      >
        {/* Search Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <Search className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Digite comando..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-controls="quick-command-list"
            aria-expanded="true"
            aria-activedescendant={filtered[selectedIndex] ? `quick-command-option-${filtered[selectedIndex].id}` : undefined}
            className="flex-1 bg-transparent border-0 outline-none text-sm"
            style={{ color: 'var(--text)' }}
          />
          <button
            onClick={onClose}
            className="p-1 rounded hover:opacity-70"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto" role="listbox" aria-label="Comandos disponíveis" id="quick-command-list">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Nenhum comando encontrado
            </div>
          ) : (
            filtered.map((cmd, index) => (
              <button
                key={cmd.id}
                id={`quick-command-option-${cmd.id}`}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => cmd.action()}
                className="w-full px-4 py-3 text-left text-sm border-b transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  background: index === selectedIndex ? 'var(--bg-raised)' : 'transparent',
                  color: index === selectedIndex ? 'var(--accent)' : 'var(--text)',
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="font-medium">{cmd.label}</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {cmd.description}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer - Shortcuts Info */}
        {filtered.length > 0 && (
          <div
            className="px-4 py-2 text-xs border-t flex items-center justify-between"
            style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}
          >
            <span>
              <Command className="w-3 h-3 inline mr-1" />
              K para abrir
            </span>
            <span>↑↓ navegar • Enter confirmar</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickCommand;
