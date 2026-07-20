const express = require('express');
const path    = require('path');
const fs      = require('fs');

const heicHelper   = require('../utils/heic-helper');
const ffmpegHelper = require('../utils/ffmpeg-helper');
const imageHelper  = require('../utils/image-helper');
const audioHelper  = require('../utils/audio-helper');

const router = express.Router();

// ── Format category lists ─────────────────────────────────────────────────────
const HEIC_EXTS    = new Set(['.heic', '.heif']);
const IMAGE_EXTS   = new Set(['.jpg','.jpeg','.png','.webp','.avif','.tiff','.tif','.bmp','.gif','.svg']);
const VIDEO_EXTS   = new Set(['.mp4','.mov','.avi','.mkv','.webm','.flv','.wmv','.hevc','.h265']);
const AUDIO_EXTS   = new Set(['.mp3','.wav','.aac','.ogg','.flac','.m4a']);

// Output format sets
const IMAGE_OUT    = new Set(['jpg','jpeg','png','webp','avif','tiff','gif']);
const VIDEO_OUT    = new Set(['mp4','mov','avi','mkv','webm','flv']);
const AUDIO_OUT    = new Set(['mp3','wav','aac','ogg','flac']);

const STATS_FILE = path.join(__dirname, '../stats.json');

function updateStats(outFmt) {
    try {
        let stats = { totalConversions: 0, byFormat: {} };
        if (fs.existsSync(STATS_FILE)) {
            stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
        }
        stats.totalConversions += 1;
        stats.byFormat[outFmt] = (stats.byFormat[outFmt] || 0) + 1;
        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
    } catch (e) {
        console.error('Failed to update stats:', e);
    }
}

// ── In-memory job store ───────────────────────────────────────────────────────
const conversionJobs = new Map();
const jobQueue       = [];
let   isProcessing   = false;

async function drainQueue() {
    if (isProcessing) return;
    isProcessing = true;
    while (jobQueue.length > 0) {
        const job = jobQueue.shift();
        try { await processFile(job); }
        catch (e) { console.error('[Queue] job failed:', job.jobId, e.message); }
    }
    isProcessing = false;
}

// ── POST /api/convert ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { fileId, outputFormat, originalName, finalBaseName } = req.body;

        if (!fileId || !outputFormat || !originalName) {
            return res.status(400).json({ error: 'Missing required fields: fileId, outputFormat, originalName' });
        }

        const inputPath = path.join(__dirname, '../uploads', fileId);
        if (!fs.existsSync(inputPath)) {
            return res.status(404).json({ error: 'Uploaded file not found on server' });
        }

        // Normalise output format (mp4_compressed → mp4)
        const outFmt = outputFormat.toLowerCase().replace('_compressed', '');

        const rawBase   = finalBaseName && finalBaseName.trim() ? finalBaseName.trim() : originalName.replace(/\.[^.]+$/, '');
        const safeBase  = rawBase.replace(/[^a-z0-9_\-. ]/gi, '').trim() || 'converted';
        const outFile   = `${Date.now()}-${safeBase}.${outFmt}`;
        const outPath   = path.join(__dirname, '../converted', outFile);
        const cleanName = `${safeBase}.${outFmt}`;

        const jobId = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
        conversionJobs.set(jobId, { status: 'processing', progress: 0 });

        const isCompressed = outputFormat.toLowerCase() === 'mp4_compressed';
        jobQueue.push({ inputPath, outPath, outFmt, originalName, jobId, isCompressed });
        drainQueue();

        // Save output path in job so we can delete it later
        conversionJobs.set(jobId, { status: 'processing', progress: 0, outPath, outFileName: outFile });

        res.json({ message: 'Conversion queued', jobId, outFileName: outFile, cleanName });
    } catch (err) {
        console.error('[POST /convert] error:', err);
        res.status(500).json({ error: err.message || 'Failed to start conversion' });
    }
});

