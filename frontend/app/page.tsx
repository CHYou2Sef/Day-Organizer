'use client';

import { useState, useEffect } from 'react';

// Define the Task interface to match the backend
interface Task {
    id?: string;
    title: string;
    description: string;
    priority: number; // 1-5
    start: string;
    end: string;
}

export default function Home() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTask, setNewTask] = useState<Task>({
        title: '',
        description: '',
        priority: 3, // Default to medium priority
        start: '',
        end: '',
    });

    // API endpoint is proxied via next.config.js for container networking
    const API_URL = '/api/tasks';

    // Fetch tasks from the Go backend
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

    // Submit a new task or update existing
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate priority is between 1-5
        if (newTask.priority < 1 || newTask.priority > 5) {
            alert('Priority must be between 1 and 5');
            return;
        }

        try {
            if (editingId) {
                // Update existing task
                const res = await fetch(`${API_URL}?id=${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTask),
                });
                if (res.ok) {
                    setEditingId(null);
                    resetForm();
                    fetchTasks();
                }
            } else {
                // Create new task
                const res = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newTask),
                });
                if (res.ok) {
                    resetForm();
                    fetchTasks();
                }
            }
        } catch (error) {
            console.error('Failed to save task:', error);
        }
    };

    // Delete a task by ID
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

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

    // Start editing a task
    const handleEdit = (task: Task) => {
        setNewTask({
            title: task.title,
            description: task.description,
            priority: task.priority,
            start: task.start,
            end: task.end,
        });
        setEditingId(task.id || null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Cancel editing
    const handleCancel = () => {
        setEditingId(null);
        resetForm();
    };

    // Reset form to defaults
    const resetForm = () => {
        setNewTask({
            title: '',
            description: '',
            priority: 3,
            start: '',
            end: '',
        });
    };

    // Get priority color and label
    const getPriorityInfo = (priority: number) => {
        const priorities = {
            1: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Very Low', emoji: '🟢' },
            2: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', label: 'Low', emoji: '🔵' },
            3: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'Medium', emoji: '🟡' },
            4: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', label: 'High', emoji: '🟠' },
            5: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'Critical', emoji: '🔴' },
        };
        return priorities[priority as keyof typeof priorities] || priorities[3];
    };

    // Format date for display
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Not set';
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    📅 Day Organizer
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    Simple, powerful task management for students & individuals
                </p>
            </header>

            {/* Quick Add/Edit Form */}
            <section className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {editingId ? '✏️ Edit Task' : '➕ Add New Task'}
                </h2>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                    <input
                        className="input-field"
                        placeholder="Task title (e.g., Study for exam)"
                        value={newTask.title}
                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        required
                    />

                    <input
                        className="input-field"
                        placeholder="Description (optional)"
                        value={newTask.description}
                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Priority Level (1-5)
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {[1, 2, 3, 4, 5].map(p => {
                                    const info = getPriorityInfo(p);
                                    const isSelected = newTask.priority === p;
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setNewTask({ ...newTask, priority: p })}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem 0.5rem',
                                                borderRadius: '8px',
                                                border: isSelected ? `2px solid ${info.color}` : '1px solid rgba(255,255,255,0.1)',
                                                background: isSelected ? info.bg : 'rgba(255,255,255,0.05)',
                                                color: isSelected ? info.color : 'var(--text-muted)',
                                                cursor: 'pointer',
                                                fontSize: '1.2rem',
                                                transition: 'all 0.2s',
                                            }}
                                            title={info.label}
                                        >
                                            {info.emoji}
                                        </button>
                                    );
                                })}
                            </div>
                            <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {getPriorityInfo(newTask.priority).label}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    🕐 Start Time
                                </label>
                                <input
                                    className="input-field"
                                    type="datetime-local"
                                    value={newTask.start}
                                    onChange={e => setNewTask({ ...newTask, start: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    🕐 End Time
                                </label>
                                <input
                                    className="input-field"
                                    type="datetime-local"
                                    value={newTask.end}
                                    onChange={e => setNewTask({ ...newTask, end: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                            {editingId ? '💾 Update Task' : '➕ Add Task'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                }}
                            >
                                ✖️ Cancel
                            </button>
                        )}
                    </div>
                </form>
            </section>

            {/* Task List */}
            <section>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📋 Your Tasks ({tasks.length})
                </h2>

                {loading ? (
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)' }}>⏳ Loading your tasks...</p>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</p>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No tasks yet!</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Add your first task above to get started</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {tasks.map((task) => {
                            const priorityInfo = getPriorityInfo(task.priority);
                            return (
                                <div
                                    key={task.id}
                                    className="glass-panel"
                                    style={{
                                        padding: '1.25rem',
                                        borderLeft: `4px solid ${priorityInfo.color}`,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                                                    {task.title}
                                                </h3>
                                                <span
                                                    style={{
                                                        background: priorityInfo.bg,
                                                        color: priorityInfo.color,
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                    }}
                                                >
                                                    {priorityInfo.emoji} {priorityInfo.label}
                                                </span>
                                            </div>

                                            {task.description && (
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                                                    {task.description}
                                                </p>
                                            )}

                                            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                <span>🕐 Start: {formatDate(task.start)}</span>
                                                <span>🏁 End: {formatDate(task.end)}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleEdit(task)}
                                                style={{
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    color: '#3b82f6',
                                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                }}
                                                title="Edit Task"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => task.id && handleDelete(task.id)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    color: '#ef4444',
                                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                }}
                                                title="Delete Task"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <p>Free Tier • Unlimited tasks • Simple & Powerful</p>
            </footer>
        </main>
    );
}
