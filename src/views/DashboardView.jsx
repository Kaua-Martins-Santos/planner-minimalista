import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, LayoutDashboard, TrendingUp } from 'lucide-react';

export default function DashboardView() {
  const [stats, setStats] = useState({ total: 0, done: 0, pending: 0 });
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!window.api) return;
    const tasks = await window.api.getTasks();
    
    setStats({
      total: tasks.length,
      done: tasks.filter(t => t.status === 'done').length,
      pending: tasks.filter(t => t.status !== 'done').length,
    });

    // Pega as últimas 5 tarefas adicionadas
    setRecentTasks(tasks.slice(-5).reverse());
  };

  const progress = stats.total === 0 ? 0 : Math.round((stats.done / stats.total) * 100);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center space-x-3 text-slate-800 dark:text-white">
        <LayoutDashboard size={28} className="text-blue-500" />
        <h3 className="text-2xl font-bold">Resumo do Projeto</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Progresso */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">Progresso Geral</p>
          <div className="flex items-end space-x-2 mb-4">
            <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Card Tarefas Pendentes */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-4">
          <div className="p-4 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pendentes</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.pending}</p>
          </div>
        </div>

        {/* Card Tarefas Concluídas */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-4">
          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle size={32} />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Concluídas</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{stats.done}</p>
          </div>
        </div>
      </div>

      {/* Lista Rápida */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex-1">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="text-slate-400" size={20} />
          <h4 className="text-lg font-bold text-slate-800 dark:text-white">Atividades Recentes</h4>
        </div>
        <div className="space-y-3">
          {recentTasks.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhuma tarefa encontrada.</p>
          ) : (
            recentTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${task.status === 'done' ? 'bg-emerald-500' : task.status === 'in-progress' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{task.title}</span>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-400">
                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}