// ── GET /api/convert/status/:jobId ───────────────────────────────────────────
router.get('/status/:jobId', (req, res) => {
    const job = conversionJobs.get(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
});

// ── DELETE /api/convert/:jobId ───────────────────────────────────────────────
router.delete('/:jobId', (req, res) => {
    const job = conversionJobs.get(req.params.jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    // Delete output file if exists
    if (job.outPath && fs.existsSync(job.outPath)) {
        try {
            fs.unlinkSync(job.outPath);
        } catch (e) {
            console.error('Failed to delete output file:', e);
        }
    }
    conversionJobs.delete(req.params.jobId);
    res.json({ message: 'Deleted successfully' });
});

// ── POST /api/convert/cleanup ────────────────────────────────────────────────
router.post('/cleanup', (req, res) => {
    const { jobIds } = req.body || {};
    if (Array.isArray(jobIds)) {
        jobIds.forEach(id => {
            const job = conversionJobs.get(id);
            if (job && job.outPath && fs.existsSync(job.outPath)) {
                try { fs.unlinkSync(job.outPath); } catch (e) {}
            }
            conversionJobs.delete(id);
        });
    }
    res.json({ message: 'Cleanup complete' });
});

// ── Core processor ────────────────────────────────────────────────────────────
async function processFile({ inputPath, outPath, outFmt, originalName, jobId, isCompressed }) {
    const setProgress = (p) => conversionJobs.set(jobId, { status: 'processing', progress: Math.min(Math.floor(p), 99) });

    try {
        // Determine the input category from the ORIGINAL filename (not the temp upload name)
        const origExt  = path.extname(originalName).toLowerCase();
        const isHeic   = HEIC_EXTS.has(origExt);
        const isImage  = IMAGE_EXTS.has(origExt);
        const isVideo  = VIDEO_EXTS.has(origExt);
        const isAudio  = AUDIO_EXTS.has(origExt);

        console.log(`[Job ${jobId}] ${originalName} (${origExt}) → ${outFmt} | isHeic:${isHeic} isImage:${isImage} isVideo:${isVideo} isAudio:${isAudio}`);

        /* ── Branch 1: Audio output (any input type) ──────────────────────── */
        if (AUDIO_OUT.has(outFmt)) {
            if (!isAudio && !isVideo) {
                throw new Error(`Cannot extract audio from a "${origExt}" image file`);
            }
            await audioHelper.extractAudio(inputPath, outPath, outFmt, setProgress);

        /* ── Branch 2: Video → GIF ────────────────────────────────────────── */
        } else if (outFmt === 'gif' && isVideo) {
            await ffmpegHelper.videoToGif(inputPath, outPath, 10, 480, setProgress);

        /* ── Branch 3: HEIC / HEIF → image ───────────────────────────────── */
        } else if (isHeic && IMAGE_OUT.has(outFmt)) {
            if (['webp', 'avif', 'tiff', 'bmp', 'gif'].includes(outFmt)) {
                // heic-convert → PNG buffer, then sharp converts to final format
                const tmpPath = outPath + '.tmp.png';
                await heicHelper.convertHeic(inputPath, tmpPath, 'PNG');
                await imageHelper.convertImage(tmpPath, outPath, outFmt);
                try { fs.unlinkSync(tmpPath); } catch (_) {}
            } else {
                const heicFmt = outFmt === 'jpg' ? 'JPEG' : outFmt.toUpperCase();
                await heicHelper.convertHeic(inputPath, outPath, heicFmt);
            }

        /* ── Branch 4: Image → image (sharp) ─────────────────────────────── */
        } else if (isImage && IMAGE_OUT.has(outFmt)) {
            await imageHelper.convertImage(inputPath, outPath, outFmt);

        /* ── Branch 5: Video → video (ffmpeg) ────────────────────────────── */
        } else if (isVideo && VIDEO_OUT.has(outFmt)) {
            if (isCompressed) {
                await ffmpegHelper.compressVideo(inputPath, outPath, 26, setProgress);
            } else {
                await ffmpegHelper.convertVideo(inputPath, outPath, outFmt, setProgress);
            }

        /* ── Unsupported combination ──────────────────────────────────────── */
        } else {
            throw new Error(`Cannot convert "${origExt}" to "${outFmt}". Unsupported combination.`);
        }

        const job = conversionJobs.get(jobId) || {};
        conversionJobs.set(jobId, { ...job, status: 'completed', progress: 100 });
        console.log(`[Job ${jobId}] ✓ done → ${outPath}`);
        updateStats(outFmt);

    } catch (err) {
        console.error(`[Job ${jobId}] ✗ failed:`, err.message);
        const job = conversionJobs.get(jobId) || {};
        conversionJobs.set(jobId, { ...job, status: 'failed', progress: 0, error: err.message });
    } finally {
        // Cleanup original upload
        try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch (_) {}
    }
}

module.exports = router;
