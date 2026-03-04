const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initDatabase, dbAPI } = require('./database');

let mainWindow;

function createWindow() {
  // Inicializa o banco de dados local
  initDatabase();

  // Cria a janela principal do sistema
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    show: false, // Esconde até carregar para evitar tela branca
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Mostra a janela suavemente quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Em desenvolvimento (roda o Vite), em produção (carrega os arquivos compilados)
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Quando o aplicativo estiver pronto, cria a janela
app.whenReady().then(createWindow);

// Fecha o aplicativo se todas as janelas forem fechadas (padrão Windows/Linux)
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

// ==========================================
// REGISTRO DOS EVENTOS DE COMUNICAÇÃO (IPC)
// ==========================================
ipcMain.handle('get-tasks', () => dbAPI.getTasks());
ipcMain.handle('add-task', (event, task) => dbAPI.addTask(task));
ipcMain.handle('update-task-status', (event, id, status) => dbAPI.updateTaskStatus(id, status));
ipcMain.handle('delete-task', (event, id) => dbAPI.deleteTask(id));