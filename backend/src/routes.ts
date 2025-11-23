import express, { Request, Response } from 'express';
import pool from './db';

const router = express.Router();

// Criar tarefa
router.post('/tasks', async (req: Request, res: Response) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "O título da tarefa é obrigatório." });
    }

    const result = await pool.query(
      'INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING *',
      [title, false]
    );

    res.json(result.rows[0]);
  } catch (err) {
    const errorMessage = (err as Error).message;
    console.error("Erro ao criar tarefa:", errorMessage);
    res.status(500).json({ error: "Erro ao criar tarefa." });
  }
});

// Listar tarefas
router.get('/tasks', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    const errorMessage = (err as Error).message;
    console.error("Erro ao listar tarefas:", errorMessage);
    res.status(500).json({ error: "Erro ao listar tarefas" });
  }
});

// Atualizar tarefa
router.put('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;
    const values: any[] = []; 
    const setClauses: string[] = [];

    if (title !== undefined) {
      setClauses.push(`title = $${values.length + 1}`);
      values.push(title);
    }

    if (completed !== undefined) {
      setClauses.push(`completed = $${values.length + 1}`);
      values.push(completed);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: "Nenhum campo para atualizar fornecido." });
    }

    values.push(id); // Adiciona o ID por último para o WHERE
    const query = `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    const errorMessage = (err as Error).message;
    console.error("Erro ao atualizar tarefa:", errorMessage);
    res.status(500).json({ error: "Erro ao atualizar tarefa" });
  }
});

// Deletar tarefa
router.delete('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    res.json({ message: 'Tarefa deletada com sucesso' });
  } catch (err) {
    const errorMessage = (err as Error).message;
    console.error("Erro ao deletar tarefa:", errorMessage);
    res.status(500).json({ error: "Erro ao deletar tarefa" });
  }
});

// Buscar tarefa por ID
router.get('/tasks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tarefa não encontrada." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    const errorMessage = (err as Error).message;
    console.error("Erro ao buscar tarefa:", errorMessage);
    res.status(500).json({ error: "Erro ao buscar tarefa." });
  }
});

export default router;