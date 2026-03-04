const { contextBridge, ipcRenderer } = require('electron');

// Expõe as funções do backend para o React usar na variável "window.api"
contextBridge.exposeInMainWorld('api', {
  // Chamadas de Tarefas
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  addTask: (task) => ipcRenderer.invoke('add-task', task),
  updateTaskStatus: (id, status) => ipcRenderer.invoke('update-task-status', id, status),
  deleteTask: (id) => ipcRenderer.invoke('delete-task', id)
});