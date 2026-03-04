const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Cria um arquivo .json na pasta segura de dados do aplicativo
const dbPath = path.join(app.getPath('userData'), 'taskmaster_dados.json');

// Inicializa o banco de dados se for a primeira vez
function initDatabase() {
  if (!fs.existsSync(dbPath)) {
    // Cria o arquivo com uma estrutura básica de tarefas vazia
    fs.writeFileSync(dbPath, JSON.stringify({ tasks: [] }, null, 2));
  }
}

// Funções auxiliares para ler e escrever no arquivo
function readData() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { tasks: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// Funções para o sistema usar
const dbAPI = {
  getTasks: () => {
    return readData().tasks;
  },
  
  addTask: (task) => {
    const data = readData();
    data.tasks.push(task);
    writeData(data);
    return task;
  },

  updateTaskStatus: (id, status) => {
    const data = readData();
    const taskIndex = data.tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      data.tasks[taskIndex].status = status;
      writeData(data);
    }
    return { id, status };
  },

  deleteTask: (id) => {
    const data = readData();
    data.tasks = data.tasks.filter(t => t.id !== id);
    writeData(data);
    return id;
  }
};

module.exports = { initDatabase, dbAPI };