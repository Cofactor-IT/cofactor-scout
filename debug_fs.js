const fs = require('fs');
const path = require('path');

const publicDir = path.join(process.cwd(), 'public');
const iconsDir = path.join(process.cwd(), 'icons');
const targetDir = path.join(publicDir, 'icons');

console.log('--- FS DIAGNOSTIC ---');
console.log('CWD:', process.cwd());
console.log('Public Dir:', publicDir);
console.log('Icons Dir:', iconsDir);

try {
    const publicStats = fs.statSync(publicDir);
    console.log('Public Dir Stats:', {
        isDirectory: publicStats.isDirectory(),
        mode: publicStats.mode
    });
} catch (e) {
    console.error('Error stating public dir:', e.message);
}

try {
    const iconsStats = fs.statSync(iconsDir);
    console.log('Icons Dir Stats:', {
        isDirectory: iconsStats.isDirectory(),
        mode: iconsStats.mode
    });
} catch (e) {
    console.error('Error stating icons dir:', e.message);
}

try {
    console.log('Attempting to create directory:', targetDir);
    fs.mkdirSync(targetDir, { recursive: true });
    console.log('Directory created/exists.');
    
    // Check if it exists now
    if (fs.existsSync(targetDir)) {
         console.log('VERIFIED: Target directory exists.');
         // Create a test file
         fs.writeFileSync(path.join(targetDir, 'test.txt'), 'hello');
         console.log('Test file created.');
    } else {
         console.error('FAILED: Target directory does not exist after mkdir.');
    }

} catch (e) {
    console.error('Error creating directory:', e.message);
}
