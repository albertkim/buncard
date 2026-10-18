# Buncard

A small, private home for your loyalty cards. No accounts, ads, or tracking. Cards live in your browser, with JSON backups to move them between devices.

## Run locally

Use Node 22.12+ (Node 24 LTS recommended).

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run lint
npm test
```

For browser tests, install Chromium once with `npx playwright install chromium`. Tests run against the production build, so build first. `npm run preview -- --host 0.0.0.0` serves the built app on port 4173.

## The wallet experience

- One wallet page with search, a single add action, and a quiet backup/settings utility.
- Ticket-shaped cards with graphic patterns, a custom rabbit identity, and spring-based press and layout feedback. Reduced-motion preferences are respected.
- Mobile bottom sheets, keyboard focus management, and large touch targets.
- Scan a card with your camera or enter its number. Code 128, EAN-13, and QR display retain their saved format.
- A clear checkout view requests a screen wake lock when supported. Brightness stays under the device's control.
- Duplicate-safe imports, export backups, deletion with undo, and protection against overwriting unreadable saved data.
- Installable PWA, a single generated manifest, offline app-shell caching, and locally bundled fonts.

Existing `buncard-cards` local storage and original JSON exports are compatible. Import rejects invalid files before making changes. Cards are stored on this device and browser, not synced. Export before changing devices or clearing browser data. Installed apps can have separate storage on some platforms.

## Interaction research

[Motion's React gestures](https://motion.dev/docs/react-gestures) and layout transitions suit tactile cards and collection changes without a bespoke gesture engine. [MotionConfig](https://motion.dev/docs/react-motion-config) applies the user's reduced-motion preference globally. Animation is feedback, never a prerequisite for using a card.

[Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog) provides keyboard navigation, focus trapping, screen-reader announcements, and Escape dismissal. The same dialog becomes a bottom sheet on phones and a centred panel on wider screens. Standard buttons remain available for every action; swipe-only interactions would make checkout less discoverable.

The [web.dev installation guide](https://web.dev/learn/pwa/installation) informed the install flow: native installation where available and explicit platform instructions otherwise. The app shell and font files are precached for offline use after the first successful online load. The camera scanner is loaded on demand to keep the initial wallet smaller.

## Deployment

The existing app is available at https://buncard.vercel.app and responds from Vercel. This repository includes Vercel SPA rewrites. Build command: `npm run build`; output: `dist`. These local changes do not publish a deployment. Vercel dashboard access and the current Git integration have not been verified.

## Dependency maintenance

Unused UI, theme, and Tailwind dependencies were removed. npm is the single package manager. All direct dependencies use current stable releases, including TypeScript 7. Oxlint replaces the TypeScript-version-coupled ESLint parser while retaining TypeScript, React, hooks, and accessibility checks. Type checking runs independently with the latest TypeScript compiler during the production build.
