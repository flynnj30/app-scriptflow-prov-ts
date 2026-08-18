const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'dist');
const port = Number(process.env.PORT || 3000);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function safePath(urlPath) {
  const decoded = decodeURIComponent((urlPath || '/').split('?')[0]);
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const target = path.resolve(root, relative);
  return target.startsWith(root + path.sep) ? target : path.join(root, 'index.html');
}

const server = http.createServer((req, res) => {
  let target;
  try { target = safePath(req.url); } catch { target = path.join(root, 'index.html'); }
  fs.stat(target, (err, stat) => {
    if (err || !stat.isFile()) target = path.join(root, 'index.html');
    fs.readFile(target, (readErr, data) => {
      if (readErr) { res.writeHead(500, {'Content-Type':'text/plain; charset=utf-8'}); return res.end('Server error'); }
      const ext = path.extname(target).toLowerCase();
      res.writeHead(200, {
        'Content-Type': mime[ext] || 'application/octet-stream',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      });
      res.end(data);
    });
  });
});

server.listen(port, '0.0.0.0', () => console.log(`ScriptFlow Pro listening on 0.0.0.0:${port}`));
