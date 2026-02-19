const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'public', 'cofactor-scout-hero-logo.png');

console.log(`Checking file: ${filePath}`);

if (!fs.existsSync(filePath)) {
    console.error('ERROR: File does not exist!');
    process.exit(1);
}

const buffer = fs.readFileSync(filePath);
console.log(`File size: ${buffer.length} bytes`);

// Check PNG signature: 89 50 4E 47 0D 0A 1A 0A
const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
let isValid = true;

for (let i = 0; i < pngSignature.length; i++) {
    if (buffer[i] !== pngSignature[i]) {
        isValid = false;
        break;
    }
}

if (isValid) {
    console.log('SUCCESS: File is a valid PNG.');
} else {
    console.error('ERROR: File is NOT a valid PNG. Header bytes mismatch.');
    console.log('First 8 bytes:', buffer.slice(0, 8));
}
