const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const uploadRoutes = require('./routes/upload');
const convertRoutes = require('./routes/convert');
const downloadRoutes = require('./routes/download');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Set up temp directories if they don't exist
const dirs = ['uploads', 'converted'];
dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

app.use('/api/upload', uploadRoutes);
app.use('/api/convert', convertRoutes);
app.use('/api/download', downloadRoutes);

app.get('/', (req, res) => {
    res.send('MediaMorph API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
