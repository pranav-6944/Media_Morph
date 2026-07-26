# AI_NOTES.md — MediaMorph Project Context
_Last updated: 2026-07-20_

## Project Overview
- **Name**: MediaMorph (HEIC/HEVC Image & Video Converter)
- **Type**: Full-stack web app — React (Vite) frontend + Express.js backend
- **Purpose**: Upload HEIC/HEVC/MOV/MP4 files, convert them to JPG/PNG/WEBP (images) or MP4/AVI (videos), and download individually or as a ZIP batch.

---

## Project Structure
```
Root/
├── backend/               # Express.js API (port 5000)
│   ├── server.js          # Entry point, sets up CORS, routes, uploads/converted dirs
│   ├── routes/
│   │   ├── upload.js      # Multer upload handler → saves to /uploads/<uuid>
│   │   ├── convert.js     # Job queue + status polling (in-memory Map)
│   │   └── download.js    # Single-file + batch ZIP download
│   └── utils/
│       ├── heic-helper.js # heic-convert + optional sharp for WEBP
│       └── ffmpeg-helper.js # fluent-ffmpeg (libx264 codec for mp4)
├── frontend/              # Vite + React 19 (port 5173)
│   └── src/
│       ├── App.jsx        # Main state machine: upload → convert → poll → download
│       ├── api.js         # Axios API client (base: http://localhost:5000/api)
│       └── components/
│           ├── UploadBox.jsx     # Dropzone + folder select + file input
│           ├── FileList.jsx      # Per-file status row with motion animations
│           └── FormatSelector.jsx # Target format dropdown per file
├── start.bat              # Launches backend (node server.js) + frontend (npm run dev)
└── AI_NOTES.md            # This file
```

---

## Key Technical Details

### Backend
- **Port**: 5000
- **Job Queue**: In-memory `Map` (conversionJobs) + simple sequential jobQueue array. No Redis/BullMQ.
- **Image conversion**: `heic-convert@2.1.0` → JPEG/PNG; `sharp@0.34.5` for WEBP
- **Video conversion**: `fluent-ffmpeg` + `@ffmpeg-installer/ffmpeg` → libx264 for MP4
- **Upload dir**: `backend/uploads/` (uuid-named files from multer)
- **Output dir**: `backend/converted/` (`<timestamp>-<baseName>.<ext>`)
- **Batch download**: `archiver` library → ZIP stream

### Frontend
- **Framework**: Vite 8 + React 19 + TailwindCSS 3
- **Key deps**: framer-motion (animations), react-dropzone, lucide-react, axios
- **State flow**: files[] array in App.jsx tracks per-file: `id, file, status (idle→uploading→processing→completed/failed), progress, targetFormat, fileId, jobId, outFileName, cleanName`
- **Polling**: `setInterval` every 2000ms on `/api/convert/status/:jobId`
- **Batch rename**: `batchPrefix` state → names output as `${prefix}_001.ext`

### Key Line Numbers
- `App.jsx:13` — handleFilesSelected (file filtering + initial state)
- `App.jsx:44` — handleConvertAll (batch upload trigger)
- `App.jsx:77` — startJob (POST to /api/convert)
- `App.jsx:96` — pollJobStatus (2s interval polling)
- `App.jsx:131` — handleDownloadAll (ZIP batch)
- `convert.js:10` — conversionJobs Map
- `convert.js:67` — processFile (image vs video branch)
- `heic-helper.js:10` — convertHeic function
- `ffmpeg-helper.js:7` — convertVideo function

## Render Deployment Context
- `render.yaml`: Multi-service configuration for Render Blueprint (`mediamorph-backend` web service with `runtime: node`, `mediamorph-frontend` web service with `runtime: static`).
- `unknown type "static"` fix: Render blueprints require `type: web` with `runtime: static` for static sites.
- `fromService.property` fix: Used `property: host` with `prefix: https://` and `suffix: /api`.
- `VITE_API_URL`: Points frontend API client to backend URL (`https://<backend-url>/api`)
- FFmpeg/Sharp: Compatible with Render Linux x64 environment via `@ffmpeg-installer/ffmpeg` & `sharp` prebuilt binaries.

