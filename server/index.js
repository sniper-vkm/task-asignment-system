require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

process.env.GEMINI_API_KEY = "AIzaSyDxr4-avEiUXad2r9AHpDIcSt1UGtYIYp8";
process.env.GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_assignment';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/ai', require('./routes/ai'));

app.get('/', (req, res) => res.send({ status: 'ok' }));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
