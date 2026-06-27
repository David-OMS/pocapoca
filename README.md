# Birthday Site

Mobile-first birthday experience — built to run on weak Android phones (Tecno F1 tier).

## Flow

1. Passphrase gate → incoming call (decline dodges)
2. Voice "passphrase" recorder (real mic waveform, fake fallback)
3. Tease → second attempt → punchline
4. Confetti → blurry birthday message → glasses gag → clear text
5. Cake + wish (saved to DB) → Open when / future self hub

## Run locally

```bash
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
npm run dev
```

- Frontend: http://localhost:5173 (proxies `/api` to server)
- Backend: http://localhost:3001

## Production

```bash
npm run build
npm start
```

Serve over **HTTPS** so mic works on her phone. Tell her to open in **Chrome**, not inside WhatsApp/Instagram.

## Deploy on Railway

1. Push this repo to GitHub and connect it in Railway.
2. Leave **Root Directory** blank. Railway uses `railway.toml`:
   - **Build:** `npm run build` (installs client + server, builds React, syncs photo)
   - **Start:** `npm start`
3. Add variables in Railway:
   - `ADMIN_SECRET` — your private reset phrase
   - `TOBI_PHOTO_BASE64` — required for GitHub deploys (photo is gitignored). On your PC:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("c:\Users\user\Desktop\Big DABGS\tobi.jpeg"))
```

Copy the output into Railway → **Variables** → `TOBI_PHOTO_BASE64`.

4. **Networking** → generate a public URL.
5. Optional: add a **Volume** mounted at `/app/server` so wishes survive redeploys.

Put your call photo at the project root as `tobi.jpeg` for local dev (gitignored). It is copied into the build automatically.

## Customize

Edit `client/src/config.js` — names, photo path, birthday message, photos, open-when letters.

Put your photo in `client/public/placeholder-you.jpg` (or update `yourPhoto` in config).

## View saved data (you only)

- Wishes: `GET /api/wishes`
- Future messages: `GET /api/future-self`
- Open-when opens: `GET /api/open-when/opens`

## Reset for testing (you only — not shown to her)

Her site has **no** reset button. Use one of these:

### Option A — hidden admin page (easiest)

With the server running, open (bookmark this — she never sees it):

```
http://localhost:3001/__reset
```

Enter the secret (default: `poca-test-reset`) → **Clear wishes**. Then reload her tab to run the full flow again.

Set your own secret when live:

```bash
set ADMIN_SECRET=your-private-phrase
npm start
```

### Option B — delete the database file

Stop the server, delete `server/data.db`, start again. SQLite recreates an empty DB.

```powershell
Remove-Item "server\data.db"
npm start
```

### Option C — API from terminal

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3001/api/admin/reset" `
  -ContentType "application/json" `
  -Body '{"secret":"poca-test-reset"}'
```

## Phone tips

- Mic is used locally for waveform only — nothing uploaded
- If mic fails, fake waveform kicks in silently
- Volume thresholds in `useVoiceMeter.js` — tune after testing on a real device
- CSS-only confetti, no heavy particle libs
- Blur only on text block, not full page
