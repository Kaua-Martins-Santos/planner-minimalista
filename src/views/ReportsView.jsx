import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, FileText, ImageOff } from 'lucide-react';

const BeforeAfterSlider = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  if (!beforeImage || !afterImage) return null;

  return (
    <div className="relative w-full max-w-4xl mx-auto h-96 rounded-2xl overflow-hidden group select-none bg-slate-900 shadow-inner border border-slate-200 dark:border-slate-700">
      <img draggable="false" src={afterImage} alt="Depois" className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none" />
      <div 
        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img draggable="false" src={beforeImage} alt="Antes" className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none" />
      </div>

      <input
        type="range" min="0" max="100" value={sliderPosition}
        onChange={(e) => setSliderPosition(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-ew-resize z-10"
      />
      
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.8)] pointer-events-none z-0 flex items-center justify-center"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-slate-200">
          <div className="w-4 h-1.5 bg-blue-500 rounded-full" />
        </div>
      </div>
      
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider backdrop-blur-sm pointer-events-none">Antes</div>
      <div className="absolute top-4 right-4 bg-blue-600/90 text-white px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider backdrop-blur-sm pointer-events-none shadow-lg">Resultado</div>
    </div>
  );
};

export default function ReportsView() {
  const [tasksWithImages, setTasksWithImages] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!window.api) return;
    const tasks = await window.api.getTasks();
    const validTasks = tasks.filter(t => t.imageBefore && t.imageAfter);
    setTasksWithImages(validTasks);
    if (validTasks.length > 0) setSelectedTaskId(validTasks[0].id);
  };

  const selectedTask = tasksWithImages.find(t => t.id === selectedTaskId);

  const exportToPDF = async () => {
    setIsGenerating(true);
    const element = document.getElementById('print-template');
    
    try {
      const canvas = await html2canvas(element, { scale: 3, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Relatorio_${selectedTask.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Houve um erro ao gerar o documento.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 relative overflow-y-auto overflow-x-hidden">
      
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Central de Relatórios</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gere documentos executivos de atividades específicas</p>
        </div>
        <button 
          onClick={exportToPDF}
          disabled={isGenerating || !selectedTask}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md ${
            isGenerating || !selectedTask 
            ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' 
            : 'bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white hover:-translate-y-0.5'
          }`}
        >
          {isGenerating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download size={18} />}
          <span>{isGenerating ? 'Processando Documento...' : 'Gerar PDF Executivo'}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Análise de Atividade (Antes e Depois)</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Selecione uma atividade para pré-visualizar</p>
          </div>
          
          {tasksWithImages.length > 0 && (
            <select 
              value={selectedTaskId} 
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="mt-4 md:mt-0 w-full md:w-80 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-medium rounded-xl focus:ring-2 focus:ring-blue-500 outline-none block p-3 shadow-sm cursor-pointer"
            >
              {tasksWithImages.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          )}
        </div>

        {selectedTask ? (
          <div className="flex-1 flex flex-col">
            <BeforeAfterSlider beforeImage={selectedTask.imageBefore} afterImage={selectedTask.imageAfter} />
            <div className="mt-8 text-center">
              <span className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium">
                <FileText size={16} className="mr-2"/>
                O PDF gerará uma página limpa focada nos detalhes e imagens dessa atividade.
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/50 mt-4">
            <ImageOff size={56} className="text-slate-300 dark:text-slate-600 mb-4" />
            <h4 className="text-xl font-bold text-slate-700 dark:text-slate-300">Nenhum registro fotográfico</h4>
            <p className="text-slate-500 dark:text-slate-400 text-center mt-2 max-w-md">
              Não há atividades com fotos cadastradas. Edite uma tarefa e adicione imagens de "Antes e Depois" para gerar o relatório.
            </p>
          </div>
        )}
      </div>

      {/* =========================================================================
          TEMPLATE OCULTO PARA IMPRESSÃO A4 (CORPORATIVO LIMPO)
      ========================================================================= */}
      <div className="absolute top-[-9999px] left-[-9999px] w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
        <div id="print-template" className="bg-white text-slate-900 w-[794px] min-h-[1123px] px-12 py-14 flex flex-col font-sans relative">
          
          <div className="flex justify-between items-end border-b-2 border-slate-900 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Relatório Executivo</h1>
              <p className="text-slate-500 font-medium text-lg mt-1">Registro de Evolução de Atividade</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-slate-800">Gestor Executivo</p>
              <p className="text-sm text-slate-500 mt-1">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {selectedTask && (
            <div className="flex-1">
              {/* Título da Tarefa e Status */}
              <div className="bg-slate-900 text-white p-6 rounded-t-xl">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Atividade Documentada</h2>
                <h3 className="text-2xl font-bold">{selectedTask.title}</h3>
              </div>
              
              {/* Bloco de Detalhes focado no texto */}
              <div className="bg-slate-50 border border-t-0 border-slate-200 p-6 rounded-b-xl mb-10 flex flex-col gap-6">
                <div className="flex justify-start gap-16">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Status Atual</p>
                    <p className="text-base font-bold text-slate-900 mt-1">
                      {selectedTask.status === 'done' ? 'Concluído' : selectedTask.status === 'in-progress' ? 'Em Progresso' : 'A Fazer'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Prazo Final</p>
                    <p className="text-base font-bold text-slate-900 mt-1">
                      {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString('pt-BR') : 'Não definido'}
                    </p>
                  </div>
                </div>

                {/* Anotações adaptáveis para textos muito longos */}
                {selectedTask.description && (
                  <div className="border-t border-slate-200 pt-5">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-2">Anotações e Detalhes</p>
                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {selectedTask.description}
                    </p>
                  </div>
                )}
              </div>

              {/* FOTOS LADO A LADO */}
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Registro Fotográfico</h2>
              <div className="flex space-x-6">
                <div className="w-1/2">
                  <div className="h-64 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                    <img src={selectedTask.imageBefore} alt="Antes" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-center font-bold text-slate-800 mt-3 uppercase tracking-wider text-sm">Registro "Antes"</p>
                </div>
                
                <div className="w-1/2">
                  <div className="h-64 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                    <img src={selectedTask.imageAfter} alt="Depois" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-center font-bold text-blue-600 mt-3 uppercase tracking-wider text-sm">Registro "Resultado"</p>
                </div>
              </div>
            </div>
          )}

          {/* Rodapé Limpo */}
          <div className="mt-auto pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400 font-medium">Documento gerado pelo sistema Gestor Executivo.</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}