const express = require('express');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

const router = express.Router();

router.get('/:filename', (req, res) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(__dirname, '../converted', filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

router.post('/batch', (req, res) => {
    const files = req.body.files; // Array of { serverName, cleanName }
    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files specified' });
    }

    res.attachment('MediaMorph_Batch.zip');
    
    const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(res);

    files.forEach(fileObj => {
        if (!fileObj || !fileObj.serverName) return;
        const serverName = path.basename(fileObj.serverName);
        const filePath = path.join(__dirname, '../converted', serverName);
        if (fs.existsSync(filePath)) {
            archive.file(filePath, { name: fileObj.cleanName || serverName });
        }
    });

    archive.finalize();
});

module.exports = router;
