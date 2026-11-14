# My matrix

Ofentse’s personal, monochrome Eisenhower matrix. Plain HTML, CSS, and JavaScript: no build step, packages, subscription, account, or API key.

## Put it online with GitHub Pages

Use your computer for the initial upload.

1. Extract `my-matrix.zip`.
2. Sign into GitHub and create a repository named `my-matrix`. Choose **Public** for GitHub Pages on GitHub Free. Initialise it with a README so the `main` branch exists.
3. In the repository, choose **Add file → Upload files**. Upload the extracted files, including `index.html`, `style.css`, `model.js`, `app.js`, `sw.js`, `manifest.webmanifest`, and both PNG icons. Commit the upload. Upload the files themselves, not the ZIP or a parent folder. `index.html` must appear at the top level of the repository. This package also includes `.nojekyll`; include it if your file picker shows it.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**, then **main**, then **/(root)**. Click **Save**.
6. Wait for deployment to finish. Return to Pages and open the website address shown there. If it initially returns a 404, check the deployment status under Actions, then refresh after deployment finishes.

GitHub publishes the app code, not the tasks you type into it. Tasks are stored only in your browser. Never upload your task backup into the public repository.

GitHub documentation:
- https://docs.github.com/en/pages/quickstart
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Put it on your iPhone Home Screen

1. Open the published website address in **Safari** on your iPhone.
2. Tap **Share**. Depending on your Safari layout, this may be inside the page menu or More menu.
3. Choose **Add to Home Screen**. If **Open as Web App** appears, enable it.
4. Name it **My matrix**, then tap **Add**.
5. Launch it from the new icon while online. In Settings, wait for **Offline access is ready on this device**.
6. Add a test task. Close the app and reopen it to check it saved. Then try opening it with Wi-Fi and mobile data temporarily off; turn them back on afterwards.

Start entering your real tasks in the Home Screen app. Do not rely on Safari and Home Screen app installations sharing the same storage. Use a backup to transfer tasks if needed.

Apple documentation:
https://support.apple.com/en-az/guide/iphone/iphea86e5236/26/ios/26

## Everyday use

- Type into **Add a task**, then tap plus or press Enter.
- **Important** means it matters to you. **Urgent** means it needs attention soon. The switches choose the quadrant automatically.
- Use the quadrant's **Add task** button to start with its switches already selected.
- Add a small **First step** if it helps. You can choose a time estimate or **No timer**.
- Tap the task name to edit it or move it by changing its switches.
- Tap **+ Today** to choose it for today. No fixed selection limit applies.
- Open **Today** for your selected tasks. **Remove** only removes a task from today; it remains in the matrix.
- The arrow on a task, or **Begin** in Today, opens its focus view. The timer is optional. Closing focus stops its timer. A reload also resets it. This app does not provide background alarms, notifications, or reminders.
- Tap a checkbox or **Mark complete** to complete a task. An Undo button appears for ten seconds. The check icon at the top opens completed tasks, where you can return a task to the matrix later.
- A new day clears the daily selection using your device's local date. Unfinished tasks remain in their quadrants. The page also checks the date after you return to it.

The bottom-left quadrant uses the standard label **Delegate**. If you cannot delegate it, the label can serve as a prompt to ask for help or simplify the task.

## Light and dark modes

Open the menu at the top left. Under **Appearance**, choose **Light**, **Dark**, or **Device**. Device follows your phone's colour preference. Dark is the default for a fresh installation. The selected preference is saved locally.

## Backups and long-term use

This version has no server, cloud database, sign-in, or automatic device sync. Local browser storage can be lost if website data is cleared, your device is reset, or the browser removes it.

Open **Settings → Download backup** regularly, especially before replacing your phone or changing the app's website address. Save the JSON file somewhere durable, such as Files or iCloud Drive. A backup contains your task text, quadrant, time estimate, today's selection, and completed tasks. It does not include the appearance setting or timer state.

To recover or transfer tasks, open **Settings → Restore backup**, select that JSON file, and confirm replacement. Restore replaces the current list rather than merging it. Download a backup first if you want to keep the existing list. Invalid backups are rejected. If old saved data cannot be read, the app protects it from changes and offers a raw download under Settings.

If saving fails, a visible message warns you that tasks are only in memory. Download a backup before closing.

## Updating the app

1. Download a task backup first.
2. Edit the files and change `VERSION` at the top of `sw.js` to a new value, for example `matrix-v2.0.1`.
3. Upload the changed files to the same repository and branch. Keep the same website address so stored tasks remain accessible.
4. After deployment, open the app while online. Then close every open instance of this app, including any Safari tabs showing it, and reopen it. The new offline version activates after old instances close.

Do not clear website data just to get an update; that can erase your tasks.

## Local development and verification

Serve this folder over localhost rather than opening `index.html` directly from your filesystem. If Python is installed:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. An iPhone Home Screen installation needs the hosted HTTPS address.

With Node.js installed, run the included dependency-free checks:

```sh
node verify.cjs
```

Checked during creation: task creation, editing and quadrant movement, selection persistence after reload, focus timer start, completion and undo, saved light/dark preferences, the device-theme option, and app loading with the preview server stopped. Automated checks cover quadrant rules, local dates, daily selection reset, valid/invalid backup data, optional timers, and asset/element integrity. Browser checks were in desktop Chromium; physical iPhone Safari testing remains your final device check.

## Source files

| File | Purpose |
| --- | --- |
| `index.html` | Screens, dialogs, and icons |
| `style.css` | Responsive layout and both themes |
| `model.js` | Task validation, sorting, and daily selection rules |
| `app.js` | Interactions, device storage, backups, and focus timer |
| `sw.js` | Offline cache and update lifecycle |
| `manifest.webmanifest` | Home Screen app metadata |
| `icon-192.png`, `icon-512.png` | Monochrome app icons |
| `verify.cjs` | Dependency-free verification script |

No analytics, external fonts, AI services, or third-party scripts are used.
