const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('.'));

// Serve the editor page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'slider-editor.html'));
});

// Handle PUT request to update the JSON file
app.put('/slider-data.json', async (req, res) => {
    try {
        await fs.writeFile('slider-data.json', JSON.stringify(req.body, null, 4));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).json({ error: 'Failed to save file' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 