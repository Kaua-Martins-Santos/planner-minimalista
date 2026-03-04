import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configuração de idioma (Português do Brasil)
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// Barra de Navegação Premium (Custom Toolbar)
const CustomToolbar = (toolbar) => {
  const goToBack = () => toolbar.onNavigate('PREV');
  const goToNext = () => toolbar.onNavigate('NEXT');
  const goToCurrent = () => toolbar.onNavigate('TODAY');

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 gap-4">
      <div className="flex space-x-2">
        <button onClick={goToCurrent} className="px-4 py-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium transition-colors text-sm">
          Hoje
        </button>
        <div className="flex space-x-1">
          <button onClick={goToBack} className="p-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToNext} className="p-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="text-xl font-bold text-slate-800 dark:text-white capitalize">
        {toolbar.label}
      </div>
      
      <div className="flex space-x-1 bg-slate-200 dark:bg-slate-900 p-1 rounded-lg">
        {['month', 'week', 'day'].map(view => (
          <button
            key={view}
            onClick={() => toolbar.onView(view)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              toolbar.view === view 
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {view === 'month' ? 'Mês' : view === 'week' ? 'Semana' : 'Dia'}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function CalendarView() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    if (!window.api) return;
    const tasks = await window.api.getTasks();
    
    const calendarEvents = tasks.map(task => ({
      id: task.id,
      title: task.title,
      start: new Date(task.dueDate),
      end: new Date(task.dueDate),
      status: task.status,
      allDay: true
    }));

    setEvents(calendarEvents);
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3b82f6'; // Azul (todo)
    if (event.status === 'in-progress') backgroundColor = '#f97316'; // Laranja
    if (event.status === 'done') backgroundColor = '#10b981'; // Verde

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.95,
        color: 'white',
        border: '0px',
        display: 'block',
        fontWeight: '500',
        padding: '2px 6px',
        fontSize: '0.85rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }
    };
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
      
      {/* Injeção mágica de CSS para adequar o react-big-calendar ao Dark Mode */}
      <style>{`
        .rbc-calendar { font-family: inherit; }
        .rbc-header { padding: 10px 0; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; color: #64748b; }
        .rbc-today { background-color: #f0f9ff; }
        .rbc-event.rbc-selected { filter: brightness(0.9); }
        
        /* Dark Mode Overrides */
        .dark .rbc-month-view, .dark .rbc-time-view, .dark .rbc-header { border-color: #334155; }
        .dark .rbc-day-bg, .dark .rbc-month-row { border-color: #334155; }
        .dark .rbc-off-range-bg { background-color: #0f172a; }
        .dark .rbc-today { background-color: #1e293b; }
        .dark .rbc-date-cell { color: #cbd5e1; }
        .dark .rbc-off-range { color: #475569; }
        .dark .rbc-time-content { border-color: #334155; }
        .dark .rbc-timeslot-group { border-color: #334155; }
        .dark .rbc-time-header-content { border-color: #334155; }
      `}</style>

      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
          <CalendarIcon size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Agenda</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Seus compromissos e prazos</p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', minHeight: '500px' }}
          culture="pt-BR"
          eventPropGetter={eventStyleGetter}
          components={{
            toolbar: CustomToolbar
          }}
        />
      </div>
    </div>
  );
}