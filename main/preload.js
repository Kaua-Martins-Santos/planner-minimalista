const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  addTask: (task) => ipcRenderer.invoke('add-task', task),
  updateTaskStatus: (id, status) => ipcRenderer.invoke('update-task-status', id, status),
  updateTask: (task) => ipcRenderer.invoke('update-task', task), // Nova linha
  deleteTask: (id) => ipcRenderer.invoke('delete-task', id)
});