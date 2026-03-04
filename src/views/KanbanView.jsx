import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';

const initialColumns = {
  'todo': { id: 'todo', title: 'A Fazer', taskIds: [] },
  'in-progress': { id: 'in-progress', title: 'Em Progresso', taskIds: [] },
  'done': { id: 'done', title: 'Concluído', taskIds: [] }
};

export default function KanbanView() {
  const [tasks, setTasks] = useState({});
  const [columns, setColumns] = useState(initialColumns);

  // Carrega as tarefas do banco de dados SQLite ao abrir a tela
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    if (!window.api) return; // Proteção caso esteja rodando fora do Electron
    const dbTasks = await window.api.getTasks();
    
    const taskMap = {};
    const cols = {
      'todo': { ...initialColumns['todo'], taskIds: [] },
      'in-progress': { ...initialColumns['in-progress'], taskIds: [] },
      'done': { ...initialColumns['done'], taskIds: [] }
    };

    dbTasks.forEach(task => {
      taskMap[task.id] = task;
      if (cols[task.status]) {
        cols[task.status].taskIds.push(task.id);
      }
    });

    setTasks(taskMap);
    setColumns(cols);
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

    if (window.api) {
      await window.api.addTask(newTask);
      loadTasks(); // Recarrega para atualizar a tela
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];

    // Movendo dentro da mesma coluna
    if (sourceCol === destCol) {
      const newTaskIds = Array.from(sourceCol.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      setColumns({
        ...columns,
        [sourceCol.id]: { ...sourceCol, taskIds: newTaskIds }
      });
      return;
    }

    // Movendo para outra coluna
    const startTaskIds = Array.from(sourceCol.taskIds);
    startTaskIds.splice(source.index, 1);
    
    const finishTaskIds = Array.from(destCol.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);

    setColumns({
      ...columns,
      [sourceCol.id]: { ...sourceCol, taskIds: startTaskIds },
      [destCol.id]: { ...destCol, taskIds: finishTaskIds }
    });

    // Atualiza o banco de dados via Electron IPC
    if (window.api) {
      await window.api.updateTaskStatus(draggableId, destCol.id);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-slate-800">Seu Quadro Kanban</h3>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full items-start overflow-x-auto pb-4">
          {Object.values(columns).map(column => (
            <div key={column.id} className="bg-slate-100 rounded-xl w-80 min-w-[320px] p-4 flex flex-col max-h-full border border-slate-200">
              <div className="flex justify-between items-center mb-4 px-1">
                <h4 className="font-semibold text-slate-700">{column.title}</h4>
                <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                  {column.taskIds.length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    className="flex-1 overflow-y-auto min-h-[150px] space-y-3"
                  >
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
                              className={`p-4 rounded-lg bg-white border border-slate-200 shadow-sm transition-shadow ${
                                snapshot.isDragging ? 'shadow-lg border-blue-400' : 'hover:shadow-md'
                              }`}
                            >
                              <p className="text-sm font-medium text-slate-800">{task.title}</p>
                              {task.dueDate && (
                                <p className="text-xs text-slate-400 mt-2">
                                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                </p>
                              )}
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
                className="mt-4 flex items-center justify-center w-full py-2 text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus size={16} className="mr-1" /> Adicionar Cartão
              </button>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}