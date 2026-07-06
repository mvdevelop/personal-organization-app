import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Loader2, Sparkles } from 'lucide-react';

interface WeatherData {
  temperature: number
  apparentTemp: number
  weatherCode: number
  humidity: number
  city: string
  loading: boolean
  error: boolean
}

const WEATHER_CACHE_KEY = '@schedule:weather-cache'
const CITY_CACHE_KEY = '@schedule:city-cache'

// Fallback city quando geolocalização não está disponível
const FALLBACK_CITY = 'Teresópolis'

/**
 * Maps WMO weather codes to emoji + label.
 * See https://open-meteo.com/en/docs#weathervariables
 */
function weatherEmoji(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 2) return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 57) return '🌧️'
  if (code <= 67) return '🌦️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '🌧️'
  if (code <= 86) return '🌨️'
  return '🌈'
}

function weatherLabel(code: number): string {
  if (code === 0) return 'Céu limpo'
  if (code === 1) return 'Parcialmente nublado'
  if (code === 2) return 'Nublado'
  if (code <= 48) return 'Nevoeiro'
  if (code <= 57) return 'Garoa'
  if (code <= 67) return 'Chuva'
  if (code <= 77) return 'Neve'
  if (code <= 82) return 'Chuva forte'
  if (code <= 86) return 'Aguaceiros de neve'
  return 'Trovoadas'
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 0,
    apparentTemp: 0,
    weatherCode: 0,
    humidity: 0,
    city: '',
    loading: true,
    error: false,
  })
  const [time, setTime] = useState(new Date())
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [clockMode, setClockMode] = useState<'digital' | 'analog'>(() => {
    return (localStorage.getItem('@schedule:clock-mode') as 'digital' | 'analog') || 'digital'
  })

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Reverse geocode via Open-Meteo (free, no key)
  const fetchCityFromCoords = useCallback(async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=pt&count=1`
      )
      const data = await res.json()
      const city = data?.results?.[0]
        ? [data.results[0].name, data.results[0].admin1, data.results[0].country]
            .filter(Boolean)
            .join(', ')
        : 'Localização desconhecida'

      localStorage.setItem(CITY_CACHE_KEY, JSON.stringify({ lat, lon, city, ts: Date.now() }))
      setWeather(prev => ({ ...prev, city }))
    } catch {
      setWeather(prev => ({ ...prev, city: 'Localização' }))
    }
  }, [])

  // Geocode a city name to coordinates (fallback when geolocation fails)
  const fetchCoordsFromCity = useCallback(async (cityName: string) => {
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=pt`
      )
      const data = await res.json()
      const result = data?.results?.[0]
      if (result) {
        const { latitude: lat, longitude: lon, name, admin1, country } = result
        const city = [name, admin1, country].filter(Boolean).join(', ')
        localStorage.setItem(CITY_CACHE_KEY, JSON.stringify({ lat, lon, city, ts: Date.now() }))
        setCoords({ lat, lon })
        setWeather(prev => ({ ...prev, city }))
      } else {
        setWeather(prev => ({ ...prev, city: cityName, loading: false }))
      }
    } catch {
      setWeather(prev => ({ ...prev, city: cityName, loading: false }))
    }
  }, [])

  // Get user location (cached) — fallback para cidade fixa se geolocation falhar
  useEffect(() => {
    const cached = localStorage.getItem(CITY_CACHE_KEY)
    if (cached) {
      try {
        const { lat, lon, city } = JSON.parse(cached)
        setCoords({ lat, lon })
        setWeather(prev => ({ ...prev, city }))
        return // cache válido, não precisa de geolocation
      } catch { /* ignore */ }
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lon = pos.coords.longitude
          setCoords({ lat, lon })
          fetchCityFromCoords(lat, lon)
        },
        () => {
          // Geolocation falhou — usa fallback por nome da cidade
          fetchCoordsFromCity(FALLBACK_CITY)
        },
        { timeout: 5000, enableHighAccuracy: false }
      )
    } else {
      // Sem suporte a geolocation — usa fallback por nome
      fetchCoordsFromCity(FALLBACK_CITY)
    }
  }, [fetchCityFromCoords, fetchCoordsFromCity])

  // Fetch weather from Open-Meteo
  useEffect(() => {
    if (!coords) return

    const cached = localStorage.getItem(WEATHER_CACHE_KEY)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (Date.now() - parsed.ts < 30 * 60 * 1000) {
          setWeather(prev => ({
            ...prev,
            temperature: parsed.temperature,
            apparentTemp: parsed.apparentTemp,
            weatherCode: parsed.weatherCode,
            humidity: parsed.humidity,
            loading: false,
          }))
          return
        }
      } catch { /* ignore */ }
    }

    setWeather(prev => ({ ...prev, loading: true }))

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code&timezone=auto`
    )
      .then(r => r.json())
      .then(data => {
        const current = data.current
        const w: Partial<WeatherData> = {
          temperature: Math.round(current.temperature_2m),
          apparentTemp: Math.round(current.apparent_temperature),
          weatherCode: current.weather_code,
          humidity: current.relative_humidity_2m,
          loading: false,
          error: false,
        }
        localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ ...w, ts: Date.now() }))
        setWeather(prev => ({ ...prev, ...w }))
      })
      .catch(() => {
        setWeather(prev => ({ ...prev, loading: false, error: true }))
      })
  }, [coords])

  const h = time.getHours()
  const m = time.getMinutes()
  const hourStr = String(h).padStart(2, '0')
  const minStr = String(m).padStart(2, '0')

  const s = time.getSeconds()
  const secStr = String(s).padStart(2, '0')

  // Analog clock angles
  const secondAngle = s * 6
  const minuteAngle = m * 6 + s * 0.1
  const hourAngle = (h % 12) * 30 + m * 0.5

  const isPM = h >= 12
  const h12 = h % 12 || 12

  const greeting = h < 12 ? 'Bom dia! ☀️' : h < 18 ? 'Boa tarde! 🌤️' : 'Boa noite! 🌙'

  const dateStr = time.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const toggleClock = () => {
    setClockMode(m => {
      const next = m === 'digital' ? 'analog' : 'digital'
      localStorage.setItem('@schedule:clock-mode', next)
      return next
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Greeting + Clock + Date */}
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                {greeting}
              </h1>
            </div>

            {clockMode === 'digital' ? (
              /* ⏱ Digital clock with seconds */
              <div className="flex items-baseline gap-0.5 select-none">
                <span className="text-3xl sm:text-4xl font-mono font-bold text-primary tabular-nums tracking-wider">
                  {hourStr}
                </span>
                <span className="text-3xl sm:text-4xl font-mono font-bold text-primary tabular-nums animate-colon">
                  :
                </span>
                <span className="text-3xl sm:text-4xl font-mono font-bold text-primary tabular-nums tracking-wider">
                  {minStr}
                </span>
                <span className="text-base sm:text-lg font-mono font-semibold text-gray-400 tabular-nums ml-1 self-end mb-1">
                  {secStr}
                </span>
              </div>
            ) : (
              /* 🕰 Retro analog clock */
              <div className="flex items-center gap-3" style={{ fontFamily: 'Georgia, serif' }}>
                <svg width="56" height="56" viewBox="0 0 100 100" className="flex-shrink-0">
                  {/* Outer ring */}
                  <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor"
                    className="text-amber-600 dark:text-amber-400" strokeWidth="2.5" />
                  <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor"
                    className="text-amber-500/30 dark:text-amber-300/20" strokeWidth="1" />

                  {/* Hour markers — Roman numeral style dots */}
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
                    const rad = (angle - 90) * Math.PI / 180
                    const isMain = i % 3 === 0
                    return (
                      <circle
                        key={i}
                        cx={50 + (isMain ? 39 : 41) * Math.cos(rad)}
                        cy={50 + (isMain ? 39 : 41) * Math.sin(rad)}
                        r={isMain ? 2.5 : 1.2}
                        className={isMain ? 'fill-amber-700 dark:fill-amber-300' : 'fill-amber-500/60 dark:fill-amber-400/50'}
                      />
                    )
                  })}

                  {/* Hour hand */}
                  <line x1="50" y1="50"
                    x2={50 + 22 * Math.cos((hourAngle - 90) * Math.PI / 180)}
                    y2={50 + 22 * Math.sin((hourAngle - 90) * Math.PI / 180)}
                    stroke="currentColor" className="text-amber-800 dark:text-amber-200"
                    strokeWidth="3.5" strokeLinecap="round" />

                  {/* Minute hand */}
                  <line x1="50" y1="50"
                    x2={50 + 32 * Math.cos((minuteAngle - 90) * Math.PI / 180)}
                    y2={50 + 32 * Math.sin((minuteAngle - 90) * Math.PI / 180)}
                    stroke="currentColor" className="text-amber-700 dark:text-amber-300"
                    strokeWidth="2.5" strokeLinecap="round" />

                  {/* Second hand */}
                  <line x1="50" y1="50"
                    x2={50 + 35 * Math.cos((secondAngle - 90) * Math.PI / 180)}
                    y2={50 + 35 * Math.sin((secondAngle - 90) * Math.PI / 180)}
                    stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" />

                  {/* Center cap */}
                  <circle cx="50" cy="50" r="3.5" className="fill-amber-700 dark:fill-amber-300" />
                  <circle cx="50" cy="50" r="1.5" fill="#dc2626" />

                  {/* Glass effect */}
                  <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor"
                    className="text-amber-500/20 dark:text-amber-300/10" strokeWidth="0.5" />
                </svg>

                {/* Digital reading below analog */}
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900 dark:text-white font-mono tabular-nums leading-tight">
                    {String(h12).padStart(2, '0')}:{minStr}
                  </span>
                  <span className="text-xs text-gray-400 font-medium leading-tight">
                    {secStr}s · {isPM ? 'PM' : 'AM'}
                  </span>
                </div>
              </div>
            )}

            {/* Clock toggle button */}
            <button
              onClick={toggleClock}
              className="text-xs text-gray-400 hover:text-primary transition-colors px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
              title={clockMode === 'digital' ? 'Ver relógio analógico' : 'Ver relógio digital'}
            >
              {clockMode === 'digital' ? '🕰' : '⏱'}
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {dateStr}
          </p>
        </div>

        {/* Right: Weather + City */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {weather.loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Carregando clima...</span>
            </div>
          ) : weather.error ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>🌡️ —</span>
            </div>
          ) : (
            <>
              {/* Weather emoji + temp */}
              <div className="flex items-center gap-2">
                <span className="text-3xl">{weatherEmoji(weather.weatherCode)}</span>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    {weather.temperature}°C
                  </span>
                  <span className="text-[11px] text-gray-500 leading-tight">
                    {weatherLabel(weather.weatherCode)}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />

              {/* City + feels like */}
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                    {weather.city}
                  </span>
                  <span className="text-[11px] text-gray-500 leading-tight">
                    Sensação {weather.apparentTemp}°C · Umidade {weather.humidity}%
                  </span>
                </div>
              </div>
            </>
          )}

          <Link
            to="/ai"
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}
          >
            <Sparkles className="w-4 h-4" />
            Resumo com IA
          </Link>
        </div>
      </div>
    </div>
  )
}

export default WeatherWidget
