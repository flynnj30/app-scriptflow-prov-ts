const fs = require('fs');
const path = require('path');
const root = __dirname;
const dist = path.join(root, 'dist');
const assets = path.join(dist, 'assets');
const src = path.join(root, 'src');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(assets, { recursive: true });

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*<script src="js\/(firebase-config|loading|objection-handler|notifications|ics-calendar-sync|app)\.js"><\/script>/g, '')
  .replace(/<\/body>/, '<script src="assets/runtime.js" defer></script></body>');
fs.writeFileSync(path.join(dist, 'index.html'), index);
fs.copyFileSync(path.join(root, 'style.css'), path.join(assets, 'ui.css'));

// One public runtime keeps the browser source simple while the maintainable
// source remains outside the published directory. No source map is emitted.
const order = [
  'firebase-config.js',
  'loading.js',
  'objection-handler.js',
  'notifications.js',
  'ics-calendar-sync.js',
  'app.js'
];
const runtime = order.map(file => fs.readFileSync(path.join(src, file), 'utf8')).join('\n;\n');
fs.writeFileSync(path.join(assets, 'runtime.js'), runtime);
console.log(`Built ${order.length} modules into dist/assets/runtime.js`);
