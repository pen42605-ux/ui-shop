'use strict';

/**
 * ui-shop — Express static + SPA fallback for Railway.
 * Binds process.env.PORT on 0.0.0.0 (never localhost-only).
 */

const fs = require('fs');
const path = require('path');
const express = require('express');

function logError(label, err) {
  const msg = err && err.stack ? err.stack : String(err);
  console.error('[ui-shop] ' + label + ':', msg);
}

process.on('uncaughtException', (err) => {
  logError('uncaughtException', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logError('unhandledRejection', reason);
  process.exit(1);
});

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

const indexPath = path.join(__dirname, 'index.html');

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

function start() {
  try {
    if (!fs.existsSync(indexPath)) {
      console.error('[ui-shop] Startup failed: index.html not found at', indexPath);
      process.exit(1);
    }

    app.use(express.static(__dirname));

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
      logError('express error handler', err);
      if (res.headersSent) return;
      res.status(500).type('text/plain').send('Internal Server Error');
    });

    let server;
    try {
      server = app.listen(PORT, '0.0.0.0', () => {
        console.log('Server started on PORT:', PORT);
        console.log('[ui-shop] process.env.PORT =', JSON.stringify(process.env.PORT));
        console.log('[ui-shop] listening on 0.0.0.0:' + PORT);
        console.log('[ui-shop] __dirname =', __dirname);
        console.log('[ui-shop] express.static(__dirname)');
        console.log('[ui-shop] index.html =', indexPath);
      });
    } catch (err) {
      logError('app.listen threw', err);
      process.exit(1);
    }

    server.on('error', (err) => {
      logError('server listen error', err);
      process.exit(1);
    });
  } catch (err) {
    logError('startup failed', err);
    process.exit(1);
  }
}

start();
