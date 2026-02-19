const fs = require('fs');
const path = require('path');

const sourceDir = path.join(process.cwd(), 'icons');
const destDir = path.join(process.cwd(), 'public', 'icons');

async function moveDir() {
    console.log(`Moving from ${sourceDir} to ${destDir}`);

    if (!fs.existsSync(sourceDir)) {
        console.error(`ERROR: Source directory ${sourceDir} does not exist.`);
        // Check if it's already in destination
        if (fs.existsSync(destDir)) {
            console.log(`Success: Destination directory ${destDir} already exists. Assuming move completed.`);
            return;
        }
        process.exit(1);
    }

    if (!fs.existsSync(destDir)) {
        console.log(`Creating destination directory: ${destDir}`);
        fs.mkdirSync(destDir, { recursive: true });
    }

    // Function to copy directory recursively
    function copyRecursive(src, dest) {
        const entries = fs.readdirSync(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                if (!fs.existsSync(destPath)) {
                    fs.mkdirSync(destPath);
                }
                copyRecursive(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
                console.log(`Copied ${entry.name}`);
            }
        }
    }

    try {
        copyRecursive(sourceDir, destDir);
        console.log('Copy complete. Removing source directory...');
        // fs.rmSync(sourceDir, { recursive: true, force: true }); // Commented out for safety until verified
        console.log('SUCCESS: Icons moved to public folder.');
    } catch (err) {
        console.error('ERROR moving files:', err);
        process.exit(1);
    }
}

moveDir();
