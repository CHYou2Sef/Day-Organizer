'use client';

import { useState, useEffect } from 'react';

// Comments: Define the Task interface to match the backend
interface Task {
    id?: string;
    title: string;
    description: string;
    priority: number;
    start: string;
    end: string;
}

export default function Home() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTask, setNewTask] = useState<Task>({
        title: '',
        description: '',
        priority: 0,
        start: '',
        end: '',
    });

    // Comments: API endpoint is proxied via next.config.js for container networking
    const API_URL = '/api/tasks';

    // Comments: Fetch tasks from the Go backend
    const fetchTasks = async () => {
        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                const data = await res.json();
                setTasks(data || []);
            }
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Comments: Submit a new task to the backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask),
            });
            if (res.ok) {
                setNewTask({ title: '', description: '', priority: 0, start: '', end: '' });
                fetchTasks();
            }
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    };

    // Comments: Delete a task by ID
    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchTasks();
            }
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    return (
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Day Organizer
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage your daily flow with elegance</p>
            </header>

            {/* Quick Add Form */}
            <section className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                    <input
                        className="input-field"
                        placeholder="What needs to be done?"
                        value={newTask.title}
                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        style={{ gridColumn: 'span 2' }}
                        required
                    />
                    <input
                        className="input-field"
                        placeholder="Priority (0-5)"
                        type="number"
                        value={newTask.priority}
                        onChange={e => setNewTask({ ...newTask, priority: parseInt(e.target.value) })}
                    />
                    <input
                        className="input-field"
                        placeholder="Short description"
                        value={newTask.description}
                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', gridColumn: 'span 2' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Start Time</label>
                            <input
                                className="input-field"
                                type="datetime-local"
                                style={{ width: '100%' }}
                                value={newTask.start}
                                onChange={e => setNewTask({ ...newTask, start: e.target.value })}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>End Time</label>
                            <input
                                className="input-field"
                                type="datetime-local"
                                style={{ width: '100%' }}
                                value={newTask.end}
                                onChange={e => setNewTask({ ...newTask, end: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2' }}>
                        Add Task
                    </button>
                </form>
            </section>

            {/* Task List */}
            <section style={{ display: 'grid', gap: '1rem' }}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading your schedule...</p>
                ) : tasks.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)' }}>No tasks for today. Time to plan!</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div key={task.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>{task.title}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{task.description}</p>
                                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                                    <span style={{ color: 'var(--primary)' }}>🕒 {new Date(task.start).toLocaleString()}</span>
                                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>Priority: {task.priority}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => task.id && handleDelete(task.id)}
                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                                title="Delete Task"
                            >
                                🗑️
                            </button>
                        </div>
                    ))
                )}
            </section>
        </main>
    );
}
