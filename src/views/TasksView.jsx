import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

export default function TasksView() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    if (window.api) {
      const data = await window.api.getTasks();
      setTasks(data);
    }
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    
    // Atualiza a tela IMEDIATAMENTE
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

    if (window.api) {
      await window.api.updateTaskStatus(task.id, newStatus);
    }
  };

  const deleteTask = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      // Remove da tela IMEDIATAMENTE
      setTasks(prev => prev.filter(t => t.id !== id));
      
      if (window.api) {
        await window.api.deleteTask(id);
      }
    }
  };

  const handleAddTask = async () => {
    const title = prompt('Digite o título da nova tarefa:');
    if (!title) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title,
      description: '',
      status: 'todo',
      dueDate: new Date().toISOString(),
      imageBefore: null,
      imageAfter: null
    };

    // Adiciona na tela IMEDIATAMENTE (Garante que o botão funcione)
    setTasks(prev => [...prev, newTask]);

    if (window.api) {
      await window.api.addTask(newTask);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Lista de Tarefas</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gerencie seus itens de forma linear</p>
        </div>
        <button 
          onClick={handleAddTask}
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
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              task.status === 'done' 
              ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60' 
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center space-x-4">
              <button onClick={() => toggleStatus(task)} className="text-slate-400 hover:text-blue-600 transition-colors">
                {task.status === 'done' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Circle size={24} />}
              </button>
              <span className={`font-medium text-lg ${
                task.status === 'done' 
                ? 'text-slate-400 dark:text-slate-500 line-through' 
                : 'text-slate-800 dark:text-slate-100'
              }`}>
                {task.title}
              </span>
            </div>
            
            <button 
              onClick={() => deleteTask(task.id)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Sua lista está vazia.</p>
            <button onClick={handleAddTask} className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm">
              Criar primeira tarefa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}