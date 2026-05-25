# 200 Days With You

A private, cinematic love letter experience built with React, Vite, and Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Customize

### Passcode

Edit `src/config/constants.js`:

```js
export const PASSCODE = '200520';
```

### Letter text & copy

Edit `src/config/content.js` — all screen text and love letter paragraphs live here.

### Background music

Add your own soft piano track at:

```
public/audio/piano.mp3
```

If the file is missing, the site uses a gentle synthesized ambient fallback.

## Experience flow

1. Identity verification
2. Secret passcode
3. Letter open confirmation
4. Cinematic love letter reveal
5. Emotional ending — *I'm still here.*

## Stack

- React + Vite
- Framer Motion
- Lenis smooth scroll
- CSS Modules (no inline styles)
