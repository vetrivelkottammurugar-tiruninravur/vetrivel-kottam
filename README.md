# Murugar Temple Manager - install as an Android app

Arulmigu Sri Valli Devasena Sametha Prasanna Subramanya Swamy Thirukoil, Vetrivel Kottam, Thiruninravur

## 1. Host the app files (once)
OneDrive / SharePoint cannot display web pages, so put these files together in one folder on any free https static host
(GitHub Pages, Netlify, Cloudflare Pages). **Your data is not stored there** - only the app.

| File | Purpose |
|---|---|
| index.html | the app (put your `murugar_temple_manager.html` here, renamed to `index.html`) |
| manifest.webmanifest, icon-*.png | name, icon, shortcuts, "share to app" |
| sw.js | offline start + receives photos shared from the Gallery |

## 2. Install on the phone
Open the https address in Chrome -> menu (3 dots) -> **Install app**. It gets its own icon and opens full screen.
Long-press the icon for shortcuts: Scan notebook, Add donation, New booking, Today's reminders.
In the Gallery or Camera, open a photo -> Share -> **Temple** to scan it straight away.
Want an .apk / .aab? Paste your https address into pwabuilder.com.
After you replace index.html, change `tmgr-v4` in sw.js to `tmgr-v5` so phones update.

## 3. OneDrive sync from the phone
Android Chrome cannot write to a OneDrive file directly, so the app signs in to Microsoft Graph and keeps one file in
**OneDrive > Apps > (your app name) > murugar_temple_db.json**.
1. Microsoft Entra admin centre > App registrations > New registration (accounts: personal Microsoft accounts is simplest).
2. Authentication > add platform **Single-page application**, Redirect URI = the exact address shown on the app's start screen.
3. API permissions > Microsoft Graph > Delegated > **Files.ReadWrite.AppFolder** and offline_access.
4. Copy the Application (client) ID into the app's start screen > Sign in to OneDrive. Tick "Create the new database in OneDrive" on the first device only.
Notes: Microsoft limits refresh tokens for single-page apps to 24 hours, so expect a quick re-sign-in about once a day. Saves use the file's eTag, so two people editing at once get a conflict warning. Upload limit is 4 MB.

## 4. Smart Scan (reads Tamil + English handwriting)
Scan > Smart Scan > Set up. Create a free key at aistudio.google.com/apikey and paste it. The key stays on that device (or inside your encrypted database if you choose).
Privacy: on Google's free tier, submitted content may be used to improve Google products; the paid tier does not. For private data enable billing, or use On-device / Paste text.
