const sharp = require('sharp');

/**
 * Converts any sharp-supported image to a target format.
 * Supports: jpg, jpeg, png, webp, avif, tiff, gif
 */
async function convertImage(inputPath, outputPath, format, quality = 85) {
    const normalizedFormat = format.toLowerCase() === 'jpg' ? 'jpeg' : format.toLowerCase();

    const sharpFormats = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'];
    if (!sharpFormats.includes(normalizedFormat)) {
        throw new Error(`Unsupported image format: ${format}`);
    }

    const qualityFormats = ['jpeg', 'webp', 'avif'];
    const options = qualityFormats.includes(normalizedFormat) ? { quality } : {};

    await sharp(inputPath)
        .toFormat(normalizedFormat, options)
        .toFile(outputPath);
}

module.exports = { convertImage };
