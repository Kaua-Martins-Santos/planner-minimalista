import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configuração de idioma para o Calendário (Português)
const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarView() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    if (!window.api) return;
    
    // Busca as tarefas no banco de dados local
    const tasks = await window.api.getTasks();
    
    // Transforma as tarefas no formato que o calendário entende
    const calendarEvents = tasks.map(task => ({
      id: task.id,
      title: task.title,
      start: new Date(task.dueDate),
      end: new Date(task.dueDate), // Tarefa de dia único
      status: task.status,
      allDay: true
    }));

    setEvents(calendarEvents);
  };

  // Customizando a cor do evento baseado no status do Kanban
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3b82f6'; // Azul padrão (A Fazer)
    if (event.status === 'in-progress') backgroundColor = '#f59e0b'; // Laranja
    if (event.status === 'done') backgroundColor = '#10b981'; // Verde

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="h-full flex flex-col bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-2xl font-bold text-slate-800 mb-6">Sua Agenda</h3>
      <div className="flex-1">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          culture="pt-BR"
          eventPropGetter={eventStyleGetter}
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            noEventsInRange: "Não há tarefas neste período."
          }}
        />
      </div>
    </div>
  );
}