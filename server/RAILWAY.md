# Deploy on Railway

## Repository layout

The app expects this structure at the **repository root** (same level as this `server` folder):

- `server/` — Node entry (`package.json`, `server.js`)
- `public/` — static site (`index.html`, `css/`, `js/`, `images/`, …)

## Railway settings

1. **New Project** → Deploy from GitHub (or your Git provider).
2. Select the repository that contains both `server` and `public`.
3. **Settings → Service → Root Directory** → set to: `server`  
   This makes Railway run `npm install` and `npm start` inside `server/`, while still cloning the full repo so `../public` is available at runtime.
4. **Do not** set a custom `PORT` variable — Railway injects `PORT` automatically.
5. Deploy. In **Deploy logs**, confirm a line like: `[server] Started. PORT= … listening on 0.0.0.0:…`

## Local run

From the `server` directory:

```bash
npm install
npm start
```

Then open `http://127.0.0.1:3000` (or the port shown if `PORT` is set).

## Troubleshooting 502

- Root Directory must be **`server`** (not the repo root that only has `public`).
- Ensure `public/index.html` exists in the repo.
- Check deploy logs for listen errors or missing `public` path.
