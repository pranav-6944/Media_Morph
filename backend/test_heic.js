const fs = require('fs').promises;
const heicConvert = require('heic-convert');
const path = require('path');

async function testConvert() {
    const inputPath = path.join(__dirname, 'uploads', '1773993899623-600200999-IMG20260121155959.heic');
    const outputPath = path.join(__dirname, 'converted', 'test_output.jpg');
    console.log('Reading file:', inputPath);
    try {
        const inputBuffer = await fs.readFile(inputPath);
        console.log('Buffer read. length:', inputBuffer.length);
        console.log('Starting concurrent conversion...');
        await Promise.all([
            heicConvert({ buffer: inputBuffer, format: 'JPEG', quality: 0.9 }),
            heicConvert({ buffer: inputBuffer, format: 'PNG', quality: 0.9 })
        ]);
        console.log('Concurrent Conversion successful.');
        await fs.writeFile(outputPath, outputBuffer);
    } catch (e) {
        console.error('CONVERSION ERROR:', e);
    }
}

testConvert();
