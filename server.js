'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 10000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

function safePath(requestPath) {
  let pathname = decodeURIComponent(requestPath || '/');
  pathname = pathname.split('?')[0].split('#')[0];
  if (pathname === '/') pathname = '/index.html';
  const resolved = path.resolve(ROOT, `.${pathname}`);
  if (resolved !== ROOT && !resolved.startsWith(`${ROOT}${path.sep}`)) return null;
  return resolved;
}

function send(res, status, body, contentType) {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, 'Method Not Allowed', 'text/plain; charset=utf-8');
    return;
  }

  const parsed = url.parse(req.url || '/');
  const filePath = safePath(parsed.pathname);
  if (!filePath) {
    send(res, 400, 'Bad Request', 'text/plain; charset=utf-8');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=300',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      });
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // SPA fallback. This keeps deep links working without changing the existing app.
    const indexPath = path.join(ROOT, 'index.html');
    fs.readFile(indexPath, (indexErr, data) => {
      if (indexErr) {
        send(res, 500, 'Application entry point is unavailable.', 'text/plain; charset=utf-8');
        return;
      }
      send(res, 200, data, 'text/html; charset=utf-8');
    });
  });
});

server.on('error', (err) => {
  console.error('[ScriptFlow Pro] Server error:', err);
  process.exitCode = 1;
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[ScriptFlow Pro] Listening on 0.0.0.0:${PORT}`);
});
