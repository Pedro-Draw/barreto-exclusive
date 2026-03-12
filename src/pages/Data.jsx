// src/pages/Data.jsx
import React, { useState } from 'react';
import { Calendar as CalendarIcon, TrendingUp, Award, Clock } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import '../../pages.css/Data.css';

export default function Data() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Dados fictícios premium
  const metrics = {
    frequency: '4x/semana',
    streak: 12,
    totalTrainings: 87,
    progress: 78,
  };

  return (
    <div className="data-page container">
      <h1 className="gold-gradient">Minha Jornada</h1>
      <p className="subtitle">Acompanhe frequência, progresso e conquistas</p>

      {/* Métricas cards */}
      <div className="metrics-grid grid-4">
        <div className="metric-card glass-premium">
          <Clock size={32} />
          <h3>Frequência</h3>
          <p className="value">{metrics.frequency}</p>
        </div>
        <div className="metric-card glass-premium">
          <TrendingUp size={32} />
          <h3>Streak Atual</h3>
          <p className="value">{metrics.streak} dias</p>
        </div>
        <div className="metric-card glass-premium">
          <Award size={32} />
          <h3>Total de Treinos</h3>
          <p className="value">{metrics.totalTrainings}</p>
        </div>
        <div className="metric-card glass-premium">
          <div className="progress-circle" style={{ '--progress': metrics.progress }}>
            <span>{metrics.progress}%</span>
          </div>
          <h3>Progresso Anual</h3>
        </div>
      </div>

      {/* Calendário semanal premium */}
      <div className="calendar-card glass-premium">
        <div className="calendar-header">
          <button onClick={() => setCurrentDate(addDays(currentDate, -7))}>‹</button>
          <h3>
            {format(weekStart, "dd 'de' MMMM", { locale: ptBR })} – 
            {format(endOfWeek(weekStart, { weekStartsOn: 1 }), " dd 'de' MMMM", { locale: ptBR })}
          </h3>
          <button onClick={() => setCurrentDate(addDays(currentDate, 7))}>›</button>
        </div>

        <div className="week-days">
          {weekDays.map(day => {
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            return (
              <div key={day.toString()} className={`day ${isToday ? 'today' : ''}`}>
                <span className="weekday">{format(day, 'EEE', { locale: ptBR })}</span>
                <span className="date">{format(day, 'dd')}</span>
                <div className="status-dot active"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráfico simples (pode integrar Chart.js depois) */}
      <div className="chart-card glass-premium">
        <h3>Progresso Semanal</h3>
        <div className="placeholder-chart">
          {/* Aqui você pode integrar Chart.js ou Recharts */}
          <div className="bar" style={{ height: '40%' }}></div>
          <div className="bar" style={{ height: '70%' }}></div>
          <div className="bar" style={{ height: '90%' }}></div>
          <div className="bar" style={{ height: '55%' }}></div>
          <div className="bar" style={{ height: '80%' }}></div>
          <div className="bar" style={{ height: '30%' }}></div>
          <div className="bar" style={{ height: '65%' }}></div>
        </div>
      </div>
    </div>
  );
}