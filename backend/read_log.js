import fs from 'fs';
try {
    const data = fs.readFileSync('logs/error.log', 'utf8');
    const lines = data.split('\n');
    console.log(lines.slice(-30).join('\n'));
} catch (e) {
    console.error(e);
}
