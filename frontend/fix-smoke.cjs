const fs = require('fs');
const path = 'qa-browser-smoke.js';
let s = fs.readFileSync(path, 'utf8');
s = s.replace(/\.wait\(\{ state: 'visible', timeout: \d+ \}\)/g, ".waitFor({ state: 'visible', timeout: 5000 })");
s = s.replace(/\.wait\(\{ state: 'hidden', timeout: \d+ \}\)/g, ".waitFor({ state: 'hidden', timeout: 5000 })");
fs.writeFileSync(path, s);
console.log('Rewrote smoke test wait calls to waitFor syntax.');
