import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, X, ImagePlus, Trash2 } from 'lucide-react';

const initialColumns = {
  'todo': { id: 'todo', title: 'A Fazer', taskIds: [] },
  'in-progress': { id: 'in-progress', title: 'Em Progresso', taskIds: [] },
  'done': { id: 'done', title: 'Concluído', taskIds: [] }
};

export default function KanbanView() {
  const [tasks, setTasks] = useState({});
  const [columns, setColumns] = useState(initialColumns);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    if (window.api) {
      const dbTasks = await window.api.getTasks();
      const taskMap = {};
      const cols = {
        'todo': { ...initialColumns['todo'], taskIds: [] },
        'in-progress': { ...initialColumns['in-progress'], taskIds: [] },
        'done': { ...initialColumns['done'], taskIds: [] }
      };

      dbTasks.forEach(task => {
        taskMap[task.id] = task;
        if (cols[task.status]) cols[task.status].taskIds.push(task.id);
      });
      setTasks(taskMap);
      setColumns(cols);
    }
  };

  const handleAddTask = async (columnId) => {
    const title = prompt('Digite o título da tarefa:');
    if (!title) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title,
      description: '',
      status: columnId,
      dueDate: new Date().toISOString(),
      imageBefore: null,
      imageAfter: null
    };

    setTasks(prev => ({ ...prev, [newTask.id]: newTask }));
    setColumns(prev => {
      const newCol = { ...prev[columnId] };
      newCol.taskIds = [...newCol.taskIds, newTask.id];
      return { ...prev, [columnId]: newCol };
    });

    if (window.api) await window.api.addTask(newTask);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];

    if (sourceCol === destCol) {
      const newTaskIds = Array.from(sourceCol.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      setColumns({ ...columns, [sourceCol.id]: { ...sourceCol, taskIds: newTaskIds } });
      return;
    }

    const startTaskIds = Array.from(sourceCol.taskIds);
    startTaskIds.splice(source.index, 1);
    const finishTaskIds = Array.from(destCol.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);

    setTasks(prev => ({ ...prev, [draggableId]: { ...prev[draggableId], status: destCol.id } }));
    setColumns({
      ...columns,
      [sourceCol.id]: { ...sourceCol, taskIds: startTaskIds },
      [destCol.id]: { ...destCol, taskIds: finishTaskIds }
    });

    if (window.api) await window.api.updateTaskStatus(draggableId, destCol.id);
  };

  // Lógica de Upload da Imagem e Salvar Detalhes
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const updatedTask = { ...selectedTask, [type]: reader.result };
        setSelectedTask(updatedTask);
        setTasks(prev => ({ ...prev, [updatedTask.id]: updatedTask }));
        if (window.api) await window.api.updateTask(updatedTask);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateDescription = async (e) => {
    const updatedTask = { ...selectedTask, description: e.target.value };
    setSelectedTask(updatedTask);
    setTasks(prev => ({ ...prev, [updatedTask.id]: updatedTask }));
    if (window.api) await window.api.updateTask(updatedTask);
  };

  const handleDeleteTask = async () => {
    if (confirm('Excluir esta tarefa?')) {
      const id = selectedTask.id;
      const status = selectedTask.status;
      
      setSelectedTask(null);
      
      const newTasks = { ...tasks };
      delete newTasks[id];
      setTasks(newTasks);
      
      setColumns(prev => {
        const newCol = { ...prev[status] };
        newCol.taskIds = newCol.taskIds.filter(taskId => taskId !== id);
        return { ...prev, [status]: newCol };
      });

      if (window.api) await window.api.deleteTask(id);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quadro de Projetos</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Clique em um cartão para adicionar fotos e detalhes.</p>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full items-start overflow-x-auto pb-4">
          {Object.values(columns).map(column => (
            <div key={column.id} className="bg-slate-100 dark:bg-slate-800/80 rounded-xl w-80 min-w-[320px] p-4 flex flex-col max-h-full border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4 px-1">
                <h4 className="font-semibold text-slate-700 dark:text-slate-200">{column.title}</h4>
                <span className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                  {column.taskIds.length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 overflow-y-auto min-h-[150px] space-y-3">
                    {column.taskIds.map((taskId, index) => {
                      const task = tasks[taskId];
                      if (!task) return null;
                      return (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedTask(task)}
                              className={`p-4 rounded-lg shadow-sm transition-all border cursor-pointer ${
                                snapshot.isDragging 
                                ? 'bg-white dark:bg-slate-700 border-blue-500 scale-105 shadow-md' 
                                : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                              }`}
                            >
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{task.title}</p>
                              
                              {/* Ícones indicativos se a tarefa tem foto ou descrição */}
                              <div className="flex space-x-2 mt-3">
                                {task.imageBefore && <div className="w-2 h-2 rounded-full bg-blue-500" title="Possui Foto"></div>}
                                {task.description && <div className="w-2 h-2 rounded-full bg-slate-400" title="Possui Descrição"></div>}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <button 
                onClick={() => handleAddTask(column.id)}
                className="mt-4 flex items-center justify-center w-full py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <Plus size={18} className="mr-1" /> Adicionar Cartão
              </button>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* MODAL DE DETALHES DA TAREFA E FOTOS */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-700">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{selectedTask.title}</h2>
              <div className="flex space-x-2">
                <button onClick={handleDeleteTask} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                  <Trash2 size={20} />
                </button>
                <button onClick={() => setSelectedTask(null)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Descrição do Projeto/Tarefa</label>
                <textarea 
                  value={selectedTask.description || ''}
                  onChange={handleUpdateDescription}
                  placeholder="Adicione anotações, materiais necessários, links..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Fotos do Projeto (Antes e Depois)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* FOTO ANTES */}
                  <div className="relative group rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 h-64 flex items-center justify-center overflow-hidden">
                    {selectedTask.imageBefore ? (
                      <img src={selectedTask.imageBefore} alt="Antes" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImagePlus size={32} className="mx-auto mb-2 opacity-50" />
                        <span className="text-sm font-medium">Foto "Antes"</span>
                      </div>
                    )}
                    <input 
                      type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageBefore')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {selectedTask.imageBefore && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium pointer-events-none">
                        Trocar Imagem
                      </div>
                    )}
                  </div>

                  {/* FOTO DEPOIS */}
                  <div className="relative group rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 h-64 flex items-center justify-center overflow-hidden">
                    {selectedTask.imageAfter ? (
                      <img src={selectedTask.imageAfter} alt="Depois" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImagePlus size={32} className="mx-auto mb-2 opacity-50" />
                        <span className="text-sm font-medium">Foto "Depois"</span>
                      </div>
                    )}
                    <input 
                      type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageAfter')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {selectedTask.imageAfter && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium pointer-events-none">
                        Trocar Imagem
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}