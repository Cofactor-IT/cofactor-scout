const fs = require('fs');
const path = require('path');

const publicDir = path.join(process.cwd(), 'public');
const outputFile = path.join(process.cwd(), 'dir_listing.txt');

try {
    const files = fs.readdirSync(publicDir);
    let output = `Listing of ${publicDir}:\n`;
    files.forEach(file => {
        output += `${file}\n`;
    });
    fs.writeFileSync(outputFile, output);
    console.log('Written to ' + outputFile);
} catch (err) {
    fs.writeFileSync(outputFile, 'Error: ' + err.message);
}
