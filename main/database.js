const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const dbPath = path.join(app.getPath('userData'), 'taskmaster_dados.json');

function initDatabase() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ tasks: [] }, null, 2));
  }
}

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

const dbAPI = {
  getTasks: () => readData().tasks,
  
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

  // NOVA FUNÇÃO: Atualiza a tarefa inteira (incluindo as fotos inseridas)
  updateTask: (updatedTask) => {
    const data = readData();
    const taskIndex = data.tasks.findIndex(t => t.id === updatedTask.id);
    if (taskIndex !== -1) {
      data.tasks[taskIndex] = updatedTask;
      writeData(data);
    }
    return updatedTask;
  },

  deleteTask: (id) => {
    const data = readData();
    data.tasks = data.tasks.filter(t => t.id !== id);
    writeData(data);
    return id;
  }
};

module.exports = { initDatabase, dbAPI };