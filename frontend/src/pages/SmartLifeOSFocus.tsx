import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, X, Check, Volume2, VolumeX } from 'lucide-react';
import { api } from '../services/api';
import Button from '../components/ui/Button';

interface FocusSession {
  _id: string;
  entityTitle: string;
  entityType: string;
  plannedDuration: number;
  startedAt: string;
}

const SmartLifeOSFocus: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<FocusSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [actualDuration, setActualDuration] = useState(0);
  const [notes, setNotes] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completionMode, setCompletionMode] = useState<'complete' | 'extend' | 'abandon' | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize session
  useEffect(() => {
    if (!sessionId) return;

    const initSession = async () => {
      try {
        // For now, create a dummy session from sessionStorage
        const stored = sessionStorage.getItem(`focus_session_${sessionId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSession(parsed);
          setTimeRemaining(parsed.plannedDuration * 60); // Convert to seconds
          setActualDuration(0);
        }
      } catch (err) {
        console.error('Failed to load session', err);
        navigate('/smart-os');
      }
    };

    initSession();
  }, [sessionId, navigate]);

  // Timer logic
  useEffect(() => {
    if (!isRunning || isPaused) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          setIsRunning(false);
          playSound();
          return 0;
        }
        return prev - 1;
      });
      setActualDuration(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused]);

  const playSound = () => {
    if (!soundEnabled) return;

    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleExtend = () => {
    setTimeRemaining(prev => prev + 15 * 60); // Add 15 minutes
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleComplete = async () => {
    setIsRunning(false);
    setCompletionMode('complete');

    try {
      await api.post(`/smart-os/focus-session/${sessionId}/complete`, {
        actualDuration: Math.ceil(actualDuration / 60),
        notes,
        completed: true,
      });

      setTimeout(() => {
        navigate('/smart-os');
      }, 1500);
    } catch (err) {
      console.error('Failed to complete session', err);
    }
  };

  const handleAbandon = async () => {
    setIsRunning(false);
    setCompletionMode('abandon');

    try {
      await api.post(`/smart-os/focus-session/${sessionId}/complete`, {
        actualDuration: Math.ceil(actualDuration / 60),
        notes,
        completed: false,
      });

      setTimeout(() => {
        navigate('/smart-os');
      }, 1000);
    } catch (err) {
      console.error('Failed to abandon session', err);
    }
  };

  if (!session) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-base)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
            Carregando sessão...
          </div>
        </div>
      </div>
    );
  }

  const completionPercentage = ((session.plannedDuration * 60 - timeRemaining) / (session.plannedDuration * 60)) * 100;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: `linear-gradient(135deg, var(--bg-base) 0%, var(--bg-surface) 100%)`,
        padding: '20px',
      }}
    >
      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Foco em: <strong>{session.entityTitle}</strong>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title={soundEnabled ? 'Som ligado' : 'Som desligado'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            onClick={() => handleAbandon()}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--danger)',
            }}
            title="Abandonar sessão"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Timer */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div
          style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            color: 'var(--sa-accent)',
            fontVariantNumeric: 'tabular-nums',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
            margin: '20px 0',
          }}
        >
          {formatTime(timeRemaining)}
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: '200px',
            height: '4px',
            background: 'var(--border)',
            borderRadius: '2px',
            margin: '20px auto',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'var(--sa-accent)',
              width: `${completionPercentage}%`,
              transition: 'width 0.1s ease',
            }}
          />
        </div>

        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {Math.ceil(actualDuration / 60)} minutos decorridos
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
        {!isRunning ? (
          <Button variant="primary" size="lg" onClick={handleStart}>
            <Play size={18} style={{ marginRight: '8px' }} />
            Começar
          </Button>
        ) : (
          <Button variant="secondary" size="lg" onClick={handlePause}>
            <Pause size={18} style={{ marginRight: '8px' }} />
            {isPaused ? 'Retomar' : 'Pausar'}
          </Button>
        )}

        <Button variant="secondary" size="lg" onClick={handleExtend} disabled={completionMode !== null}>
          +15min
        </Button>

        <Button
          variant="gold"
          size="lg"
          onClick={handleComplete}
          disabled={completionMode !== null}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Check size={18} />
          Concluir
        </Button>
      </div>

      {/* Notes */}
      <div style={{ width: '100%', maxWidth: '400px', marginBottom: '40px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Anotações (salvas automaticamente)
        </label>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            sessionStorage.setItem(`focus_notes_${sessionId}`, e.target.value);
          }}
          placeholder="O que você está fazendo? Como se sente?"
          style={{
            width: '100%',
            height: '80px',
            padding: '12px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            resize: 'none',
          }}
        />
      </div>

      {/* Completion message */}
      {completionMode === 'complete' && (
        <div style={{
          position: 'fixed',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--success)',
          color: 'var(--bg-base)',
          padding: '16px 24px',
          borderRadius: '8px',
          animation: 'fadeIn 0.3s ease',
        }}>
          ✓ Sessão concluída! Redirecionando...
        </div>
      )}

      {completionMode === 'abandon' && (
        <div style={{
          position: 'fixed',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--warning)',
          color: 'var(--bg-base)',
          padding: '16px 24px',
          borderRadius: '8px',
          animation: 'fadeIn 0.3s ease',
        }}>
          Sessão abandonada. Redirecionando...
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  );
};

export default SmartLifeOSFocus;
