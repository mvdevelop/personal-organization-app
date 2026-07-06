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

  // Get user location (cached)
  useEffect(() => {
    const cached = localStorage.getItem(CITY_CACHE_KEY)
    if (cached) {
      try {
        const { lat, lon, city } = JSON.parse(cached)
        setCoords({ lat, lon })
        setWeather(prev => ({ ...prev, city }))
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
          setCoords(null)
          setWeather(prev => ({ ...prev, city: 'Localização desconhecida', loading: false }))
        },
        { timeout: 5000, enableHighAccuracy: false }
      )
    } else {
      setWeather(prev => ({ ...prev, loading: false }))
    }
  }, [fetchCityFromCoords])

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

  const greeting = h < 12 ? 'Bom dia! ☀️' : h < 18 ? 'Boa tarde! 🌤️' : 'Boa noite! 🌙'

  const dateStr = time.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Greeting + Time + Date */}
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {greeting}
            </h1>
            <span className="text-2xl sm:text-3xl font-mono font-bold text-primary tabular-nums tracking-wider">
              {hourStr}:{minStr}
            </span>
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
