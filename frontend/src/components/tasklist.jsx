import React, { useState, useEffect } from "react";
import api from "../api";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
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
      setTasks([...tasks, res.data]);
      setTitle("");
    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      const res = await api.put(`/tasks/${id}`, { completed: !completed });
      setTasks(tasks.map((task) => (task.id === id ? res.data : task)));
    } catch (err) {
      console.error("Erro ao atualizar tarefa:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Erro ao deletar tarefa:", err);
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const saveEdit = async (id) => {
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