const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// All accepted file extensions (case-insensitive)
const ALLOWED_EXTENSIONS = new Set([
    // HEIC/HEVC (primary purpose)
    '.heic', '.hevc', '.h265',
    // Images
    '.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.tif', '.bmp', '.gif', '.svg',
    // Videos
    '.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv',
    // Audio
    '.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a',
]);

const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            try {
                fs.mkdirSync(uploadDir, { recursive: true });
            } catch (e) {
                console.error('Failed to create upload dir:', e);
            }
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`File type "${ext}" is not supported`), false);
    }
}

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit per file
});

router.post('/', (req, res) => {
    upload.any()(req, res, (err) => {
        if (err) {
            console.error('Upload Error:', err);
            return res.status(400).json({ error: err.message || 'Error uploading files' });
        }
        if (!req.files || req.files.length === 0) {
            console.error('No files found in req.files');
            return res.status(400).json({ error: 'No file binary data received by server. Please re-select the file.' });
        }
        
        const filesData = req.files.map(file => ({
            id: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype
        }));

        res.json({ message: 'Files uploaded successfully', files: filesData, uploadedFiles: filesData });
    });
});

module.exports = router;
