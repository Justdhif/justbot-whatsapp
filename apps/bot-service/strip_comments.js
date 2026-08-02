const fs = require('fs');
const path = require('path');

function removeComments(text) {
    const pattern = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\/\*[\s\S]*?\*\/)|(\/\/.*$)/gm;
    return text.replace(pattern, (match, p1) => {
        if (p1 !== undefined) return p1;
        return '';
    });
}

function walkSync(dir, filelist = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            walkSync(filepath, filelist);
        } else if (filepath.endsWith('.ts') || filepath.endsWith('.js')) {
            filelist.push(filepath);
        }
    }
    return filelist;
}

const dir = process.argv[2] || path.join(__dirname, 'src');
const files = walkSync(dir);
const cleaned = [];
for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const newContent = removeComments(content);
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf-8');
        cleaned.push(file);
    }
}
fs.writeFileSync('cleaned_files.json', JSON.stringify(cleaned, null, 2));

// Clean up heavy, unused emoji JSON databases in node_modules to pass Netlify 250MB limit
const parentNodeModules = path.resolve(__dirname, '../../node_modules');
const targetPaths = [
  path.join(parentNodeModules, 'iqc-canvas/assets/emoji'),
  path.join(parentNodeModules, 'brat-canvas/assets/emoji'),
  path.join(__dirname, 'node_modules/iqc-canvas/assets/emoji'),
  path.join(__dirname, 'node_modules/brat-canvas/assets/emoji')
];

targetPaths.forEach(emojiDir => {
  if (fs.existsSync(emojiDir)) {
    const jsonFiles = fs.readdirSync(emojiDir);
    jsonFiles.forEach(file => {
      // Keep only one light database if needed, or remove all heavy ones (apple, google, joypixels, twitter)
      // Since bot doesn't require Apple/Joypixels/Twitter high-res database renderings on backend server, delete them
      if (file.endsWith('.json') && !file.includes('google')) {
        try {
          fs.unlinkSync(path.join(emojiDir, file));
          console.log(`Cleaned up heavy asset: ${file}`);
        } catch (e) {
          console.error(`Failed to delete ${file}`, e);
        }
      }
    });
  }
});

console.log('Done');
