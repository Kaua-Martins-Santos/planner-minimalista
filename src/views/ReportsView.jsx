import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, ImageOff } from 'lucide-react';

const BeforeAfterSlider = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  if (!beforeImage || !afterImage) return null;

  return (
    <div className="relative w-full max-w-3xl h-96 rounded-xl overflow-hidden group select-none bg-slate-200 dark:bg-slate-800 shadow-inner">
      <img src={afterImage} alt="Depois" className="absolute top-0 left-0 w-full h-full object-cover" />
      <div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img src={beforeImage} alt="Antes" className="absolute top-0 left-0 w-full h-full object-cover" />
      </div>

      <input
        type="range" min="0" max="100" value={sliderPosition}
        onChange={(e) => setSliderPosition(e.target.value)}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-ew-resize z-10"
      />
      
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none z-0 flex items-center justify-center"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
          <div className="w-4 h-1.5 bg-slate-300 rounded-full" />
        </div>
      </div>
      
      <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-md text-sm font-bold backdrop-blur-sm pointer-events-none">Antes</div>
      <div className="absolute top-4 right-4 bg-blue-600/90 text-white px-3 py-1.5 rounded-md text-sm font-bold backdrop-blur-sm pointer-events-none shadow-lg">Depois</div>
    </div>
  );
};

export default function ReportsView() {
  const [stats, setStats] = useState({ todo: 0, inProgress: 0, done: 0, total: 0 });
  const [tasksWithImages, setTasksWithImages] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const reportRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!window.api) return;
    const tasks = await window.api.getTasks();
    
    setStats({
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      done: tasks.filter(t => t.status === 'done').length,
      total: tasks.length
    });

    // Filtra apenas tarefas que tenham as DUAS fotos (Antes e Depois)
    const validTasks = tasks.filter(t => t.imageBefore && t.imageAfter);
    setTasksWithImages(validTasks);
    if (validTasks.length > 0) setSelectedTaskId(validTasks[0].id);
  };

  const exportToPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Relatorio_TaskMaster.pdf');
  };

  const selectedTask = tasksWithImages.find(t => t.id === selectedTaskId);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Relatórios e Exportação</h3>
        <button 
          onClick={exportToPDF}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Download size={18} />
          <span>Gerar PDF</span>
        </button>
      </div>

      <div ref={reportRef} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex-1 overflow-auto">
        <div className="border-b border-slate-200 dark:border-slate-700 pb-6 mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Relatório do Projeto</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total de Tarefas</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{stats.total}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800/50">
            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">A Fazer</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-500 mt-1">{stats.todo}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-xl border border-orange-100 dark:border-orange-800/50">
            <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Em Progresso</p>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-500 mt-1">{stats.inProgress}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Concluídas</p>
            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-500 mt-1">{stats.done}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Registro Visual (Antes e Depois)</h2>
            
            {tasksWithImages.length > 0 && (
              <select 
                value={selectedTaskId} 
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              >
                {tasksWithImages.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            )}
          </div>

          {selectedTask ? (
            <div>
              <BeforeAfterSlider beforeImage={selectedTask.imageBefore} afterImage={selectedTask.imageAfter} />
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 max-w-3xl">
                * Deslize a barra para comparar o progresso de <strong>{selectedTask.title}</strong>. No PDF gerado, a posição exata da linha será capturada como na tela.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
              <ImageOff size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
              <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Nenhuma imagem para comparar</h4>
              <p className="text-slate-500 dark:text-slate-400 text-center mt-2 max-w-md">
                Vá até o Kanban, clique em um cartão de tarefa e adicione as fotos de "Antes" e "Depois" para exibi-las neste relatório.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}