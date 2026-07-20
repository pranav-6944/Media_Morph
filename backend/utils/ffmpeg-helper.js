const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

// Configure fluent-ffmpeg to use the locally installed binaries
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

function convertVideo(inputPath, outputPath, format, progressCallback) {
    return new Promise((resolve, reject) => {
        let command = ffmpeg(inputPath)
            .output(outputPath)
            .on('progress', (progress) => {
                // fluent-ffmpeg progress object sometimes lacks percent if duration isn't known
                if (progress.percent && progressCallback) {
                    progressCallback(progress.percent);
                }
            })
            .on('end', () => {
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error('FFmpeg error:', err);
                reject(err);
            });

        // Add some optimizations depending on format
        if (format === 'mp4') {
            command = command.videoCodec('libx264');
        }

        command.run();
    });
}

module.exports = { convertVideo };
