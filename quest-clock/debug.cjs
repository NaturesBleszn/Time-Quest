const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split(/\r?\n/);
let start = lines.findIndex(l => l.includes('</AnimatePresence>'));
console.log(lines.slice(720, 730).map(l => JSON.stringify(l)).join('\n'));
