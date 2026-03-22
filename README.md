# ◈ NeoTerm PWA — Complete Setup & Deploy Guide

> The ultimate Android terminal PWA. Beyond Termux.
> AI-powered · Offline-ready · Installable · 120+ commands

---

## 📁 Project Structure

```
neoterm-pwa/
├── public/
│   ├── index.html        ← Full PWA HTML (all meta tags)
│   ├── manifest.json     ← PWA manifest (icons, shortcuts)
│   ├── sw.js             ← Service Worker (offline, cache, push)
│   ├── offline.html      ← Offline fallback page
│   └── icons/            ← All PWA icon sizes (auto-generated)
│       ├── icon-72.png
│       ├── icon-96.png
│       ├── icon-128.png
│       ├── icon-144.png
│       ├── icon-152.png
│       ├── icon-192.png
│       ├── icon-384.png
│       └── icon-512.png
├── src/
│   ├── index.js          ← React entry point
│   └── App.jsx           ← NeoTerm main app (paste your code here)
├── package.json
├── vercel.json           ← Vercel config
├── netlify.toml          ← Netlify config
├── generate-icons.js     ← Icon generator script
└── README.md
```

---

## ⚡ Quick Deploy (5 minutes)

### Step 1 — Install Node.js
```bash
# Download from: https://nodejs.org (v20 LTS)
node --version   # should show v20.x.x
npm --version    # should show 10.x.x
```

### Step 2 — Set up the project
```bash
# Create React app
npx create-react-app neoterm-pwa
cd neoterm-pwa

# Delete default files
rm src/App.js src/App.css src/logo.svg src/App.test.js
```

### Step 3 — Copy your files
```bash
# Replace these files with the ones from this package:
# public/index.html     → copy from this package
# public/manifest.json  → copy from this package
# public/sw.js          → copy from this package
# public/offline.html   → copy from this package
# src/index.js          → copy from this package
# src/App.jsx           → paste NeoTerm code here
```

### Step 4 — Generate icons
```bash
# Generate SVG icons (works without any npm install)
node generate-icons.js

# This creates public/icons/*.svg
# For PNG icons, use one of these methods:

# Method A — Online (easiest, no install needed):
#   1. Go to https://realfavicongenerator.net
#   2. Upload public/icons/icon-512.svg
#   3. Download the icon pack
#   4. Put all .png files into public/icons/

# Method B — Using sharp (Node.js):
npm install sharp
node convert-icons.js

# Method C — Using ImageMagick:
for size in 72 96 128 144 152 192 384 512; do
  convert public/icons/icon-512.svg -resize ${size}x${size} public/icons/icon-${size}.png
done
```

### Step 5 — Build
```bash
npm run build
# Creates: build/ folder (ready to deploy)
```

### Step 6 — Deploy

#### Option A: Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod

# ✅ Live at: https://neoterm-yourname.vercel.app
```

#### Option B: Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=build

# ✅ Live at: https://neoterm-xxx.netlify.app
```

#### Option C: GitHub Pages
```bash
npm install gh-pages
# Add to package.json scripts:
# "predeploy": "npm run build",
# "deploy": "gh-pages -d build"

npm run deploy

# ✅ Live at: https://yourusername.github.io/neoterm-pwa
```

#### Option D: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Public dir: build
# Single-page app: yes
firebase deploy

# ✅ Live at: https://neoterm-xxx.web.app
```

---

## 📱 Install on Android

Once deployed to a real HTTPS URL:

```
1. Open Google Chrome on your Android phone

2. Navigate to your URL:
   https://neoterm-yourname.vercel.app

3. Wait for full page load

4. You will see one of these:
   a) A banner at bottom: "Add NeoTerm to Home Screen" → tap Install
   b) Chrome menu (⋮) → "Add to Home Screen" → Add

5. NeoTerm icon appears on your home screen!

6. Tap the icon:
   ✅ Opens fullscreen (no browser bar)
   ✅ Works like a native app
   ✅ Works offline (most features)
