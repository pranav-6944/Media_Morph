const sharp = require('sharp');

/**
 * Converts any sharp-supported image to the target format.
 * Sharp supported outputs: jpeg, png, webp, avif, tiff, gif
 * NOTE: BMP is NOT supported by sharp as output format.
 */
async function convertImage(inputPath, outputPath, format, quality = 85) {
    // Normalise: 'jpg' → 'jpeg'
    const fmt = format.toLowerCase() === 'jpg' ? 'jpeg' : format.toLowerCase();

    const SUPPORTED = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'];
    if (!SUPPORTED.includes(fmt)) {
        throw new Error(
            `Unsupported image output format: "${format}". ` +
            `Supported formats: ${SUPPORTED.join(', ')}`
        );
    }

    const QUALITY_FMTS = ['jpeg', 'webp', 'avif'];
    const options = QUALITY_FMTS.includes(fmt) ? { quality } : {};

    await sharp(inputPath)
        .toFormat(fmt, options)
        .toFile(outputPath);
}

module.exports = { convertImage };