## Render & Mobile Bugfixes (2026-07-26)
- **Analytics Dashboard**: Added safe null/undefined guards in `Analytics.jsx` & `stats.js` so missing/empty stats don't crash React to a black screen.
- **Upload Mapping Fix**: `upload.js` wrapped in multer error callback (max 50 files). `App.jsx` matches uploaded files by `originalName` first to prevent `Upload mapping failed`.
- **Default Light Theme**: Light mode (#F5F2EE) set as default first. Dark mode togglable via `data-theme="dark"`.
- **Hamburger Menu Theme Switcher**: Placed Dark/Light Mode toggle inside `Navbar.jsx` mobile menu.
- **Compact Mobile Footer**: Refactored `Footer` links grid into a 2-column list per category on mobile screens, reducing vertical scroll height by ~75% while keeping all 36 links.

---

## Current Status (as of 2026-07-26)
- **Core functionality**: ✅ Working — upload, convert, download all implemented
- **Missing**: No AI_NOTES.md existed before this session

## Identified Gaps / Potential Next Features
1. **No cleanup**: `uploads/` and `converted/` dirs grow indefinitely — need periodic purge
2. **No file size limit enforcement in UI**: multer may have limits;# AI Notes — MediaMorph

## Luxury Redesign (2026-07-20)
- **Design system**: Obsidian bg (#09080F), Champagne Gold (#C09A5F), Warm Cream (#EAE0CE)
- **Fonts**: Playfair Display (h1/h2/h3) + DM Sans (body/UI)
- **Key CSS classes**: `.card`, `.card-hero`, `.btn-gold`, `.btn-outline`, `.feat-card`, `.upload-zone`, `.file-row`, `.fmt-select`, `.dl-btn`, `.lux-input`
- **Shadow system**: `--sh-sm/md/lg` — warm obsidian multi-layer shadows with gold inset highlight
- **Sections**: Navbar (Navbar.jsx) → Hero+Converter → Features → HowItWorks → FormatsGrid → Footer (all in App.jsx)
- **Components**: Navbar.jsx (L1-80), UploadBox.jsx (L1-75), FileList.jsx (L1-110), FormatSelector.jsx (L1-45)
- **All conversion logic intact** in App.jsx: handleConvertAll, startJob, pollStatus, downloadFile, handleDownloadAll
- **Deleted**: App.css (legacy)n't warn users
3. **No progress for images**: HEIC image conversion shows 0% until complete (no progress callback in heic-convert)
4. **In-memory job store**: Server restart loses all job data — no persistence
5. **No error detail surfaced to user**: Failed jobs just show "Failed" with no message
6. **No concurrent conversion**: Queue is sequential (one at a time)
7. **react-router-dom installed but unused**: No routing/pages implemented yet
8. **FormatSelector.jsx**: Not fully analyzed yet — check what formats it exposes
9. **HEVC support**: `file.type.includes('video')` detection — HEVC files may have no MIME type
10. **No file deduplication**: Same file can be added multiple times

---

## Possible Next Working Areas
- Add settings page (quality slider, concurrent job count)
- Add conversion history / recent files panel
- Add image preview thumbnails in FileList
- Add cleanup cron for uploads/converted dirs
- Add proper error messages from backend to frontend
- Add multi-page routing (Home, History, Settings) using react-router-dom
- Package as Electron desktop app

## Conversion Expansion Plan (2026-07-20)
- See full plan: `brain/571e0c99.../conversion_plan.md`

### Phase 1 — Zero New Installs (sharp + ffmpeg already present)
- Accept JPG/PNG/BMP/SVG as inputs (not just HEIC)
- Image → AVIF, TIFF (sharp)
- Video → MKV, MOV, WEBM (ffmpeg)
- Video → GIF (ffmpeg palette filter)
- Video → MP3/WAV (ffmpeg noVideo())
- Video compress mode

### Phase 2 — PDF Support
- Images → PDF: `npm install pdfkit`
- PDF → JPG per page: `npm install pdf-poppler`

### Phase 3 — Advanced
- Video resolution scaling (720p/1080p presets)
- Multiple images → animated GIF
- Full audio pipeline (MP3↔WAV↔FLAC)

### Key Architecture Change (convert.js)
- Replace two-branch format check with 4 arrays:
  IMAGE_FORMATS, VIDEO_FORMATS, AUDIO_FORMATS, DOCUMENT_FORMATS
- New helpers: image-helper.js, audio-helper.js, pdf-helper.js

### Frontend Changes Needed
- App.jsx:13 — detect 3 types: isImage, isVideo, isAudio
- FormatSelector.jsx — add isAudio prop, audio format options
- UploadBox.jsx — expand accept types to include audio/image extensions
- FileList.jsx — add 3rd badge style (orange) for audio files

Backend (node server.js) is running on http://localhost:5000
Frontend (npm run dev) is running on http://localhost:5173
You can now open your browser to http://localhost:5173 and test out the full conversion suite (images, videos, and audio).

---

## Server Start & Repository Updates (2026-07-25)
- **Root README.md**: Created root `README.md` detailing features, tech stack, prerequisites, API reference, and 3 server start options (Windows start.bat, npm scripts, manual step-by-step).
- **Root package.json**: Added `start:backend`, `start:frontend`, and `start` npm scripts.
- **GitHub Sync**: Committed changes and pushed to remote `origin/main` (https://github.com/pranav-6944/Media_Morph.git).

---

## Bug Fix: "Input file is missing" Error (2026-07-25)
- **Root Cause & Stuck in Processing Fix**: In `App.jsx`, `jobsToStart.push(...)` was initially placed inside `setFiles(prev => ...)` callback. Because React 18/19 schedules state updater callbacks asynchronously, `jobsToStart` remained an empty array (`[]`) when the subsequent synchronous `for (const job of jobsToStart)` loop executed. `startJob` was never called, leaving the UI state stuck in `status: 'processing'`.
- **Fix in `App.jsx`**: Refactored `handleConvertAll` to build `jobsToStart` and state updates synchronously directly from `idle` and `res.data.files` in the main call stack before dispatching `setFiles` and `startJob`.
- **Fix in `backend/routes/convert.js`**: Added a duplicate queue guard (`jobQueue.some(j => j.inputPath === inputPath)`) to reject any duplicate conversion requests for the same input file with an HTTP 400.

---

## Render.com Deployment Setup (2026-07-25)
- **Blueprint `render.yaml`**: Added root `render.yaml` configuring backend Node Web Service (`mediamorph-backend`) and frontend Static Site (`mediamorph-frontend`).
- **Environment Variables**: Dynamically maps `VITE_API_URL` from backend hostpath suffix `/api`.
- **Render FFmpeg & Sharp**: `@ffmpeg-installer/ffmpeg` & `sharp` auto-install Linux binaries during `npm install` on Render build step.