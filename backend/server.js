const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const uploadRoutes = require('./routes/upload');
const convertRoutes = require('./routes/convert');
const downloadRoutes = require('./routes/download');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & CORS Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
}));
app.use(express.json());

// Background Cleanup Job (runs every hour)
setInterval(() => {
    const folders = [path.join(__dirname, 'uploads'), path.join(__dirname, 'converted')];
    const ONE_HOUR = 60 * 60 * 1000;
    const now = Date.now();
    
    folders.forEach(folder => {
        if (!fs.existsSync(folder)) return;
        fs.readdir(folder, (err, files) => {
            if (err) return;
            files.forEach(file => {
                if (file === '.gitkeep') return;
                const filePath = path.join(folder, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) return;
                    if (now - stats.mtimeMs > ONE_HOUR) {
                        try { fs.unlinkSync(filePath); console.log(`Cleaned up old file: ${file}`); }
                        catch (e) {}
                    }
                });
            });
        });
    });
}, 60 * 60 * 1000); // 1 hour

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
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'mediamorph-backend', timestamp: Date.now() });
});

app.get('/', (req, res) => {
    res.send('MediaMorph API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
