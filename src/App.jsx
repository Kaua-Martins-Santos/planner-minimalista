import React, { useState } from 'react';
import { Home, Calendar, KanbanSquare, ListTodo, PieChart } from 'lucide-react';
import KanbanView from './views/KanbanView';
import CalendarView from './views/CalendarView';
import ReportsView from './views/ReportsView';

export default function App() {
  const [activeTab, setActiveTab] = useState('kanban');

  const menuItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Visão Geral' },
    { id: 'calendar', icon: <Calendar size={20} />, label: 'Agenda' },
    { id: 'kanban', icon: <KanbanSquare size={20} />, label: 'Kanban' },
    { id: 'lists', icon: <ListTodo size={20} />, label: 'Tarefas' },
    { id: 'reports', icon: <PieChart size={20} />, label: 'Relatórios' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
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
                 : 'hover:bg-slate-800 text-slate-300'
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-0">
          <h2 className="text-xl font-semibold text-slate-700 capitalize">
            {menuItems.find(m => m.id === activeTab)?.label}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Sistema Offline Ativo
            </span>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'kanban' && <KanbanView />}
          {activeTab === 'dashboard' && <div className="text-slate-500">Módulo Visão Geral em construção...</div>}
          {activeTab === 'calendar' && <div className="text-slate-500">Módulo Agenda em construção...</div>}
          {activeTab === 'lists' && <div className="text-slate-500">Módulo Listas em construção...</div>}
          {activeTab === 'reports' && <div className="text-slate-500">Módulo Relatórios em construção...</div>}
        </div>
      </main>
    </div>
  );
}