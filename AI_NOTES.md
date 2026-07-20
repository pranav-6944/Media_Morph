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

---

## Current Status (as of 2026-07-20)
- **Core functionality**: ✅ Working — upload, convert, download all implemented
- **Missing**: No AI_NOTES.md existed before this session

## Identified Gaps / Potential Next Features
1. **No cleanup**: `uploads/` and `converted/` dirs grow indefinitely — need periodic purge
2. **No file size limit enforcement in UI**: multer may have limits; UI doesn't warn users
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
