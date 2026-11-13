# StudentMithra

**Your Academic Life, Under Control.** An offline-first academic productivity PWA built with HTML, CSS, Vanilla JavaScript ES Modules and IndexedDB.

## Features

- Dashboard with live counts, upcoming exams, subject progress and study activity.
- Subject management with modules and topic-level completion tracking.
- Task management with due dates, priorities, status, search and filtering.
- Study-session planner with date range and weekly summaries.
- Examination tracker with live countdowns.
- Analytics derived from actual local records.
- Light/dark theme and preferences.
- JSON backup export and validated restore.
- Service Worker app-shell caching and installable PWA manifest.
- Responsive desktop sidebar and mobile bottom navigation.

## Requirements

A modern browser with IndexedDB, ES modules, Service Worker and Cache API support. Use HTTPS in production or `localhost` during development. Opening `index.html` directly with `file://` is not supported.

## Run locally

No build step or package installation is required.

### Python

```bash
cd StudentMithra
python -m http.server 8000
```

Open `http://localhost:8000`.

### VS Code

Open the `StudentMithra` folder and run it with a local HTTP server extension such as Live Server. Do not use a `file://` URL.

## Install as an app

1. Open the deployed HTTPS URL in Chrome or Edge.
2. Wait for the first load to finish so the app shell is cached.
3. Use the browser's **Install app** or **Add to Home Screen** option.
4. Launch StudentMithra from the installed app icon.

The service worker caches application files only. Student records stay in IndexedDB and are not copied into the Cache API. Core features work offline after the first successful cache installation.

## Free static hosting

Deploy the contents of this folder (not the parent folder) to any static hosting provider that offers HTTPS, such as GitHub Pages, Cloudflare Pages or Netlify's free static tier. No server-side runtime or database is required. For GitHub Pages, configure the repository's Pages source to the branch and folder containing `index.html`. If hosted below a repository subpath, keep relative asset paths intact.

## Data and privacy

- Data is stored locally in the current browser profile on the current device.
- There is no mandatory account, cloud sync or external API.
- Clearing browser/site data, using private browsing, uninstalling a browser or device failure can remove local records.
- Export a JSON backup regularly and before changing devices or browsers.
- Restoring a backup replaces all current StudentMithra records after explicit confirmation.

## Tests

Run the dependency-free validator and schema tests with Node.js:

```bash
node --test tests/*.test.js
```

Also perform the manual browser checks below before release.

## Manual release checklist

- [ ] Create, edit and delete a subject.
- [ ] Add modules and topics; toggle topic completion and verify subject progress.
- [ ] Create, edit, filter, complete and delete tasks.
- [ ] Add and delete exams; verify countdowns.
- [ ] Record, edit and delete study sessions; verify weekly totals.
- [ ] Export a backup, clear test data, restore it and verify all records.
- [ ] Reload and confirm IndexedDB persistence.
- [ ] Load once online, switch offline, reload and exercise CRUD flows.
- [ ] Check 320, 375, 390, 430, 768, 1024, 1366 and 1920 CSS pixel widths.
- [ ] Check browser console and Application > Service Workers / IndexedDB.

## Known scope notes

- This release is local-first and does not synchronize data between devices.
- Study planner entries are recorded study sessions with optional start/end times; there is no external calendar integration.
- Analytics are based only on records created by the student; the app ships without fabricated sample performance data.
- Browser storage quotas and eviction policies are controlled by the browser and operating system, not StudentMithra.
