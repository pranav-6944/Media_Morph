const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Extracts audio from a video file, or converts audio formats.
 * Supports output: mp3, wav, aac, ogg, flac
 */
function extractAudio(inputPath, outputPath, format = 'mp3', progressCallback) {
    return new Promise((resolve, reject) => {
        const codecMap = {
            mp3: 'libmp3lame',
            wav: 'pcm_s16le',
            aac: 'aac',
            ogg: 'libvorbis',
            flac: 'flac',
        };

        const codec = codecMap[format.toLowerCase()];
        if (!codec) {
            return reject(new Error(`Unsupported audio format: ${format}`));
        }

        ffmpeg(inputPath)
            .noVideo()
            .audioCodec(codec)
            .audioBitrate(format === 'wav' || format === 'flac' ? null : '192k')
            .output(outputPath)
            .on('progress', (progress) => {
                if (progress.percent && progressCallback) {
                    progressCallback(progress.percent);
                }
            })
            .on('end', () => resolve(outputPath))
            .on('error', (err) => {
                console.error('Audio conversion error:', err);
                reject(err);
            })
            .run();
    });
}

module.exports = { extractAudio };
