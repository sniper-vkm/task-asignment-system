import { useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import api from '../lib/api'

const COLUMNS = ['To Do', 'In Progress', 'Done']

export default function KanbanBoard({ project }) {
    const [tasks, setTasks] = useState([])
    const [title, setTitle] = useState('')
    const [desc, setDesc] = useState("");
    const [qaQuestion, setQaQuestion] = useState("");
    const [qaAnswer, setQaAnswer] = useState("");
    const [qaLoading, setQaLoading] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [editTaskId, setEditTaskId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDesc, setEditDesc] = useState("");

    useEffect(() => { if (project) load() }, [project])

    async function load() {
        const data = await api.getTasksForProject(project._id)
        setTasks(data)
    }

    async function add() {
        if (!title) return
        await api.createTask({ projectId: project._id, title, description: desc, status: 'To Do' })
        setTitle("");
        setDesc("");
        load()
    }

    async function onDragEnd(result) {
        if (!result.destination) return;
        const { draggableId, destination, source } = result;
        // Only update if status/column actually changed
        if (destination.droppableId !== source.droppableId) {
            const taskId = draggableId;
            const status = destination.droppableId;
            // Optimistically update UI
            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t));
            await api.updateTask(taskId, { status });
            // Optionally reload from backend for consistency
            // load();
        }
    }

    const askAI = async () => {
        if (!qaQuestion || !selectedTaskId) return;
        setQaLoading(true);
        setQaAnswer("");
        try {
            const resp = await api.qa({ taskId: selectedTaskId, question: qaQuestion });
            setQaAnswer(resp.answer);
        } catch (e) {
            setQaAnswer("AI error: " + (e.message || "Unknown error"));
        }
        setQaLoading(false);
    };

    const startEditTask = (task) => {
        setEditTaskId(task._id);
        setEditTitle(task.title);
        setEditDesc(task.description || "");
    };

    const saveEditTask = async () => {
        if (!editTitle) return alert('Enter task title');
        await api.updateTask(editTaskId, { title: editTitle, description: editDesc });
        setEditTaskId(null);
        setEditTitle("");
        setEditDesc("");
        load();
    };

    const cancelEditTask = () => {
        setEditTaskId(null);
        setEditTitle("");
        setEditDesc("");
    };

    const deleteTask = async (id) => {
        if (!window.confirm('Delete this task?')) return;
        await api.deleteTask(id);
        load();
    };

    const byStatus = COLUMNS.reduce((acc, col) => (acc[col] = tasks.filter(t => t.status === col), acc), {})

    const summarize = async () => {
        const resp = await api.summarize(project._id)
        alert('Summary:\n' + resp.summary)
    }

    return (
        <div className="kanban">
            <h2>{project.name}</h2>
            <div className="board-controls">
                <input className='form-control' value={title} onChange={e => setTitle(e.target.value)} placeholder="New task title" />
                <input className='form-control' value={desc} onChange={e => setDesc(e.target.value)} placeholder="Task description" style={{ marginLeft: 8 }} />
                <button class="button-primery" onClick={add}>Add Task</button>
                <button class="button-primery" onClick={summarize}>AI Summarize</button>
            </div>
            <div className="ai-qa-controls" style={{ marginBottom: 16 }}>
                <input
                    value={qaQuestion}
                    className="form-control"
                    onChange={e => setQaQuestion(e.target.value)}
                    placeholder="Ask AI about a task (select a card)"

                />
                <button
                    onClick={askAI}
                    className="button-primery"
                    disabled={!qaQuestion || qaLoading || !selectedTaskId}
                >Ask AI</button>
                {qaLoading && <span style={{ marginLeft: 8 }}>Loading...</span>}
                {qaAnswer && <div style={{ marginTop: 8, background: '#f6f6f6', padding: 8, borderRadius: 4 }}><b>AI:</b> {qaAnswer}</div>}
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="columns" style={{ display: 'flex', gap: 16 }}>
                    {COLUMNS.map(col => (
                        <Droppable droppableId={col} key={col}>
                            {(provided) => (
                                <div className="column" ref={provided.innerRef} {...provided.droppableProps} style={{ flex: 1, minWidth: 250, background: '#f8f9fa', borderRadius: 8, padding: 12 }}>
                                    <h3 style={{ textAlign: 'center' }}>{col}</h3>
                                    {byStatus[col].map((task, idx) => (
                                        <Draggable draggableId={task._id} index={idx} key={task._id}>
                                            {(p) => (
                                                <div
                                                    className={`card${selectedTaskId === task._id ? ' selected' : ''}`}
                                                    ref={p.innerRef}
                                                    {...p.draggableProps}
                                                    {...p.dragHandleProps}
                                                    onClick={() => setSelectedTaskId(task._id)}
                                                    style={{
                                                        border: selectedTaskId === task._id ? '2px solid #007bff' : '1px solid #ccc',
                                                        cursor: 'pointer',
                                                        marginBottom: 8,
                                                        background: '#fff',
                                                        borderRadius: 4,
                                                        padding: 8,
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                                        position: 'relative',
                                                        ...p.draggableProps.style
                                                    }}
                                                >
                                                    {editTaskId === task._id ? (
                                                        <div style={{ width: '100%' }}>
                                                            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Task title" style={{ marginBottom: 4, width: '100%' }} />
                                                            <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Task description" style={{ marginBottom: 4, width: '100%', minHeight: 40 }} />
                                                            <button onClick={e => { e.stopPropagation(); saveEditTask(); }} className="save-btn action-btn">Save</button>
                                                            <button onClick={e => { e.stopPropagation(); cancelEditTask(); }} className="cancel-btn action-btn">Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="card-title" style={{ fontWeight: 600 }}>{task.title}</div>
                                                            <div className="card-desc" style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>{task.description}</div>
                                                            <button onClick={e => { e.stopPropagation(); startEditTask(task); }} className="button-primery action-btn">Edit</button>
                                                            <button onClick={e => { e.stopPropagation(); deleteTask(task._id); }} className="delete-btn action-btn">Delete</button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}
