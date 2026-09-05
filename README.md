# Study Dashboard — V1

A calm, landscape-first dashboard for a Galaxy Tab S6 Lite mounted below an ultrawide monitor. It deliberately shows only the time, date, one combined agenda, next event, and weather.

## Run it now (demo mode)

1. On the computer, open this folder in a terminal and run: `python3 -m http.server 8080`.
2. Find the computer's local Wi-Fi address (for example `192.168.1.20`).
3. On the tablet, while on the same Wi-Fi, open Chrome and visit `http://YOUR-COMPUTER-IP:8080`.
4. Rotate the tablet to landscape. In Chrome's menu, choose **Add to Home screen** to make it feel like a dedicated dashboard.
5. Tap the `⛶` button once to enter full-screen. In Android display settings, set a long screen timeout; a kiosk app such as Fully Kiosk Browser can keep the display awake more reliably if desired.

The prototype is intentionally in **DEMO MODE**. Change the `demoEvents` list in `app.js` to test your own agenda; it requires no account access or external service. Leave the small local server running while using it on the tablet.

## Publish once with GitHub Pages

This folder is already prepared for GitHub Pages (`.github/workflows/deploy-pages.yml` and `.nojekyll` are included). Create a **new public GitHub repository**, upload the contents of this folder, and in the repository's **Settings → Pages**, set the source to **GitHub Actions**. The first push to `main` publishes the dashboard; use the URL shown in the workflow's deployment result on the tablet and add it to Chrome's home screen.

This is appropriate only while the page contains mock data. A GitHub Pages dashboard can be reached by anyone who knows its URL, so never publish account tokens, calendar exports, or private event titles there.

## Secure calendar integration later

Do **not** put Outlook or Google passwords, API keys, or refresh tokens in this page. Instead, put a small private backend between this display and the calendar providers:

```text
Galaxy Tab browser → your private dashboard service → Microsoft Graph + Google Calendar APIs
```

The service uses OAuth sign-in once for each account, stores refresh tokens server-side and encrypted, requests read-only calendar scopes, fetches only today's events, then sends a minimal unified event list to the tablet. The existing `demoEvents` / render functions are a simple data-adapter boundary: later, replace the demo list with `GET /api/today` from that private service, while leaving the screen design intact. Weather can likewise come from a server-side weather adapter or a public API proxy, with location configured server-side.

## Extend without clutter

Keep future modules behind their own API endpoints (`/api/tasks`, `/api/aqi`, `/api/mac-status`) and only add a panel after it earns a permanent place on the screen. The current grid can accept another small card without needing to redesign the dashboard.
