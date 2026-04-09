const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('<img ')) {
        content = content.replace(/<img /g, '<img loading="lazy" ');
        // Optional: Ensure we don't duplicate `loading="lazy" loading="lazy"`
        content = content.replace(/loading="lazy" loading="lazy"/g, 'loading="lazy"');
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated images in ${file}`);
    }
});
