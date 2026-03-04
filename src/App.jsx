import React, { useState, useEffect } from 'react';
import { Home, Calendar, KanbanSquare, ListTodo, PieChart, Moon, Sun } from 'lucide-react';
import KanbanView from './views/KanbanView';
import CalendarView from './views/CalendarView';
import ReportsView from './views/ReportsView';
import DashboardView from './views/DashboardView';
import TasksView from './views/TasksView';

export default function App() {
  const [activeTab, setActiveTab] = useState('kanban');
  const [isDark, setIsDark] = useState(false);

  // Aplica a classe 'dark' no HTML principal quando o estado muda
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const menuItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Visão Geral' },
    { id: 'calendar', icon: <Calendar size={20} />, label: 'Agenda' },
    { id: 'kanban', icon: <KanbanSquare size={20} />, label: 'Kanban' },
    { id: 'lists', icon: <ListTodo size={20} />, label: 'Tarefas' },
    { id: 'reports', icon: <PieChart size={20} />, label: 'Relatórios' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-slate-900 dark:bg-black text-white flex flex-col shadow-xl z-10 transition-colors duration-300">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-wider text-blue-400">TaskMaster</h1>
          <p className="text-xs text-slate-400 mt-1">Gestão Offline</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveTab(item.id)}
               className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                 activeTab === item.id 
                 ? 'bg-blue-600 text-white shadow-md' 
                 : 'hover:bg-slate-800 dark:hover:bg-slate-800 text-slate-300'
               }`}
             >
               {item.icon}
               <span className="font-medium">{item.label}</span>
             </button>
          ))}
        </nav>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 shadow-sm z-0 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 capitalize">
            {menuItems.find(m => m.id === activeTab)?.label}
          </h2>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              title="Alternar Tema"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
              Sistema Offline
            </span>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'kanban' && <KanbanView />}
          {activeTab === 'lists' && <TasksView />}
          {activeTab === 'reports' && <ReportsView />}
        </div>
      </main>
    </div>
  );
}