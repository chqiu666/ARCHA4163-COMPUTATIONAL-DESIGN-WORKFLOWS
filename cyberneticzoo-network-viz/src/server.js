const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'static')));

// API Routes
app.get('/api/data', async (req, res) => {
    try {
        const dataPath = path.join(__dirname, '..', 'data', 'cyberneticzoo-data.json');
        const data = await fs.readFile(dataPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error loading data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const dataPath = path.join(__dirname, '..', 'data', 'cyberneticzoo-data.json');
        const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
        res.json(data.stats);
    } catch (error) {
        console.error('Error loading stats:', error);
        res.status(500).json({ error: 'Failed to load stats' });
    }
});

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'static', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Cyberneticzoo Network Visualization server running on port ${PORT}`);
    console.log(`📊 Visit http://localhost:${PORT} to view the visualization`);
});