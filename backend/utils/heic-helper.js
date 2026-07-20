const fs = require('fs').promises;
const heicConvert = require('heic-convert');
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.log("Sharp not installed, webp unsupported");
}

async function convertHeic(inputPath, outputPath, format = 'JPEG') {
    try {
        const inputBuffer = await fs.readFile(inputPath);
        
        const targetIsWebp = format === 'WEBP';
        const intermediateFormat = targetIsWebp ? 'PNG' : format;

        const outputBuffer = await heicConvert({
            buffer: inputBuffer,
            format: intermediateFormat,
            quality: 0.9 
        });

        if (targetIsWebp && sharp) {
            const webpBuffer = await sharp(outputBuffer).webp({ quality: 90 }).toBuffer();
            await fs.writeFile(outputPath, webpBuffer);
        } else {
            await fs.writeFile(outputPath, outputBuffer);
        }
    } catch (err) {
        console.error('HEIC Conversion Failed', err);
        throw err;
    }
}

module.exports = { convertHeic };
