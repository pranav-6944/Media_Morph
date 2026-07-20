const express = require('express');
const path = require('path');
const fs = require('fs');
const heicHelper = require('../utils/heic-helper');
const ffmpegHelper = require('../utils/ffmpeg-helper');
const imageHelper = require('../utils/image-helper');
const audioHelper = require('../utils/audio-helper');

const router = express.Router();

// ── Format Category Maps ──────────────────────────────────────────────────────
const HEIC_EXTENSIONS  = ['.heic'];
const IMAGE_FORMATS    = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'];
const VIDEO_FORMATS    = ['mp4', 'avi', 'mkv', 'mov', 'webm', 'flv'];
const GIF_FORMAT       = 'gif'; // treated as video output, not image
const AUDIO_FORMATS    = ['mp3', 'wav', 'aac', 'ogg', 'flac'];

// ── In-memory Job Store ───────────────────────────────────────────────────────
// NOTE: For production use Redis/BullMQ. Server restart clears all jobs.
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

// ── POST /api/convert ─────────────────────────────────────────────────────────
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

        const baseName = finalBaseName
            ? finalBaseName.replace(/[^a-z0-9_\-]/gi, '')
            : (originalName.lastIndexOf('.') !== -1
                ? originalName.substring(0, originalName.lastIndexOf('.'))
                : originalName);

        const outFileName = `${Date.now()}-${baseName}.${outputFormat}`;
        const outputPath  = path.join(__dirname, '../converted', outFileName);
        const cleanName   = `${baseName}.${outputFormat}`;

        const jobId = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
        conversionJobs.set(jobId, { status: 'processing', progress: 0 });

        jobQueue.push({ inputPath, outputPath, inputFormat, outputFormat, jobId, outFileName });
        processQueue();

        res.json({ message: 'Conversion started', jobId, outFileName, cleanName });
    } catch (error) {
        console.error('Convert Request Error:', error);
        res.status(500).json({ error: 'Failed to start conversion' });
    }
});

// ── GET /api/convert/status/:jobId ───────────────────────────────────────────
router.get('/status/:jobId', (req, res) => {
    const job = conversionJobs.get(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
});

// ── Core File Processor ───────────────────────────────────────────────────────
async function processFile({ inputPath, outputPath, inputFormat, outputFormat, jobId }) {
    try {
        const inputExt = path.extname(inputPath).toLowerCase();
        const outFmt   = outputFormat.toLowerCase();

        // ── 1. Audio extraction / conversion ──────────────────────────────────
        if (AUDIO_FORMATS.includes(outFmt)) {
            await audioHelper.extractAudio(inputPath, outputPath, outFmt, (progress) => {
                conversionJobs.set(jobId, { status: 'processing', progress: Math.floor(progress) });
            });

        // ── 2. Video → GIF ────────────────────────────────────────────────────
        } else if (outFmt === GIF_FORMAT && VIDEO_FORMATS.concat(['mp4','mov','avi','mkv','webm']).includes(
            (inputFormat || '').toLowerCase()
        )) {
            await ffmpegHelper.videoToGif(inputPath, outputPath, 10, 480, (progress) => {
                conversionJobs.set(jobId, { status: 'processing', progress: Math.floor(progress) });
            });

        // ── 3. HEIC → image ───────────────────────────────────────────────────
        } else if (HEIC_EXTENSIONS.includes(inputExt) && IMAGE_FORMATS.includes(outFmt)) {
            // heic-convert handles JPEG and PNG natively; for WEBP/AVIF/TIFF use sharp pipeline
            if (outFmt === 'webp' || outFmt === 'avif' || outFmt === 'tiff') {
                // Convert to PNG first, then use sharp for final format
                const tmpPath = outputPath + '.tmp.png';
                await heicHelper.convertHeic(inputPath, tmpPath, 'PNG');
                await imageHelper.convertImage(tmpPath, outputPath, outFmt);
                fs.unlinkSync(tmpPath);
            } else {
                const heicFmt = outFmt === 'jpg' ? 'JPEG' : outFmt.toUpperCase();
                await heicHelper.convertHeic(inputPath, outputPath, heicFmt);
            }

        // ── 4. Generic image → image (sharp) ─────────────────────────────────
        } else if (IMAGE_FORMATS.includes(outFmt)) {
            await imageHelper.convertImage(inputPath, outputPath, outFmt);

        // ── 5. Video → video ──────────────────────────────────────────────────
        } else if (VIDEO_FORMATS.includes(outFmt)) {
            await ffmpegHelper.convertVideo(inputPath, outputPath, outFmt, (progress) => {
                conversionJobs.set(jobId, { status: 'processing', progress: Math.floor(progress) });
            });

        } else {
            throw new Error(`Unsupported output format: ${outputFormat}`);
        }

        conversionJobs.set(jobId, { status: 'completed', progress: 100 });

    } catch (error) {
        console.error('Processing error:', error);
        conversionJobs.set(jobId, { status: 'failed', error: error.message });
    }
}

module.exports = router;
