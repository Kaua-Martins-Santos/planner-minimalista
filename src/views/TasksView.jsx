import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, X, ImagePlus, Calendar as CalendarIcon, AlignLeft, LayoutTemplate } from 'lucide-react';

// --- FUNÇÕES DE SEGURANÇA DE DATA ---
const getSafeDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const datePart = dateStr.split('T')[0];
  return new Date(datePart + 'T12:00:00').toLocaleDateString('pt-BR');
};

const getSafeInputDate = (dateStr) => {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
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

export default function TasksView() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState(null);
  const [isNewTask, setIsNewTask] = useState(false);

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    if (window.api) {
      const data = await window.api.getTasks();
      setTasks(data);
    }
  };

  const openCreateModal = () => {
    const today = new Date();
    const localDateString = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    setTaskForm({
      id: `task-${Date.now()}`,
      title: '',
      description: '',
      status: 'todo',
      dueDate: localDateString,
      imageBefore: null,
      imageAfter: null
    });
    setIsNewTask(true);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
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
      alert("O título da tarefa é obrigatório!");
      return;
    }

    const taskToSave = {
      ...taskForm,
      dueDate: getSafeInputDate(taskForm.dueDate)
    };

    if (isNewTask) {
      setTasks(prev => [...prev, taskToSave]);
      if (window.api) await window.api.addTask(taskToSave);
    } else {
      setTasks(prev => prev.map(t => t.id === taskToSave.id ? taskToSave : t));
      if (window.api) await window.api.updateTask(taskToSave);
    }
    closeModal();
  };

  const toggleStatus = async (task, e) => {
    e.stopPropagation();
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    if (window.api) await window.api.updateTaskStatus(task.id, newStatus);
  };

  const handleDeleteTask = async (id, e = null) => {
    if (e) e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta atividade permanentemente?')) {
      if (isModalOpen) closeModal();
      setTasks(prev => prev.filter(t => t.id !== id));
      if (window.api) await window.api.deleteTask(id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          cursor: pointer;
        }
      `}</style>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Lista de Tarefas</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gerencie seus itens e acesse os relatórios fotográficos.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Nova Tarefa</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto space-y-3 pr-2">
        {tasks.map(task => (
          <div 
            key={task.id} 
            onClick={() => openEditModal(task)}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
              task.status === 'done' 
              ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60' 
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
            }`}
          >
            <div className="flex items-center space-x-4">
              <button onClick={(e) => toggleStatus(task, e)} className="text-slate-400 hover:text-blue-600 transition-colors">
                {task.status === 'done' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Circle size={24} />}
              </button>
              
              <div className="flex flex-col">
                <span className={`font-medium text-lg ${
                  task.status === 'done' 
                  ? 'text-slate-400 dark:text-slate-500 line-through' 
                  : 'text-slate-800 dark:text-slate-100'
                }`}>
                  {task.title}
                </span>
                <div className="flex space-x-3 mt-1">
                  {task.dueDate && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center font-medium">
                      <CalendarIcon size={12} className="mr-1" />
                      {getSafeDisplayDate(task.dueDate)}
                    </span>
                  )}
                  {task.description && <AlignLeft size={14} className="text-slate-400" title="Possui Descrição" />}
                  {(task.imageBefore || task.imageAfter) && <ImagePlus size={14} className="text-blue-500" title="Possui Fotos" />}
                </div>
              </div>
            </div>
            
            <button 
              onClick={(e) => handleDeleteTask(task.id, e)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Excluir"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Sua lista está vazia.</p>
            <button onClick={openCreateModal} className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
              Criar primeira atividade
            </button>
          </div>
        )}
      </div>

      {isModalOpen && taskForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-[2rem] shadow-2xl flex flex-col border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex justify-between items-center p-6 px-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
                <LayoutTemplate size={28} />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {isNewTask ? 'Cadastrar Nova Atividade' : 'Detalhes da Atividade'}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                {!isNewTask && (
                  <button onClick={() => handleDeleteTask(taskForm.id)} className="flex items-center px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors">
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
                    placeholder="Ex: Instalação do Servidor Principal"
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
                    <label className="block text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-2">Prazo Final</label>
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
                    placeholder="Escreva os detalhes, materiais necessários, links importantes..."
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
                      Adicione as duas fotos acima para visualizar o relatório dinâmico de progresso da atividade diretamente aqui.
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