import { useState } from 'react';

export default function ProjectList({ projects = [], onSelect = () => { }, onRefresh = () => { } }) {
    const [name, setName] = useState('')
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState("");

    const create = async () => {
        if (!name) return alert('Enter project name')
        try {
            await fetch('http://localhost:4000/api/projects', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name })
            })
            setName('')
            onRefresh()
        } catch (err) { console.error(err) }
    }

    const startEdit = (project) => {
        setEditId(project._id);
        setEditName(project.name);
    };

    const saveEdit = async () => {
        if (!editName) return alert('Enter project name');
        try {
            await fetch(`http://localhost:4000/api/projects/${editId}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName })
            });
            setEditId(null);
            setEditName("");
            onRefresh();
        } catch (err) { console.error(err); }
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditName("");
    };

    const deleteProject = async (id) => {
        if (!window.confirm('Delete this project?')) return;
        try {
            await fetch(`http://localhost:4000/api/projects/${id}`, { method: 'DELETE' });
            onRefresh();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="project-list">
            <h2>Projects</h2>
            <div className="create">
                <input className='form-control' value={name} onChange={e => setName(e.target.value)} placeholder="New project name" />
                <button className="button-primery" onClick={create}>Create</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {projects.map(p => (
                    <li
                        key={p._id}
                        onClick={() => onSelect(p)}
                        style={{
                            position: 'relative',
                            background: editId === p._id ? '#f0f8ff' : undefined,
                            marginBottom: 10,
                            padding: '12px 120px 12px 16px',
                            borderRadius: 6,
                            border: '1px solid #e0e0e0',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                            cursor: 'pointer',
                            minHeight: 48,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {editId === p._id ? (
                            <>
                                <input
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    style={{ marginRight: 8, flex: 1, minWidth: 120, fontSize: 16, padding: 4 }}
                                />
                                <button onClick={e => { e.stopPropagation(); saveEdit(); }} className="save-btn action-btn">Save</button>
                                <button onClick={e => { e.stopPropagation(); cancelEdit(); }} className="cancel-btn action-btn">Cancel</button>
                            </>
                        ) : (
                            <>
                                <div style={{ flex: 1 }}>
                                    <strong style={{ fontSize: 17 }}>{p.name}</strong>
                                    <div className="meta" style={{ fontSize: 12, color: '#888' }}>{new Date(p.createdAt).toLocaleString()}</div>
                                </div>
                                <button
                                    onClick={e => { e.stopPropagation(); startEdit(p); }}
                                    className="button-primery action-btn"
                                >Edit</button>
                                <button
                                    onClick={e => { e.stopPropagation(); deleteProject(p._id); }}
                                    className="delete-btn action-btn"
                                >Delete</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}
