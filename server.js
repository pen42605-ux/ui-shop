'use strict';

/**
 * ui-shop — Express + static `public/` for Railway.
 * Listens on process.env.PORT and 0.0.0.0.
 */

const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

const publicDir = path.join(__dirname, 'public');
const indexPath = path.join(publicDir, 'index.html');

function logError(label, err) {
  const msg = err && err.stack ? err.stack : String(err);
  console.error('[ui-shop]', label + ':', msg);
}

process.on('uncaughtException', (err) => {
  logError('uncaughtException', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logError('unhandledRejection', reason);
  process.exit(1);
});

function resolvePort() {
  const raw = process.env.PORT;
  if (raw !== undefined && String(raw).trim() !== '') {
    const n = parseInt(String(raw), 10);
    if (Number.isFinite(n) && n > 0) return n;
    console.error('[ui-shop] Invalid process.env.PORT:', raw);
    process.exit(1);
  }
  console.warn('[ui-shop] process.env.PORT unset — using 3000 for local dev');
  return 3000;
}

const PORT = resolvePort();

function sendIndex(res, next) {
  res.sendFile(indexPath, (err) => {
    if (err) next(err);
  });
}

if (!fs.existsSync(indexPath)) {
  console.error('[ui-shop] Missing', indexPath);
  process.exit(1);
}

app.get('/', (req, res, next) => {
  sendIndex(res, next);
});

app.head('/', (req, res, next) => {
  sendIndex(res, next);
});

app.use(
  express.static(publicDir, {
    index: false,
    dotfiles: 'ignore',
    fallthrough: true,
  })
);

app.use((err, req, res, next) => {
  logError('handler', err);
  if (!res.headersSent) {
    res.status(500).type('text/plain').send('Internal Server Error');
  }
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('[ui-shop] listening on 0.0.0.0:' + PORT);
  console.log('[ui-shop] process.env.PORT =', JSON.stringify(process.env.PORT));
  console.log('[ui-shop] public =', publicDir);
});

server.on('error', (err) => {
  logError('server error', err);
  process.exit(1);
});
