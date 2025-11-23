import React, { useState, useEffect } from "react";
import api from "../api";

// 1. Definimos o formato que uma Tarefa deve ter
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

export default function TaskList() {
  // 2. Dizemos ao useState que ele vai guardar uma lista de 'Task'
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  
  // 3. O ID pode ser um número ou nulo (quando ninguém está sendo editado)
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/tasks");
        setTasks(res.data);
      } catch (err) {
        console.error("Erro ao buscar tarefas:", err);
      }
    };
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!title.trim()) return;
    try {
      const res = await api.post("/tasks", { title });
      // O TypeScript agora sabe que res.data é do tipo Task
      setTasks([...tasks, res.data]);
      setTitle("");
    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
    }
  };

  // Tipamos explicitamente os parâmetros id e completed
  const toggleTask = async (id: number, completed: boolean) => {
    try {
      const res = await api.put(`/tasks/${id}`, { completed: !completed });
      setTasks(tasks.map((task) => (task.id === id ? res.data : task)));
    } catch (err) {
      console.error("Erro ao atualizar tarefa:", err);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Erro ao deletar tarefa:", err);
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveEdit = async (id: number) => {
    if (!editingTitle.trim()) return;
    try {
      const res = await api.put(`/tasks/${id}`, { title: editingTitle });
      setTasks(tasks.map((task) => (task.id === id ? res.data : task)));
      setEditingId(null);
      setEditingTitle("");
    } catch (err) {
      console.error("Erro ao salvar edição:", err);
    }
  };

  return (
    <div className="container">
      <h1>Gerenciador de Tarefas</h1>
      <div className="input-group">
        <input
          type="text"
          placeholder="Digite uma tarefa"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addTask();
            }
          }}
        />
        <button onClick={addTask}>Adicionar</button>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {editingId === task.id ? (
              <>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      saveEdit(task.id);
                    }
                  }}
                />
                <button onClick={() => saveEdit(task.id)}>Salvar</button>
                <button onClick={cancelEdit}>Cancelar</button>
              </>
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id, task.completed)}
                />
                <span style={{ textDecoration: task.completed ? "line-through" : "none" }}>
                  {task.title}
                </span>
                <button onClick={() => startEdit(task)}>✏️</button>
                <button onClick={() => deleteTask(task.id)}>❌</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}