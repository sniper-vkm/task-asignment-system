const express = require('express');
const router = express.Router();
const axios = require('axios');
const Task = require('../models/Task');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://api.gemini.example/v1/generate';

async function callGemini(payload) {
    if (!GEMINI_API_KEY) throw new Error('No GEMINI_API_KEY configured');
    // Gemini expects API key as query param, not Authorization header
    const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    const headers = { 'Content-Type': 'application/json' };
    const resp = await axios.post(url, {
        contents: [{ parts: [{ text: payload.prompt }] }]
    }, { headers, timeout: 15000 });
    return resp.data;
}

// Summarize tasks in a project
router.get('/summarize/:projectId', async (req, res) => {
    try {
        const tasks = await Task.find({ projectId: req.params.projectId });
        const text = tasks.map(t => `${t.title}: ${t.description || ''}`).join('\n');

        if (GEMINI_API_KEY) {
            try {
                const payload = { prompt: `Summarize the following tasks:\n${text}` };
                const data = await callGemini(payload);
                // Gemini returns response in data.candidates[0].content.parts[0].text
                const summary = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
                return res.json({ summary: summary || JSON.stringify(data) });
            } catch (err) {
                console.error('Gemini call failed, falling back:', err.message);
            }
        }

        // Local fallback summarization (simple)
        const summary = `Project has ${tasks.length} tasks. Top tasks: ${tasks.slice(0, 5).map(t => t.title).join(', ')}`;
        return res.json({ summary });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Q&A about a task (by task id)
router.post('/qa', async (req, res) => {
    try {
        const { taskId, question } = req.body;
        if (!taskId || !question) return res.status(400).json({ error: 'taskId and question are required' });

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ error: 'Task not found' });

        const context = `Title: ${task.title}\nDescription: ${task.description || ''}`;

        if (GEMINI_API_KEY) {
            try {
                const payload = { prompt: `Context:\n${context}\n\nQuestion: ${question}` };
                const data = await callGemini(payload);
                const answer = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
                return res.json({ answer: answer || JSON.stringify(data) });
            } catch (err) {
                console.error('Gemini call failed, falling back:', err.message);
            }
        }

        // Local heuristic answer
        const answer = `Q: ${question}\nA: I found this in the task - ${task.description || 'No description available.'}`;
        return res.json({ answer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