```

---

## 🍎 Install on iOS (Safari)

```
1. Open Safari on iPhone/iPad (must be Safari, not Chrome)

2. Go to your URL

3. Tap the Share button (square with arrow)

4. Scroll down → tap "Add to Home Screen"

5. Tap "Add"

6. NeoTerm appears on home screen!
```

---

## 🔧 PWA Features Included

| Feature | Status | How |
|---|---|---|
| Installable | ✅ | manifest.json + HTTPS |
| Works offline | ✅ | Service Worker cache |
| Background sync | ✅ | SW sync event |
| Push notifications | ✅ | SW push event |
| Home screen icon | ✅ | 8 icon sizes |
| App shortcuts | ✅ | manifest shortcuts |
| Full screen | ✅ | display: standalone |
| Splash screen | ✅ | theme_color + icons |
| Auto-update | ✅ | SW skipWaiting |
| Secure (HTTPS) | ✅ | Required by PWA spec |

---

## 🔑 Environment Variables

Create `.env` in project root:
```bash
# Anthropic API (for AI assistant)
REACT_APP_ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx

# Optional: Analytics
REACT_APP_GA_ID=G-XXXXXXXXXX
```

> ⚠️ Never commit .env to Git!
> Add `.env` to your `.gitignore`

---

## 🚀 Auto-Deploy on Git Push

### Vercel (automatic)
```bash
# 1. Push code to GitHub
git init && git add . && git commit -m "init"
gh repo create neoterm-pwa --public --push

# 2. Connect Vercel to GitHub:
#    vercel.com → New Project → Import from GitHub
#    → Select neoterm-pwa → Deploy

# Now every git push auto-deploys! ✅
```

### Netlify (automatic)
```bash
# 1. Push to GitHub (same as above)
# 2. netlify.com → New site from Git → GitHub
# 3. Select repo → Build: npm run build → Publish: build/
# 4. Deploy! ✅
```

---

## 🔍 Test Your PWA

```bash
# Local testing with HTTPS (required for SW)
npm install -g serve
serve -s build -p 3000
# Open: http://localhost:3000

# Check PWA score in Chrome:
# 1. Open your URL in Chrome desktop
# 2. F12 → Lighthouse tab
# 3. Check "Progressive Web App"
# 4. Generate report
# Target: 100/100 PWA score ✅

# Check Service Worker:
# F12 → Application → Service Workers → Check "Status: activated"

# Check Manifest:
# F12 → Application → Manifest → All fields green ✅

# Simulate offline:
# F12 → Network tab → Check "Offline" → Reload page
# Should show offline.html ✅
```

---

## 📊 Performance Tips

```bash
# 1. Enable gzip compression (Vercel/Netlify do this automatically)

# 2. Preload critical fonts in index.html (already included)

# 3. Lazy load heavy components:
const Editor = React.lazy(() => import('./Editor'));

# 4. Use React.memo for terminal lines:
const TermLine = React.memo(({ line }) => <div>{line.text}</div>);

# 5. Virtualize long terminal output (for 10,000+ lines):
npm install react-window
```

---

## 🆘 Troubleshooting

| Problem | Fix |
|---|---|
| "Add to Home Screen" not showing | Must be HTTPS + valid manifest |
| SW not registering | Check sw.js is in /public not /src |
| Icons not showing | Verify paths match manifest.json |
| Offline not working | Check SW is "activated" in DevTools |
| App not updating | Bump cache version in sw.js |
| iOS install not working | Must use Safari, not Chrome |
| Blank screen on install | Check console for JS errors |

---

## 💡 Upgrade Ideas

```bash
# Add real terminal backend (WebSocket):
npm install xterm xterm-addon-fit
# Connect to: https://github.com/tsl0922/ttyd

# Add real SSH in browser:
npm install ssh2
# Run as backend proxy

# Add real file sync:
npm install firebase
# Sync files to Firestore

# Add biometric auth:
navigator.credentials.get({ publicKey: {...} })
```
