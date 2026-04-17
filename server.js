'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

const root = path.resolve(__dirname);
const indexPath = path.join(root, 'index.html');

const rawPort = process.env.PORT;
const PORT =
  rawPort !== undefined && rawPort !== ''
    ? parseInt(String(rawPort), 10)
    : 3000;

if (!Number.isFinite(PORT) || PORT < 1) {
  console.error('[ui-shop] Invalid PORT:', rawPort);
  process.exit(1);
}

if (!fs.existsSync(indexPath)) {
  console.error('[ui-shop] Missing index.html at', indexPath);
  process.exit(1);
}

app.use(
  express.static(root, {
    fallthrough: true,
    index: 'index.html',
  })
);

function sendIndex(req, res, next) {
  res.sendFile(indexPath, { maxAge: 0 }, (err) => {
    if (err) next(err);
  });
}

app.get('*', sendIndex);
app.head('*', sendIndex);

app.use((err, req, res, next) => {
  console.error('[ui-shop]', err);
  if (res.headersSent) return;
  res.status(500).type('text/plain').send('Internal Server Error');
});

try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('[ui-shop] Server started');
    console.log('[ui-shop] PORT (listening):', PORT);
    console.log('[ui-shop] process.env.PORT:', rawPort === undefined ? '(unset, using default)' : String(rawPort));
    console.log('[ui-shop] cwd:', process.cwd());
    console.log('[ui-shop] static root:', root);
  });

  server.on('error', (err) => {
    console.error('[ui-shop] listen error:', err);
    process.exit(1);
  });
} catch (err) {
  console.error('[ui-shop] startup error:', err);
  process.exit(1);
}
