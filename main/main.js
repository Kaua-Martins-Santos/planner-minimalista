const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initDatabase, dbAPI } = require('./database');

let mainWindow;

function createWindow() {
  initDatabase();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Eventos IPC
ipcMain.handle('get-tasks', () => dbAPI.getTasks());
ipcMain.handle('add-task', (event, task) => dbAPI.addTask(task));
ipcMain.handle('update-task-status', (event, id, status) => dbAPI.updateTaskStatus(id, status));
ipcMain.handle('update-task', (event, task) => dbAPI.updateTask(task)); // Nova linha
ipcMain.handle('delete-task', (event, id) => dbAPI.deleteTask(id));