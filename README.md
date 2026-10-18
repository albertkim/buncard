# Buncard

A private, offline-capable loyalty card wallet. No accounts, ads, or tracking.

## Development

Requires Node 22.12 or newer. npm is the only package manager.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run lint
npm run format:check
```

`npm run preview -- --host 0.0.0.0` serves the production build on port 4173. The repository contains no test files or test framework dependencies.

## Source layout

- `src/App.tsx` coordinates the wallet and the currently open sheet.
- `src/components/` contains the wallet, card form and scanner, barcode view, installation instructions, settings, and shared sheet.
- `src/hooks/` owns local card state, PWA installation, screen wake locks, and pull-to-dismiss gestures.
- `src/domain/cards.ts` defines card types, colors, normalization, and barcode validation.
- `src/lib/` handles storage, backups, and service-worker registration.
- `src/styles/` groups shared styles and component styles behind a single CSS entry point.

Camera scanning and barcode rendering load on demand. Animations respect reduced-motion preferences. Sheet dragging updates a transform without React renders per frame, while preserving native scrolling, text editing, keyboard dismissal, and focus restoration.

## Data and installation

Cards stay in this browser on this device under the original `buncard-cards` storage key. Original JSON backups remain compatible. Imports validate the complete file before saving and skip duplicate card numbers. Unreadable saved data is preserved for export.

Export a backup before clearing browser data or changing devices. Home-screen apps can have separate storage on some platforms. Installation instructions remain under **Backup & settings → Add to home screen**.

The app shell, icons, and fonts are cached for offline use after the first successful online load. Open wallets show a refresh action when an updated version is ready.

## Deployment

[Production](https://buncard.vercel.app) is hosted on Vercel and deploys from `main`. The build command is `npm run build`, with output in `dist`. `vercel.json` includes SPA routing and revalidation headers for service-worker entry points.
