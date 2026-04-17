'use strict';

/**
 * Static site + SPA fallback. Serves ../public (sibling of /server).
 * Railway: set Root Directory to `server`; PORT is injected automatically.
 */

const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

const publicDir = path.join(__dirname, '..', 'public');
const indexPath = path.join(publicDir, 'index.html');

function logErr(label, err) {
  const msg = err && err.stack ? err.stack : String(err);
  console.error('[server]', label + ':', msg);
}

process.on('uncaughtException', (err) => {
  logErr('uncaughtException', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logErr('unhandledRejection', reason);
  process.exit(1);
});

function resolvePort() {
  const raw = process.env.PORT;
  if (raw !== undefined && String(raw).trim() !== '') {
    const n = parseInt(String(raw), 10);
    if (Number.isFinite(n) && n > 0) return n;
    console.error('[server] Invalid process.env.PORT:', raw);
    process.exit(1);
  }
  console.warn('[server] process.env.PORT unset — using 3000 for local dev');
  return 3000;
}

const PORT = resolvePort();

if (!fs.existsSync(indexPath)) {
  console.error('[server] Missing index.html at', indexPath);
  process.exit(1);
}

app.use(
  express.static(publicDir, {
    fallthrough: true,
    index: false,
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
  logErr('express', err);
  if (!res.headersSent) {
    res.status(500).type('text/plain').send('Internal Server Error');
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('[server] Started. PORT=', PORT, 'listening on 0.0.0.0:' + PORT);
  console.log('[server] process.env.PORT =', JSON.stringify(process.env.PORT));
  console.log('[server] publicDir =', publicDir);
});

server.on('error', (err) => {
  logErr('listen', err);
  process.exit(1);
});
