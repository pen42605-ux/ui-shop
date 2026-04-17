'use strict';

/**
 * ui-shop — Express static + SPA fallback for Railway.
 * Listen: process.env.PORT (Railway) on 0.0.0.0 — never localhost-only.
 */

const fs = require('fs');
const path = require('path');
const express = require('express');

process.on('uncaughtException', (err) => {
  console.error('[ui-shop] uncaughtException:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[ui-shop] unhandledRejection:', reason);
});

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

const root = path.join(path.resolve(__dirname));
const indexPath = path.join(root, 'index.html');

function resolveListenPort() {
  const fromEnv = process.env.PORT;
  if (fromEnv !== undefined && String(fromEnv).trim() !== '') {
    const n = parseInt(String(fromEnv), 10);
    if (Number.isFinite(n) && n > 0) return n;
    console.error('[ui-shop] Invalid process.env.PORT:', fromEnv);
    process.exit(1);
  }
  console.warn('[ui-shop] process.env.PORT unset — using 3000 for local dev only');
  return 3000;
}

const PORT = resolveListenPort();

if (!fs.existsSync(indexPath)) {
  console.error('[ui-shop] Startup failed: index.html not found at', indexPath);
  process.exit(1);
}

app.use(
  express.static(root, {
    fallthrough: true,
    index: 'index.html',
    dotfiles: 'ignore',
  })
);

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(404).type('text/plain').send('Not Found');
    return;
  }
  res.sendFile(indexPath, (err) => {
    if (err) next(err);
  });
});

app.use((err, req, res, next) => {
  console.error('[ui-shop] Error:', err && err.message ? err.message : err);
  if (res.headersSent) return;
  res.status(500).type('text/plain').send('Internal Server Error');
});

let server;
try {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log('[ui-shop] OK — HTTP server listening');
    console.log('[ui-shop] process.env.PORT =', JSON.stringify(process.env.PORT));
    console.log('[ui-shop] listening on 0.0.0.0:' + PORT);
    console.log('[ui-shop] __dirname =', __dirname);
    console.log('[ui-shop] static root =', root);
    console.log('[ui-shop] index.html =', indexPath);
  });
} catch (err) {
  console.error('[ui-shop] app.listen threw:', err);
  process.exit(1);
}

server.on('error', (err) => {
  console.error('[ui-shop] server error event:', err);
  process.exit(1);
});
