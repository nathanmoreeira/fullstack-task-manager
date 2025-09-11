import express from 'express';
import pool from './db.js';

const router = express.Router();

// Criar tarefa
router.post('/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING *',
      [title, false] // toda tarefa começa como não concluída
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar tarefa:", err.message);
    res.status(500).json({ error: "Erro ao criar tarefa" });
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

// Atualizar tarefa (marcar concluída/não concluída)
router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const result = await pool.query(
      'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *',
      [completed, id]
    );

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

export default router;
