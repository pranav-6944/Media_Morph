const express = require('express');
const path = require('path');
const fs = require('fs');
const heicHelper = require('../utils/heic-helper');
const ffmpegHelper = require('../utils/ffmpeg-helper');

const router = express.Router();

// A simple in-memory job store (for a real app use Redis/BullMQ)
const conversionJobs = new Map();

const jobQueue = [];
let isProcessingQueue = false;

async function processQueue() {
    if (isProcessingQueue) return;
    isProcessingQueue = true;
    while (jobQueue.length > 0) {
        const jobConfig = jobQueue.shift();
        try {
            await processFile(jobConfig);
        } catch (e) {
            console.error('Queue processing failed for job', jobConfig.jobId, e);
        }
    }
    isProcessingQueue = false;
}

router.post('/', async (req, res) => {
    try {
        const { fileId, inputFormat, outputFormat, originalName, finalBaseName } = req.body;

        if (!fileId || !outputFormat || !originalName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const inputPath = path.join(__dirname, '../uploads', fileId);
        
        if (!fs.existsSync(inputPath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const baseName = finalBaseName ? finalBaseName.replace(/[^a-z0-9_-]/gi, '') : (originalName.lastIndexOf('.') !== -1 ? originalName.substring(0, originalName.lastIndexOf('.')) : originalName);
        const outFileName = `${Date.now()}-${baseName}.${outputFormat}`;
        const outputPath = path.join(__dirname, '../converted', outFileName);
        const cleanName = `${baseName}.${outputFormat}`;

        const jobId = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
        conversionJobs.set(jobId, { status: 'processing', progress: 0 });

        jobQueue.push({ inputPath, outputPath, inputFormat, outputFormat, jobId, outFileName });
        processQueue(); // Start the sequential processor if not running

        res.json({ message: 'Conversion started', jobId, outFileName, cleanName });
    } catch (error) {
        console.error('Convert Request Error:', error);
        res.status(500).json({ error: 'Failed to start conversion' });
    }
});

router.get('/status/:jobId', (req, res) => {
    const job = conversionJobs.get(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
});

async function processFile({ inputPath, outputPath, inputFormat, outputFormat, jobId, outFileName }) {
    try {
        const ext = path.extname(inputPath).toLowerCase();
        // Determine whether to use Image or Video conversion
        if (outputFormat === 'jpg' || outputFormat === 'png' || outputFormat === 'jpeg' || outputFormat === 'webp') {
            await heicHelper.convertHeic(inputPath, outputPath, outputFormat.toUpperCase() === 'JPG' ? 'JPEG' : outputFormat.toUpperCase());
            conversionJobs.set(jobId, { status: 'completed', progress: 100, outFileName });
        } else if (outputFormat === 'mp4' || outputFormat === 'avi') {
            await ffmpegHelper.convertVideo(inputPath, outputPath, outputFormat, (progress) => {
                conversionJobs.set(jobId, { status: 'processing', progress: Math.floor(progress) });
            });
            conversionJobs.set(jobId, { status: 'completed', progress: 100, outFileName });
        } else {
            throw new Error('Unsupported output format');
        }
    } catch (error) {
        console.error('Processing error:', error);
        conversionJobs.set(jobId, { status: 'failed', error: error.message });
    }
}

module.exports = router;
