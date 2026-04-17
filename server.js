'use strict';

const path = require('path');
const express = require('express');

const app = express();
const root = __dirname;
const indexPath = path.join(root, 'index.html');

const PORT = Number(process.env.PORT) || 3000;

app.use(express.static(root));

app.get('*', (req, res, next) => {
  res.sendFile(indexPath, (err) => {
    if (err) next(err);
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).type('text/plain').send('Internal Server Error');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('ui-shop listening on http://0.0.0.0:' + PORT);
});
