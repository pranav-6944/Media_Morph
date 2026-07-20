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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
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

router.post('/', upload.array('files', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        
        const filesData = req.files.map(file => ({
            id: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype
        }));

        res.json({ message: 'Files uploaded successfully', files: filesData });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ error: 'Server error during file upload' });
    }
});

module.exports = router;
