import React from 'react';
import { AppMark } from './AppMark';

interface SplashScreenProps {
  isVisible: boolean;
  isDark: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isVisible, isDark }) => {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{
        background: isDark ? '#111318' : '#F1F3F9',
      }}
      role="status"
      aria-label="Carregando Smart Agenda"
    >
      <div className="text-center flex flex-col items-center gap-4">
        <div className="w-24 h-24 flex items-center justify-center animate-pulse">
          <AppMark size={96} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: isDark ? '#F1F3F9' : '#111318' }}>
            Smart Agenda
          </h1>
          <p className="text-sm mt-1" style={{ color: isDark ? '#A0A7B7' : '#747D90' }}>
            Sua agenda inteligente
          </p>
        </div>
        {/* Animated loading dots */}
        <div className="flex gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{
                background: '#7778F6',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
