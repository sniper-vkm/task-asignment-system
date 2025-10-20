import { useEffect, useState } from 'react'
import KanbanBoard from './components/KanbanBoard'
import ProjectList from './components/ProjectList'
import api from './lib/api'

export default function App() {
    const [projects, setProjects] = useState([])
    const [selectedProject, setSelectedProject] = useState(null)

    useEffect(() => {
        api.getProjects().then(setProjects).catch(console.error)
    }, [])

    return (
        <div className="app">
            <header>
                <h1>Project & Task Manager</h1>
            </header>
            <div className="container">
                <aside>
                    <ProjectList projects={projects} onSelect={setSelectedProject} onRefresh={() => api.getProjects().then(setProjects)} />
                </aside>
                <main>
                    {selectedProject ? (
                        <KanbanBoard project={selectedProject} />
                    ) : (
                        <div className="placeholder">Select a project to view its board</div>
                    )}
                </main>
            </div>
        </div>
    )
}
