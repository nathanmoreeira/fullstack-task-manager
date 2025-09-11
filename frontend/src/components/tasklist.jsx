import React, { useState, useEffect } from "react";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  // Buscar tarefas do backend
  useEffect(() => {
  const fetchTasks = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/tasks");
      if (!res.ok) {
        throw new Error(`Erro HTTP: ${res.status}`);
      }
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err);
    }
  };

  fetchTasks();
}, []);


  // Criar nova tarefa
  const addTask = async () => {
    if (!title.trim()) return;

    const res = await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    const newTask = await res.json();
    setTasks([...tasks, newTask]);
    setTitle("");
  };

  // Alternar completed
  const toggleTask = async (id, completed) => {
    const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });

    const updatedTask = await res.json();
    setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)));
  };

  // Deletar tarefa
  const deleteTask = async (id) => {
    await fetch(`http://localhost:5000/api/tasks/${id}`, { method: "DELETE" });
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gerenciador de Tarefas</h1>

      <input
        type="text"
        placeholder="Digite uma tarefa"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={addTask}>Adicionar</button>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id, task.completed)}
            />
            <span style={{ textDecoration: task.completed ? "line-through" : "none" }}>
              {task.title}
            </span>
            <button onClick={() => deleteTask(task.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
