import express from 'express';
import pool from './db.js';

const router = express.Router();

// Criar tarefa
router.post('/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    
    // Validação de dados de entrada
    if (!title) {
      return res.status(400).json({ error: "O título da tarefa é obrigatório." });
    }

    const result = await pool.query(
      'INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING *',
      [title, false] // Toda tarefa começa como não concluída
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar tarefa:", err.message);
    res.status(500).json({ error: "Erro ao criar tarefa." });
  }
});

// Listar tarefas
router.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao listar tarefas:", err.message);
    res.status(500).json({ error: "Erro ao listar tarefas" });
  }
});

// Atualizar tarefa (título e/ou status de conclusão)
router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;
    let query = 'UPDATE tasks SET ';
    const values = [];
    const setClauses = [];

    if (title !== undefined) {
      setClauses.push('title = $' + (setClauses.length + 1));
      values.push(title);
    }

    if (completed !== undefined) {
      setClauses.push('completed = $' + (setClauses.length + 1));
      values.push(completed);
    }
    
    // Se não houver nada para atualizar, retorne um erro
    if (setClauses.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar fornecido." });
    }

    query += setClauses.join(', ') + ' WHERE id = $' + (values.length + 1) + ' RETURNING *';
    values.push(id);
    
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar tarefa:", err.message);
    res.status(500).json({ error: "Erro ao atualizar tarefa" });
  }
});

// Deletar tarefa
router.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (err) {
    console.error("Erro ao deletar tarefa:", err.message);
    res.status(500).json({ error: "Erro ao deletar tarefa" });
  }
});

// Buscar tarefa por ID
router.get('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tarefa não encontrada." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar tarefa:", err.message);
    res.status(500).json({ error: "Erro ao buscar tarefa." });
  }
});

export default router;
