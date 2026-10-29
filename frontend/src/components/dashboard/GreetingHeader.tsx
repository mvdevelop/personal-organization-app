import React from 'react';
import { CloudFog, MapPin, Thermometer, Droplets } from 'lucide-react';
import { DEMO_WEATHER } from '../../data/dashboardDemo';

interface GreetingHeaderProps {
  name: string
  dateLabel: string
  greeting: string
}

const GreetingHeader: React.FC<GreetingHeaderProps> = ({ name, dateLabel, greeting }) => {
  const hour = new Date().getHours()
  const emoji = hour < 12 ? '☀️' : hour < 18 ? '🌤️' : '🌙'

  return (
    <section className="dash-head">
      <div className="dash-head-copy">
        <span className="dash-date">{dateLabel}</span>
        <h1 className="dash-title">
          {greeting}, {name}! <span aria-hidden="true">{emoji}</span>
        </h1>
        <p className="dash-sub">Um passo de cada vez. Vamos organizar o que importa hoje.</p>
      </div>

      <aside className="weather-card" aria-label="Informações de clima ilustrativas">
        <div className="weather-top">
          <div className="weather-temp">
            <strong>{DEMO_WEATHER.temperature}</strong>
            <span>{DEMO_WEATHER.condition}</span>
          </div>
          <span className="weather-icon" aria-hidden="true">
            <CloudFog />
          </span>
        </div>

        <div className="weather-location">
          <MapPin aria-hidden="true" />
          <span>{DEMO_WEATHER.location}</span>
        </div>

        <div className="weather-meta">
          <span>
            <Thermometer aria-hidden="true" />
            Sensação {DEMO_WEATHER.feelsLike}
          </span>
          <span>
            <Droplets aria-hidden="true" />
            Umidade {DEMO_WEATHER.humidity}
          </span>
        </div>

        <span className="weather-disclaimer">Dados ilustrativos</span>
      </aside>
    </section>
  )
}

export default GreetingHeader
