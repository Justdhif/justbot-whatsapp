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
console.log('Done');
