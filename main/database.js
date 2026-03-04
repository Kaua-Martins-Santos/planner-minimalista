const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

// Cria o banco de dados na pasta segura de dados de aplicativo do usuário no Windows/Mac
const dbPath = path.join(app.getPath('userData'), 'taskmaster_dados.db');
const db = new Database(dbPath);

// Inicializa as tabelas se for a primeira vez que o usuário abre o sistema
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'todo',
      dueDate TEXT,
      imageBefore TEXT,
      imageAfter TEXT
    );
  `);
}

// Funções para o sistema usar
const dbAPI = {
  getTasks: () => {
    return db.prepare('SELECT * FROM tasks').all();
  },
  
  addTask: (task) => {
    const stmt = db.prepare(`
      INSERT INTO tasks (id, title, description, status, dueDate, imageBefore, imageAfter) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(task.id, task.title, task.description, task.status, task.dueDate, task.imageBefore, task.imageAfter);
    return task;
  },

  updateTaskStatus: (id, status) => {
    const stmt = db.prepare('UPDATE tasks SET status = ? WHERE id = ?');
    stmt.run(status, id);
    return { id, status };
  },

  deleteTask: (id) => {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    stmt.run(id);
    return id;
  }
};

module.exports = { initDatabase, dbAPI };