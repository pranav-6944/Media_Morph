const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

// Configure fluent-ffmpeg to use the locally installed binaries
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * General video-to-video conversion.
 * Supports: mp4, avi, mkv, mov, webm, flv
 */
function convertVideo(inputPath, outputPath, format, progressCallback) {
    return new Promise((resolve, reject) => {
        let command = ffmpeg(inputPath)
            .output(outputPath)
            .on('progress', (progress) => {
                if (progress.percent && progressCallback) {
                    progressCallback(progress.percent);
                }
            })
            .on('end', () => resolve(outputPath))
            .on('error', (err) => {
                console.error('FFmpeg error:', err);
                reject(err);
            });

        // Apply codec optimizations per format
        if (format === 'mp4') {
            command = command.videoCodec('libx264').audioCodec('aac');
        } else if (format === 'webm') {
            command = command.videoCodec('libvpx-vp9').audioCodec('libvorbis');
        } else if (format === 'mkv') {
            command = command.videoCodec('libx264').audioCodec('aac');
        } else if (format === 'mov') {
            command = command.videoCodec('libx264').audioCodec('aac');
        } else if (format === 'avi') {
            command = command.videoCodec('libxvid').audioCodec('libmp3lame');
        }

        command.run();
    });
}

/**
 * Converts a video to an animated GIF.
 * @param {number} fps - Frames per second for the GIF (default 10)
 * @param {number} scale - Width in pixels; height scales automatically (default 480)
 */
function videoToGif(inputPath, outputPath, fps = 10, scale = 480, progressCallback) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([
                '-vf', `fps=${fps},scale=${scale}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
                '-loop', '0'
            ])
            .output(outputPath)
            .on('progress', (progress) => {
                if (progress.percent && progressCallback) {
                    progressCallback(progress.percent);
                }
            })
            .on('end', () => resolve(outputPath))
            .on('error', (err) => {
                console.error('GIF conversion error:', err);
                reject(err);
            })
            .run();
    });
}

/**
 * Compresses a video using CRF (Constant Rate Factor).
 * Lower CRF = better quality, larger file. Recommended: 23–28.
 */
function compressVideo(inputPath, outputPath, crf = 26, progressCallback) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .videoCodec('libx264')
            .outputOptions([`-crf ${crf}`, '-preset fast'])
            .audioCodec('aac')
            .output(outputPath)
            .on('progress', (progress) => {
                if (progress.percent && progressCallback) {
                    progressCallback(progress.percent);
                }
            })
            .on('end', () => resolve(outputPath))
            .on('error', (err) => {
                console.error('Compression error:', err);
                reject(err);
            })
            .run();
    });
}

module.exports = { convertVideo, videoToGif, compressVideo };
