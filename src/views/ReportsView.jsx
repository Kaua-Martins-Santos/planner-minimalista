import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';

// Componente Premium: Comparador de Imagens "Antes e Depois"
const BeforeAfterSlider = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  if (!beforeImage || !afterImage) return null;

  return (
    <div className="relative w-full max-w-2xl h-80 rounded-xl overflow-hidden group select-none bg-slate-200">
      {/* Imagem do Depois (Fundo) */}
      <img src={afterImage} alt="Depois" className="absolute top-0 left-0 w-full h-full object-cover" />
      
      {/* Imagem do Antes (Frente com recorte dinâmico) */}
      <div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img src={beforeImage} alt="Antes" className="absolute top-0 left-0 w-full h-full object-cover" />
      </div>

      {/* Controle Deslizante Invisível (captura o mouse) */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(e.target.value)}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-ew-resize z-10"
      />
      
      {/* Linha visual do divisor */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none z-0 flex items-center justify-center"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
          <div className="w-4 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
      
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm font-bold backdrop-blur-sm pointer-events-none">Antes</div>
      <div className="absolute top-4 right-4 bg-blue-600/80 text-white px-3 py-1 rounded-md text-sm font-bold backdrop-blur-sm pointer-events-none">Depois</div>
    </div>
  );
};

export default function ReportsView() {
  const [stats, setStats] = useState({ todo: 0, inProgress: 0, done: 0, total: 0 });
  const reportRef = useRef(null);

  // Imagens de exemplo para o visualizador (Num app real, viriam do banco de dados)
  const sampleBefore = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop"; 
  const sampleAfter = "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=800&auto=format&fit=crop";

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!window.api) return;
    const tasks = await window.api.getTasks();
    
    const newStats = {
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      done: tasks.filter(t => t.status === 'done').length,
      total: tasks.length
    };
    setStats(newStats);
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

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-slate-800">Relatórios e Exportação</h3>
        <button 
          onClick={exportToPDF}
          className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md"
        >
          <Download size={18} />
          <span>Gerar PDF</span>
        </button>
      </div>

      {/* Área que será exportada para o PDF */}
      <div ref={reportRef} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex-1 overflow-auto">
        <div className="border-b border-slate-200 pb-6 mb-6">
          <h1 className="text-3xl font-black text-slate-900">Relatório de Progresso</h1>
          <p className="text-slate-500 mt-2">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-slate-500 text-sm font-medium">Total de Tarefas</p>
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-blue-600 text-sm font-medium">A Fazer</p>
            <p className="text-3xl font-bold text-blue-700">{stats.todo}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <p className="text-orange-600 text-sm font-medium">Em Progresso</p>
            <p className="text-3xl font-bold text-orange-700">{stats.inProgress}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <p className="text-emerald-600 text-sm font-medium">Concluídas</p>
            <p className="text-3xl font-bold text-emerald-700">{stats.done}</p>
          </div>
        </div>

        {/* Comparador de Imagens Premium */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Registro Visual (Antes e Depois)</h2>
          <BeforeAfterSlider beforeImage={sampleBefore} afterImage={sampleAfter} />
          <p className="text-sm text-slate-500 mt-4 max-w-2xl">
            * Deslize a barra para comparar o progresso do projeto selecionado. No PDF gerado, o estado atual do controle deslizante será capturado exatamente como está na tela.
          </p>
        </div>
      </div>
    </div>
  );
}