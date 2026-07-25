# 🎬 MediaMorph — HEIC, HEVC, Video & Audio Converter

MediaMorph is a full-stack web application designed for seamless high-performance conversion of images, videos, and audio files. Convert Apple HEIC/HEVC photos, high-resolution videos, and audio files to widely compatible formats with a sleek obsidian-gold user interface.

---

## ✨ Features

- 📸 **Image Conversion**: HEIC, JPEG, PNG, WEBP, AVIF, TIFF, BMP, SVG
- 🎥 **Video Conversion**: MP4, AVI, MKV, MOV, WEBM, animated GIF
- 🎵 **Audio Extraction & Conversion**: Extract audio from videos or convert audio between MP3, WAV, FLAC, OGG, AAC
- 📦 **Batch Operations & Downloads**: Convert multiple files simultaneously and download all converted media in a single structured ZIP file
- 🎨 **Obsidian Luxury Design**: Modern dark mode UI with interactive file dropzone, live conversion status, progress bars, and batch naming controls

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS, Framer Motion, Lucide Icons, Axios
- **Backend**: Node.js, Express 5, Multer, `heic-convert`, `sharp`, `fluent-ffmpeg`, `@ffmpeg-installer/ffmpeg`, `archiver`

---

## 📋 Prerequisites

Before running MediaMorph, ensure you have installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

---

## 🚀 How to Start the Server

You can launch the MediaMorph application using any of the following methods:

### Method 1: One-Click Windows Launcher (Recommended for Windows)

Simply double-click `start.bat` or run the following command in command prompt / terminal:

```cmd
start.bat
```

This will automatically open two separate terminal windows:
1. Backend Express server running at `http://localhost:5000`
2. Frontend Vite dev server running at `http://localhost:5173`

---

### Method 2: NPM Scripts (from root directory)

#### 1. Start the Backend Server:
```bash
npm run start:backend
```
*(Backend runs on `http://localhost:5000`)*

#### 2. Start the Frontend Dev Server (in a second terminal):
```bash
npm run start:frontend
```
*(Frontend runs on `http://localhost:5173`)*

---

### Method 3: Manual Start (Step-by-Step)

#### Step 1: Install Dependencies (First Time Only)

**Backend Dependencies:**
```bash
cd backend
npm install
```

**Frontend Dependencies:**
```bash
cd ../frontend
npm install
```

#### Step 2: Launch Backend
```bash
cd backend
node server.js
```

#### Step 3: Launch Frontend (New Terminal Window)
```bash
cd frontend
npm run dev
```

Once both servers are running, open your web browser and navigate to:
👉 **`http://localhost:5173`**

---

## 📁 Project Structure

```
Media_Morph/
├── backend/                  # Express.js API (Port 5000)
│   ├── server.js             # API entry point & CORS configuration
│   ├── routes/
│   │   ├── upload.js         # File upload endpoint via Multer
│   │   ├── convert.js        # Processing queue & conversion logic
│   │   └── download.js       # Single & batch ZIP file delivery
│   └── utils/
│       ├── heic-helper.js    # HEIC image conversion using heic-convert & sharp
│       └── ffmpeg-helper.js  # Video/Audio processing via fluent-ffmpeg
├── frontend/                 # React + Vite Application (Port 5173)
│   ├── src/
│   │   ├── App.jsx           # Main App component & state management
│   │   ├── api.js            # Axios client setup
│   │   └── components/       # UI components (UploadBox, FileList, FormatSelector, etc.)
│   └── index.html            # Main HTML layout & Google Fonts integration
├── start.bat                 # One-click launcher for Windows
├── package.json              # Root package metadata & helper scripts
└── README.md                 # Project documentation
```

---

## 📡 API Reference

- `POST /api/upload`: Upload single or multiple media files
- `POST /api/convert`: Queue media files for conversion specifying target format
- `GET /api/convert/status/:jobId`: Check real-time conversion job status & progress
- `GET /api/download/:fileId`: Download single converted file
- `POST /api/download/batch`: Generate and download ZIP file containing all selected converted files

---

## 📄 License

This project is licensed under the ISC License.
