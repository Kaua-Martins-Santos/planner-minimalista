import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X, ImagePlus, Trash2, AlignLeft, LayoutTemplate } from 'lucide-react';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configuração de idioma (Português do Brasil)
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// --- FUNÇÃO DEFINITIVA ANTI-BUG DE DATA ---
// Garante que a data lida seja exatamente o dia local, sem voltar horas no fuso!
const getSafeLocalMidnight = (dateString) => {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split('T')[0].split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

const getSafeInputDate = (date) => {
  if (!date) return '';
  // Se for string, já extrai. Se for Date object, extrai o local
  if (typeof date === 'string') return date.split('T')[0];
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

// Componente Premium Interno: Comparador de Resultado (Com Anti-Bug de Drag)
const MiniBeforeAfter = ({ beforeImage, afterImage }) => {
  const [sliderPos, setSliderPos] = useState(50);
  if (!beforeImage || !afterImage) return null;

  return (
    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden group select-none bg-slate-900 shadow-inner mt-6 border border-slate-200 dark:border-slate-700">
      
      {/* TRAVAS DE SEGURANÇA NAS IMAGENS: draggable="false" e pointer-events-none */}
      <img draggable="false" src={afterImage} alt="Depois" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
      >
        <img draggable="false" src={beforeImage} alt="Antes" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
      </div>

      {/* PROTEÇÃO NO INPUT: onMouseDown para evitar conflito com a tela */}
      <input
        type="range" min="0" max="100" value={sliderPos}
        onChange={(e) => setSliderPos(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
      />
      
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.8)] pointer-events-none z-0 flex items-center justify-center"
        style={{ left: `calc(${sliderPos}% - 2px)` }}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-xl flex items-center justify-center border border-slate-200">
          <div className="w-4 h-1.5 bg-blue-500 rounded-full" />
        </div>
      </div>
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-md pointer-events-none">Antes</div>
      <div className="absolute top-4 right-4 bg-blue-600/90 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-md pointer-events-none shadow-lg">Resultado</div>
    </div>
  );
};

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
  const [rawTasks, setRawTasks] = useState([]); // Guarda os dados originais
  
  // Controle do Super Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState(null);
  const [isNewTask, setIsNewTask] = useState(false);

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    if (window.api) {
      const tasks = await window.api.getTasks();
      setRawTasks(tasks);
      
      const calendarEvents = tasks.map(task => {
        const correctDate = getSafeLocalMidnight(task.dueDate);
        return {
          id: task.id,
          title: task.title,
          start: correctDate,
          end: correctDate,
          status: task.status,
          allDay: true,
          resource: task // Guarda os dados completos da tarefa aqui
        };
      });

      setEvents(calendarEvents);
    }
  };

  // Abre o modal ao CLICAR EM UM DIA VAZIO DO CALENDÁRIO
  const handleSelectSlot = ({ start }) => {
    setTaskForm({
      id: `task-${Date.now()}`,
      title: '',
      description: '',
      status: 'todo',
      dueDate: getSafeInputDate(start), // Pega o dia exato que foi clicado
      imageBefore: null,
      imageAfter: null
    });
    setIsNewTask(true);
    setIsModalOpen(true);
  };

  // Abre o modal ao CLICAR EM UM EVENTO EXISTENTE
  const handleSelectEvent = (event) => {
    const task = event.resource;
    setTaskForm({ ...task, dueDate: getSafeInputDate(task.dueDate) });
    setIsNewTask(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setTaskForm(null), 300);
  };

  const handleFormChange = (field, value) => {
    setTaskForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleFormChange(type, reader.result);
      reader.readAsDataURL(file);
    }
  };

  const saveTask = async () => {
    if (!taskForm.title.trim()) {
      alert("O título da atividade é obrigatório!");
      return;
    }

    const taskToSave = {
      ...taskForm,
      dueDate: getSafeInputDate(taskForm.dueDate) // Salva como string YYYY-MM-DD
    };

    if (window.api) {
      if (isNewTask) await window.api.addTask(taskToSave);
      else await window.api.updateTask(taskToSave);
      
      loadEvents(); // Recarrega os eventos na tela
    }
    closeModal();
  };

  const handleDeleteTask = async () => {
    if (confirm('Tem certeza que deseja excluir esta atividade permanentemente?')) {
      if (window.api) {
        await window.api.deleteTask(taskForm.id);
        loadEvents();
      }
      closeModal();
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3b82f6'; // Azul
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
      
      {/* Injeção de CSS para esconder relógio padrão e adequar Dark Mode */}
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0; width: 100%; height: 100%; position: absolute; top: 0; left: 0; cursor: pointer;
        }
        .rbc-calendar { font-family: inherit; }
        .rbc-header { padding: 10px 0; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; color: #64748b; }
        .rbc-today { background-color: #f0f9ff; }
        .rbc-event.rbc-selected { filter: brightness(0.9); }
        .dark .rbc-month-view, .dark .rbc-time-view, .dark .rbc-header { border-color: #334155; }
        .dark .rbc-day-bg, .dark .rbc-month-row { border-color: #334155; }
        .dark .rbc-off-range-bg { background-color: #0f172a; }
        .dark .rbc-today { background-color: #1e293b; }
        .dark .rbc-date-cell { color: #cbd5e1; }
        .dark .rbc-off-range { color: #475569; }
        .dark .rbc-time-content, .dark .rbc-timeslot-group, .dark .rbc-time-header-content { border-color: #334155; }
      `}</style>

      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
          <CalendarIcon size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Agenda Interativa</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Clique num dia para agendar ou num evento para editar.</p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', minHeight: '500px' }}
          culture="pt-BR"
          eventPropGetter={eventStyleGetter}
          selectable={true}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          components={{ toolbar: CustomToolbar }}
        />
      </div>

      {/* SUPER MODAL (Agora integrado também na Agenda) */}
      {isModalOpen && taskForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-[2rem] shadow-2xl flex flex-col border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-between items-center p-6 px-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
                <LayoutTemplate size={28} />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {isNewTask ? 'Agendar Nova Atividade' : 'Detalhes do Agendamento'}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                {!isNewTask && (
                  <button onClick={handleDeleteTask} className="flex items-center px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors">
                    <Trash2 size={16} className="mr-2" /> Excluir
                  </button>
                )}
                <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-2">Título da Atividade *</label>
                  <input 
                    type="text" 
                    value={taskForm.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    placeholder="Ex: Instalação do Servidor"
                    className="w-full bg-transparent text-3xl font-black text-slate-900 dark:text-white border-b-2 border-slate-200 dark:border-slate-700 focus:border-blue-600 dark:focus:border-blue-500 outline-none pb-2 transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-2">Status</label>
                    <select 
                      value={taskForm.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todo">A Fazer</option>
                      <option value="in-progress">Em Progresso</option>
                      <option value="done">Concluído</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-2">Data do Evento</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500 dark:text-blue-400 group-hover:text-blue-600 transition-colors">
                        <CalendarIcon size={18} />
                      </div>
                      <input 
                        type="date" 
                        value={taskForm.dueDate}
                        onChange={(e) => handleFormChange('dueDate', e.target.value)}
                        className="w-full pl-10 p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer hover:border-blue-300 dark:hover:border-blue-800 relative"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center"><AlignLeft size={14} className="mr-1"/> Detalhes e Anotações</label>
                  <textarea 
                    value={taskForm.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Escreva os detalhes, materiais necessários..."
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 min-h-[180px] resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <label className="block text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center"><ImagePlus size={14} className="mr-1"/> Registro Fotográfico</label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 h-40 flex items-center justify-center overflow-hidden transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    {taskForm.imageBefore ? (
                      <img src={taskForm.imageBefore} alt="Antes" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-slate-400 dark:text-slate-500 pointer-events-none">
                        <ImagePlus size={28} className="mx-auto mb-2 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-wider">Foto Antes</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageBefore')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {taskForm.imageBefore && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-bold text-sm pointer-events-none backdrop-blur-sm">
                        <ImagePlus size={24} className="mb-1" /> Alterar Foto
                      </div>
                    )}
                  </div>

                  <div className="relative group rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 h-40 flex items-center justify-center overflow-hidden transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    {taskForm.imageAfter ? (
                      <img src={taskForm.imageAfter} alt="Depois" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-slate-400 dark:text-slate-500 pointer-events-none">
                        <ImagePlus size={28} className="mx-auto mb-2 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-wider">Foto Resultado</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageAfter')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {taskForm.imageAfter && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-bold text-sm pointer-events-none backdrop-blur-sm">
                        <ImagePlus size={24} className="mb-1" /> Alterar Foto
                      </div>
                    )}
                  </div>
                </div>

                {taskForm.imageBefore && taskForm.imageAfter ? (
                  <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <label className="block text-xs font-bold tracking-wider text-blue-500 uppercase mb-2 text-center">Prévia do Relatório</label>
                    <MiniBeforeAfter beforeImage={taskForm.imageBefore} afterImage={taskForm.imageAfter} />
                  </div>
                ) : (
                  <div className="pt-8 text-center px-4">
                    <div className="inline-block p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                      <LayoutTemplate size={32} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      Adicione as duas fotos acima para visualizar o relatório dinâmico.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-6 px-8 flex justify-end items-center space-x-4">
              <button onClick={closeModal} className="px-6 py-3 font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={saveTask} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                Salvar Atividade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}