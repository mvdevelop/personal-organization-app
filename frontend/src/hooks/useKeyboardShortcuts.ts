import { useEffect } from 'react';

interface Shortcut {
  key: string;
  ctrlOrCmd: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlOrCmdPressed = event.ctrlKey || event.metaKey;
        const shiftPressed = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altPressed = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (
          shortcut.ctrlOrCmd === ctrlOrCmdPressed &&
          shiftPressed &&
          altPressed &&
          keyMatches
        ) {
          event.preventDefault();
          shortcut.callback();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export const DEFAULT_SHORTCUTS: Record<string, Shortcut> = {
  quickCommand: {
    key: 'k',
    ctrlOrCmd: true,
    callback: () => {}, // Set by component
    description: 'Abrir comando rápido',
  },
  newTask: {
    key: 'n',
    ctrlOrCmd: true,
    callback: () => {}, // Set by component
    description: 'Criar nova tarefa',
  },
  newNote: {
    key: 'n',
    ctrlOrCmd: true,
    shift: true,
    callback: () => {}, // Set by component
    description: 'Criar nova nota',
  },
  goTasks: {
    key: 't',
    ctrlOrCmd: true,
    callback: () => {}, // Set by component
    description: 'Ir para Tarefas',
  },
  goHabits: {
    key: 'h',
    ctrlOrCmd: true,
    callback: () => {}, // Set by component
    description: 'Ir para Hábitos',
  },
  goDashboard: {
    key: 'd',
    ctrlOrCmd: true,
    callback: () => {}, // Set by component
    description: 'Ir para Dashboard',
  },
};
