const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

app.post('/api/upload', (req, res) => {
    upload.array('files', 50)(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
        const filesData = req.files.map(f => ({ id: f.filename, originalName: f.originalname, size: f.size }));
        res.json({ message: 'Files uploaded successfully', files: filesData, uploadedFiles: filesData });
    });
});

const server = app.listen(5005, async () => {
    console.log('Test server running on port 5005');
    try {
        const FormData = require('form-data');
        const axios = require('axios');
        const fd = new FormData();
        const testFile = path.join(__dirname, 'test.txt');
        fs.writeFileSync(testFile, 'hello world');
        fd.append('files', fs.createReadStream(testFile));

        const res = await axios.post('http://localhost:5005/api/upload', fd, {
            headers: fd.getHeaders()
        });

        console.log('Axios Upload Result:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error('Test error:', e.message, e.response?.data);
    } finally {
        server.close();
        process.exit(0);
    }
});
