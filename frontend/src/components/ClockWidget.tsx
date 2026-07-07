import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';

type ClockMode = 'digital' | 'analog'

interface ClockWidgetProps {
  compact?: boolean
}

const ClockWidget: React.FC<ClockWidgetProps> = ({ compact }) => {
  const [mode, setMode] = useState<ClockMode>(() => {
    return (localStorage.getItem('@schedule:clock-mode') as ClockMode) || 'digital'
  })
  const [time, setTime] = useState(new Date())
  const [temp, setTemp] = useState<number | null>(null)
  const [tempLoading, setTempLoading] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem('@schedule:clock-mode', mode)
  }, [mode])

  // Fetch temperature from a free API (in cache-friendly way)
  useEffect(() => {
    const cached = localStorage.getItem('@schedule:temp-cache')
    if (cached) {
      const { temp: t, ts } = JSON.parse(cached)
      if (Date.now() - ts < 30 * 60 * 1000) { setTemp(t); return }
    }
    setTempLoading(true)
    fetch('https://wttr.in/?format=%t&m')
      .then(r => r.text())
      .then(t => {
        const cleaned = t.replace(/[^0-9-]/g, '')
        const num = parseInt(cleaned, 10)
        if (!isNaN(num)) {
          setTemp(num)
          localStorage.setItem('@schedule:temp-cache', JSON.stringify({ temp: num, ts: Date.now() }))
        }
      })
      .catch(() => {
        // Fallback: simulated temp (not critical)
        setTemp(22)
      })
      .finally(() => setTempLoading(false))
  }, [])

  const toggleMode = () => {
    setMode(m => m === 'digital' ? 'analog' : 'digital')
  }

  const h = time.getHours()
  const m = time.getMinutes()
  const s = time.getSeconds()
  const isPM = h >= 12
  const h12 = h % 12 || 12

  // Analog hand angles
  const secondAngle = s * 6
  const minuteAngle = m * 6 + s * 0.1
  const hourAngle = (h % 12) * 30 + m * 0.5

  const dateStr = time.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  const tempEmoji = temp !== null
    ? temp >= 30 ? '☀️' : temp >= 20 ? '⛅' : temp >= 10 ? '🌤️' : '❄️'
    : ''

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-5 ${compact ? '' : ''}`}>
      {/* Mode toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Relógio</h3>
        </div>
        <button
          onClick={toggleMode}
          className="cursor-pointer flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors"
          title="Alternar visual"
        >
          <RefreshCw className="w-3 h-3" />
          {mode === 'digital' ? 'Analógico' : 'Digital'}
        </button>
      </div>

      {mode === 'digital' ? (
        /* ===== DIGITAL CLOCK ===== */
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-1 font-mono tracking-wider">
            <span className="text-5xl font-bold text-gray-900 dark:text-white tabular-nums">
              {String(h12).padStart(2, '0')}
            </span>
            <span className="text-5xl font-bold text-primary animate-pulse-slow">:</span>
            <span className="text-5xl font-bold text-gray-900 dark:text-white tabular-nums">
              {String(m).padStart(2, '0')}
            </span>
            <span className="text-lg font-semibold text-gray-400 ml-1 self-end mb-2">
              {isPM ? 'PM' : 'AM'}
            </span>
          </div>

          {/* Seconds and temperature row */}
          <div className="flex items-center justify-center gap-4 mt-1">
            <span className="text-sm text-gray-400 font-mono tabular-nums">
              {String(s).padStart(2, '0')}s
            </span>
            {temp !== null && (
              <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                {tempEmoji} {temp}°C
              </span>
            )}
            {tempLoading && (
              <span className="text-xs text-gray-400">...</span>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 capitalize">
            {dateStr}
          </p>
        </div>
      ) : (
        /* ===== ANALOG CLOCK ===== */
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40">
            {/* Clock face */}
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Outer ring */}
              <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="2" />
              <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-800" strokeWidth="1" />

              {/* Hour markers */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 - 90) * Math.PI / 180
                const inner = i % 3 === 0 ? 78 : 82
                const outer = 88
                return (
                  <line
                    key={i}
                    x1={100 + outer * Math.cos(angle)}
                    y1={100 + outer * Math.sin(angle)}
                    x2={100 + inner * Math.cos(angle)}
                    y2={100 + inner * Math.sin(angle)}
                    stroke="currentColor"
                    className={i % 3 === 0 ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}
                    strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
                    strokeLinecap="round"
                  />
                )
              })}

              {/* Hour hand */}
              <line
                x1="100" y1="100"
                x2={100 + 45 * Math.cos((hourAngle - 90) * Math.PI / 180)}
                y2={100 + 45 * Math.sin((hourAngle - 90) * Math.PI / 180)}
                stroke="currentColor"
                className="text-gray-800 dark:text-white"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Minute hand */}
              <line
                x1="100" y1="100"
                x2={100 + 65 * Math.cos((minuteAngle - 90) * Math.PI / 180)}
                y2={100 + 65 * Math.sin((minuteAngle - 90) * Math.PI / 180)}
                stroke="currentColor"
                className="text-gray-700 dark:text-gray-200"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Second hand */}
              <line
                x1="100" y1="100"
                x2={100 + 70 * Math.cos((secondAngle - 90) * Math.PI / 180)}
                y2={100 + 70 * Math.sin((secondAngle - 90) * Math.PI / 180)}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Center dot */}
              <circle cx="100" cy="100" r="4" className="fill-gray-800 dark:fill-white" />
              <circle cx="100" cy="100" r="2" fill="#ef4444" />
            </svg>
          </div>

          {/* Digital reading below */}
          <div className="text-center mt-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white font-mono tabular-nums">
                {String(h12).padStart(2, '0')}:{String(m).padStart(2, '0')}
              </span>
              <span className="text-xs font-semibold text-gray-400">{isPM ? 'PM' : 'AM'}</span>
              {temp !== null && (
                <span className="text-sm text-gray-500 flex items-center gap-1 ml-2">
                  {tempEmoji} {temp}°
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 capitalize">{dateStr}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClockWidget
