import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/tasks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Could not load tasks from the API.");
      setTasks(await response.json());
    } catch {
      setError("Can't connect to the backend. Start FastAPI and MongoDB, then refresh.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const counts = useMemo(() => ({
    all: tasks.length,
    active: tasks.filter((task) => !task.completed).length,
    completed: tasks.filter((task) => task.completed).length,
  }), [tasks]);

  const visibleTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  async function addTask(event) {
    event.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Could not create task.");
      setTasks((current) => [data, ...current]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err.message || "Could not create task.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    setError("");
    try {
      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not update task.");
      setTasks((current) => current.map((item) => item.id === task.id ? data : item));
    } catch (err) {
      setError(err.message || "Could not update task.");
    }
  }

  async function deleteTask(taskId) {
    setError("");
    try {
      const response = await fetch(`${API_URL}/${taskId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Could not delete task.");
      }
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(err.message || "Could not delete task.");
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Taskflow home">
          <span className="brand-mark">✓</span>
          <span>taskflow<span className="brand-dot">.</span></span>
        </a>
        <span className="stack-label"><span className="status-dot" /> React · FastAPI · MongoDB</span>
      </header>

      <section className="hero">
        <p className="eyebrow">YOUR DAY, IN FOCUS</p>
        <h1>Make room for<br /><span>what matters.</span></h1>
        <p className="hero-copy">A little progress each day adds up to big results.</p>
      </section>

      <section className="workspace" aria-label="Task manager">
        <form className="add-card" onSubmit={addTask}>
          <div className="section-heading">
            <div>
              <p className="eyebrow">NEW TASK</p>
              <h2>What needs doing?</h2>
            </div>
            <span className="plus-mark">＋</span>
          </div>
          <label className="sr-only" htmlFor="task-title">Task title</label>
          <input
            id="task-title"
            className="title-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Finish project documentation"
            maxLength={120}
            required
          />
          <label className="sr-only" htmlFor="task-description">Description (optional)</label>
          <input
            id="task-description"
            className="description-input"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add a note (optional)"
            maxLength={500}
          />
          <button className="primary-button" type="submit" disabled={!title.trim() || saving}>
            {saving ? "Adding…" : "Add task"} <span aria-hidden="true">↗</span>
          </button>
        </form>

        <div className="list-heading">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h2>Task list <span className="count-pill">{counts.all}</span></h2>
          </div>
          <div className="filters" role="group" aria-label="Filter tasks">
            {["all", "active", "completed"].map((value) => (
              <button
                key={value}
                className={`filter-button ${filter === value ? "selected" : ""}`}
                onClick={() => setFilter(value)}
                type="button"
              >
                {value[0].toUpperCase() + value.slice(1)}
                {value === "active" && <span>{counts.active}</span>}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-banner" role="alert">{error} <button onClick={loadTasks} type="button">Retry</button></div>}

        {loading ? (
          <div className="empty-state"><span className="loader" /><p>Getting your tasks…</p></div>
        ) : visibleTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{filter === "completed" ? "✦" : "☀"}</div>
            <h3>{filter === "completed" ? "Nothing completed just yet" : filter === "active" ? "You're all caught up" : "A fresh start"}</h3>
            <p>{filter === "all" ? "Add your first task above and make today count." : "There's nothing here right now."}</p>
          </div>
        ) : (
          <ul className="task-list">
            {visibleTasks.map((task) => (
              <li className={`task-row ${task.completed ? "is-complete" : ""}`} key={task.id}>
                <button
                  className={`check-button ${task.completed ? "checked" : ""}`}
                  onClick={() => toggleTask(task)}
                  type="button"
                  aria-label={task.completed ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as complete`}
                  title={task.completed ? "Mark incomplete" : "Mark complete"}
                >{task.completed ? "✓" : ""}</button>
                <div className="task-content">
                  <p className="task-title">{task.title}</p>
                  {task.description && <p className="task-description">{task.description}</p>}
                  <span className="task-date">{new Date(task.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                </div>
                <button
                  className="delete-button"
                  onClick={() => deleteTask(task.id)}
                  type="button"
                  aria-label={`Delete ${task.title}`}
                  title="Delete task"
                >×</button>
              </li>
            ))}
          </ul>
        )}

        <footer className="list-footer">
          <span>{counts.active} {counts.active === 1 ? "task" : "tasks"} left to do</span>
          <span><span className="footer-check">✓</span> One step at a time</span>
        </footer>
      </section>

      <footer className="page-footer">
        <span>Designed for focus, built for flow.</span>
        <span>AMINOID AI · TECHNICAL ASSESSMENT</span>
      </footer>
    </main>
  );
}
