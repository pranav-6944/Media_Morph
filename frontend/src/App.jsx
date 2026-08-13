import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, ShieldCheck, FolderArchive, ArrowRight,
  FileImage, Layers, Clock, Globe
} from 'lucide-react';
import Navbar from './components/Navbar';
import UploadBox from './components/UploadBox';
import FileList from './components/FileList';
import { uploadFiles, startConversion, checkJobStatus, downloadFileUrl, downloadBatch, deleteFile, API_URL } from './api';
import { Routes, Route, Link } from 'react-router-dom';
import Analytics from './pages/Analytics';
import Legal from './pages/Legal';
import CookieConsent from './components/CookieConsent';

/* ══════════════════════════════════════════════════════════════ */
/*  Static sections                                               */
/* ══════════════════════════════════════════════════════════════ */

const FEATURES = [
  {
    Icon: Zap,
    title: 'Instant Conversion',
    desc: 'Server-side processing with FFmpeg and Sharp. No queues, no delays. Your files are converted the moment you submit.',
  },
  {
    Icon: ShieldCheck,
    title: 'Zero Cloud, Full Privacy',
    desc: 'Everything runs on your machine. Your files never leave your server. No analytics, no tracking, no data retention.',
  },
  {
    Icon: Globe,
    title: '18+ Output Formats',
    desc: 'From legacy BMP to cutting-edge AVIF. Convert images, video, and audio in one unified batch operation.',
  },
];

const HOW_STEPS = [
  { n: '01', title: 'Drop your files', desc: 'Drag & drop files or entire folders. Mix images, videos, and audio in one batch.' },
  { n: '02', title: 'Choose format',   desc: 'Select the output format per file — or apply one format across the whole batch.' },
  { n: '03', title: 'Convert & save',  desc: 'Hit Convert, watch real-time progress, then download individually or as a ZIP.' },
];

const FORMAT_SECTIONS = [
  {
    label: 'Image Input',
    color: 'var(--gold)',
    formats: ['HEIC', 'JPG', 'JPEG', 'PNG', 'WEBP', 'AVIF', 'TIFF', 'BMP', 'GIF', 'SVG'],
  },
  {
    label: 'Image Output',
    color: 'var(--gold)',
    formats: ['JPG', 'PNG', 'WEBP', 'AVIF', 'TIFF', 'GIF', 'BMP'],
  },
  {
    label: 'Video Input',
    color: '#8A9ECC',
    formats: ['HEVC', 'H.265', 'MP4', 'MOV', 'AVI', 'MKV', 'WEBM', 'FLV'],
  },
  {
    label: 'Video Output',
    color: '#8A9ECC',
    formats: ['MP4', 'MOV', 'MKV', 'WEBM', 'AVI', 'GIF'],
  },
  {
    label: 'Audio Input',
    color: '#C08080',
    formats: ['MP3', 'WAV', 'AAC', 'OGG', 'FLAC', 'M4A'],
  },
  {
    label: 'Audio Output',
    color: '#C08080',
    formats: ['MP3', 'WAV', 'AAC', 'OGG', 'FLAC'],
  },
];

const FOOTER_LINKS = {
  'Image Conversions': [
    'HEIC to JPG', 'HEIC to PNG', 'HEIC to WEBP', 'HEIC to AVIF',
    'PNG to JPG', 'JPG to WEBP', 'WEBP to PNG', 'JPG to AVIF',
    'PNG to WEBP', 'TIFF to JPG', 'BMP to PNG', 'GIF to WEBP',
  ],
  'Video Conversions': [
    'HEVC to MP4', 'MOV to MP4', 'AVI to MP4', 'MKV to MP4',
    'MP4 to WEBM', 'FLV to MP4', 'WEBM to MP4', 'MP4 to GIF',
    'MOV to MKV', 'MP4 to MOV', 'AVI to MKV', 'HEVC to WEBM',
  ],
  'Audio Conversions': [
    'MP3 to WAV', 'WAV to MP3', 'AAC to MP3', 'FLAC to MP3',
    'OGG to MP3', 'M4A to MP3', 'WAV to FLAC', 'MP3 to OGG',
    'AAC to WAV', 'FLAC to WAV', 'M4A to AAC', 'OGG to WAV',
  ],
};

/* ══════════════════════════════════════════════════════════════ */
function FeaturesSection() {
  return (
    <section id="features" className="py-28 max-w-6xl mx-auto px-6">
      <div className="text-center mb-16">
        <span className="section-label">Why MediaMorph</span>
        <div className="gold-rule mt-4 mb-6 max-w-xs mx-auto" />
        <h2 className="display-lg text-3xl sm:text-4xl cream-text">
          Built for professionals.<br />
          <span className="gold-text">Free for everyone.</span>
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .55, delay: i * .1 }}
            className="feat-card"
          >
            <div className="feat-icon">
              <f.Icon className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <h3 className="display-sm text-lg cream-text mb-3">{f.title}</h3>
            <p className="text-sm leading-relaxed muted-text">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HowSection() {
  return (
    <section id="how" className="py-24" style={{ background: 'var(--bg-1)' }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="section-label">How It Works</span>
          <div className="gold-rule mt-4 mb-6 max-w-xs mx-auto" />
          <h2 className="display-lg text-3xl sm:text-4xl cream-text">Three steps. That's it.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {HOW_STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: .55, delay: i * .12 }}
              className="flex flex-col items-center text-center"
            >
              <div className="section-number mb-6">{s.n}</div>
              {i < HOW_STEPS.length - 1 && (
                <div className="hidden md:block absolute" />
              )}
              <h3 className="display-sm text-lg cream-text mb-3">{s.title}</h3>
              <p className="text-sm leading-relaxed muted-text">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FormatsSection() {
  return (
    <section id="formats" className="py-28 max-w-6xl mx-auto px-6">
      <div className="text-center mb-16">
        <span className="section-label">Supported Formats</span>
        <div className="gold-rule mt-4 mb-6 max-w-xs mx-auto" />
        <h2 className="display-lg text-3xl sm:text-4xl cream-text">
          Every format. <span className="gold-text">Every category.</span>
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FORMAT_SECTIONS.map((cat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .5, delay: i * .07 }}
            className="card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ background: cat.color, boxShadow: `0 0 8px ${cat.color}` }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: cat.color }}>{cat.label}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {cat.formats.map(f => (
                <span key={f} className="fmt-item">{f}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Top */}
        <div className="flex flex-col md:flex-row gap-12 mb-16">
          <div className="md:w-72 flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="icon-wrap icon-image" style={{ width: 36, height: 36 }}>
                <Layers className="w-4 h-4" strokeWidth={2} />
              </div>
              <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 16, color: 'var(--cream)' }}>
                MediaMorph
              </span>
            </div>
            <p className="text-sm leading-relaxed muted-text mb-6">
              A professional-grade file converter that runs entirely on your local server. No cloud, no limits, no compromises.
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="tag tag-gold">Open Source</span>
              <span className="tag tag-muted">Self-hosted</span>
              <span className="tag tag-green">Free Forever</span>
            </div>
          </div>

          {/* Format links grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
            {Object.entries(FOOTER_LINKS).map(([cat, links]) => (
              <div key={cat}>
                <h4 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--gold)' }}>
                  {cat}
                </h4>
                <ul className="grid grid-cols-2 sm:grid-cols-1 gap-x-3 gap-y-1.5">
                  {links.map(link => (
                    <li key={link}>
                      <a href="/#converter" className="footer-link block text-xs">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="gold-rule mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs muted-text">
          <span>© 2025 MediaMorph. All conversions run locally on your server.</span>
          <div className="flex gap-4">
            <Link to="/legal" className="hover:text-white transition-colors">Privacy & Terms</Link>
            <Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/*  Main Home Page                                                */
/* ══════════════════════════════════════════════════════════════ */
function Home() {
  const [files,          setFiles]          = useState([]);
  const [downloadingMap, setDownloadingMap] = useState({});
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [batchPrefix,    setBatchPrefix]    = useState('');

  React.useEffect(() => {
    const handleBeforeUnload = () => {
      const jobIds = files.filter(f => f.jobId).map(f => f.jobId);
      if (jobIds.length > 0) {
        navigator.sendBeacon(`${API_URL}/convert/cleanup`, new Blob([JSON.stringify({ jobIds })], { type: 'application/json' }));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [files]);

  const handleFilesSelected = (accepted) => {
    const AUDIO = /\.(mp3|wav|aac|ogg|flac|m4a)$/i;
    const VIDEO = /\.(hevc|h265|mp4|mov|avi|mkv|webm|flv)$/i;
    const newFiles = accepted.map(file => {
      const n = file.name.toLowerCase();
      const isAudio = AUDIO.test(n) || file.type.startsWith('audio/');
      const isVideo = !isAudio && (VIDEO.test(n) || file.type.startsWith('video/'));
      const fileType = isAudio ? 'audio' : isVideo ? 'video' : 'image';
      return {
        id: crypto.randomUUID(), file, fileType, status: 'idle', progress: 0,
        targetFormat: isAudio ? 'mp3' : isVideo ? 'mp4' : 'jpg',
        fileId: null, jobId: null, outFileName: null, cleanName: null, errorMsg: null,
      };
    });
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleFormatChange = (id, fmt) =>
    setFiles(prev => prev.map(f => f.id === id ? { ...f, targetFormat: fmt, status: 'idle', fileId: null, jobId: null, errorMsg: null } : f));

  const handleRemove = async (id) => {
    const file = files.find(f => f.id === id);
    if (file && file.jobId && file.status === 'completed') {
      try { await deleteFile(file.jobId); } catch (e) { console.error('Failed to delete', e); }
    }
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleConvertAll = async () => {
    const idle = files.filter(f => f.status === 'idle');
    if (!idle.length) return;

    const fd = new FormData();
    let appendedCount = 0;
    idle.forEach(f => {
      const fileBlob = f.file || f.rawFile;
      if (fileBlob && (fileBlob instanceof File || fileBlob instanceof Blob)) {
        fd.append('files', fileBlob, f.file?.name || fileBlob.name || 'upload.bin');
        appendedCount++;
      }
    });

    if (appendedCount === 0) {
      alert('Selected file reference was lost. Please re-select your file.');
      return;
    }

    try {
      // 1. Mark files as uploading
      setFiles(prev => prev.map(f => idle.some(x => x.id === f.id) ? { ...f, status: 'uploading', progress: 0 } : f));

      // 2. Upload files to backend
      const res = await uploadFiles(fd, pe => {
        const pct = Math.round((pe.loaded * 100) / pe.total);
        setFiles(prev => prev.map(f => idle.some(x => x.id === f.id) ? { ...f, progress: pct } : f));
      });

      let resData = res?.data;
      if (typeof resData === 'string') {
        try { resData = JSON.parse(resData); } catch (e) {}
      }

      console.log('[MediaMorph] Raw Upload Response:', resData);

      // Multi-format normalization: handle Array, { files: [] }, { uploadedFiles: [] }, { data: [] }, or single Object
      const uploadedFiles = Array.isArray(resData) 
        ? resData 
        : (Array.isArray(resData?.files) 
            ? resData.files 
            : (Array.isArray(resData?.uploadedFiles)
                ? resData.uploadedFiles
                : (Array.isArray(resData?.data) 
                    ? resData.data 
                    : (resData?.id || resData?.filename ? [resData] : []))));

      if (!resData || !Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
        const serverError = resData?.error 
                         || (typeof resData === 'string' ? resData.slice(0, 100) : null) 
                         || 'Upload failed: Server did not return file data';
        throw new Error(serverError);
      }

      const jobsToStart = [];
      const updatedMap = new Map();
      let cnt = 1;

      // 3. Build jobs & state updates synchronously in current call stack
      idle.forEach((f, idx) => {
        const targetClean = (f.file.name || '').trim().toLowerCase();
        
        // Flexible lookup: match by originalName, clean string match, index fallback, or single file fallback
        const up = uploadedFiles.find(u => u && u.originalName && u.originalName.trim().toLowerCase() === targetClean)
                || uploadedFiles[idx]
                || (uploadedFiles.length === 1 ? uploadedFiles[0] : null);

        const backendFileId = up?.id || up?.filename;

        if (up && backendFileId) {
          const base = batchPrefix.trim()
            ? `${batchPrefix.trim()}_${String(cnt++).padStart(3, '0')}`
            : f.file.name.replace(/\.[^.]+$/, '');

          jobsToStart.push({
            localId: f.id,
            backendId: backendFileId,
            origName: f.file.name,
            format: f.targetFormat,
            base: base
          });

          updatedMap.set(f.id, {
            status: 'processing',
            progress: 0,
            fileId: backendFileId,
            startTime: Date.now()
          });
        } else {
          updatedMap.set(f.id, {
            status: 'failed',
            errorMsg: 'File processing error — please try re-adding file'
          });
        }
      });

      // 4. Update React state with calculated updates
      setFiles(prev => prev.map(f => {
        const update = updatedMap.get(f.id);
        return update ? { ...f, ...update } : f;
      }));

      // 5. Trigger startJob for each uploaded file cleanly
      for (const job of jobsToStart) {
        startJob(job.localId, job.backendId, job.origName, job.format, job.base);
      }

    } catch (err) {
      console.error('Upload Error:', err);
      const status = err?.response?.status;
      const respData = err?.response?.data;
      const serverMsg = respData?.error 
                     || respData?.message
                     || (typeof respData === 'string' ? respData.slice(0, 120) : null)
                     || err?.message 
                     || 'Upload failed';

      const fullErr = status ? `[HTTP ${status}] ${serverMsg}` : serverMsg;
      setFiles(prev => prev.map(f => idle.some(x => x.id === f.id) ? { ...f, status: 'failed', progress: 0, errorMsg: fullErr } : f));
    }
  };

  const startJob = async (localId, backendId, origName, format, base) => {
    try {
      const res = await startConversion({
        fileId: backendId,
        outputFormat: format,
        originalName: origName,
        finalBaseName: base,
      });
      let resData = res?.data;
      if (typeof resData === 'string') {
        try { resData = JSON.parse(resData); } catch (e) {}
      }
      const jobId = resData?.jobId;
      const outFileName = resData?.outFileName;
      const cleanName = resData?.cleanName;

      if (!jobId) {
        throw new Error(resData?.error || 'Conversion request failed: No jobId returned');
      }

      setFiles(prev => prev.map(f => f.id === localId ? { ...f, jobId, outFileName, cleanName } : f));
      pollStatus(localId, jobId);
    } catch (err) {
      const status = err?.response?.status;
      const respData = err?.response?.data;
      const serverMsg = respData?.error 
                     || respData?.message
                     || (typeof respData === 'string' ? respData.slice(0, 120) : null)
                     || err?.message 
                     || 'Conversion request failed';
      const fullErr = status ? `[HTTP ${status}] ${serverMsg}` : serverMsg;
      console.error('[startJob] error:', fullErr, err);
      setFiles(prev => prev.map(f => f.id === localId ? { ...f, status: 'failed', errorMsg: fullErr } : f));
    }
  };

  const pollStatus = (localId, jobId) => {
    const iv = setInterval(async () => {
      try {
        const { data } = await checkJobStatus(jobId);
        setFiles(prev => prev.map(f => {
          if (f.id !== localId) return f;
          return {
            ...f,
            status: data.status,
            progress: data.status === 'completed' ? 100 : (data.progress || 0),
            errorMsg: data.error || null,
            endTime: (data.status === 'completed' && !f.endTime) ? Date.now() : f.endTime,
          };
        }));
        if (data.status === 'completed' || data.status === 'failed') clearInterval(iv);
      } catch (err) {
        clearInterval(iv);
        const msg = err?.message || 'Lost connection to server';
        setFiles(prev => prev.map(f => f.id === localId ? { ...f, status: 'failed', errorMsg: msg } : f));
      }
    }, 2000);
  };

  const downloadFile = async (filename, id) => {
    const f = files.find(x => x.id === id);
    setDownloadingMap(p => ({ ...p, [id]: true }));
    try {
      const a = document.createElement('a');
      a.href = downloadFileUrl(filename);
      a.setAttribute('download', f?.cleanName || filename);
      document.body.appendChild(a); a.click(); a.remove();
    } finally {
      setDownloadingMap(p => ({ ...p, [id]: false }));
    }
  };

  const handleDownloadAll = async () => {
    const done = files.filter(f => f.status === 'completed');
    if (!done.length) return;
    setDownloadingAll(true);
    try {
      const payload = done.map(f => ({ serverName: f.outFileName, cleanName: f.cleanName || f.outFileName }));
      const res = await downloadBatch(payload);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.setAttribute('download', 'MediaMorph_Batch.zip');
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { console.error(e); }
    finally { setDownloadingAll(false); }
  };

  const idleCount = files.filter(f => f.status === 'idle').length;
  const doneCount = files.filter(f => f.status === 'completed').length;

  React.useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const elem = document.getElementById(id);
      if (elem) {
        setTimeout(() => elem.scrollIntoView({ behavior: 'smooth' }), 150);
      }
    }
  }, []);

  /* ────────────────────────────────────────────────────────── */
  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Ambient orbs */}
      <div className="orb-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="grain" />

      {/* Navbar */}
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative z-10 pt-24 pb-20 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7 }}
          className="text-center mb-16"
        >
          <motion.div initial={{ scale: .9 }} animate={{ scale: 1 }} transition={{ delay: .1 }} className="inline-block mb-6">
            <span className="hero-label">
              <span className="live-dot" />
              Universal File Converter
            </span>
          </motion.div>

          <h1 className="display-xl text-5xl sm:text-6xl lg:text-7xl cream-text mb-6">
            Convert anything.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold)', WebkitTextStroke: 0 }}>Instantly.</em>
          </h1>

          <p className="text-base sm:text-lg leading-relaxed muted-text max-w-2xl mx-auto mb-10">
            Batch convert images, video, and audio with zero quality loss.
            Runs entirely on your server — private, fast, and free.
          </p>

          {/* Stat chips */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {[
              { n: '18+',   l: 'Output Formats' },
              { n: '500MB', l: 'Max File Size'  },
              { n: 'Batch', l: 'Processing'     },
              { n: '100%',  l: 'Private'        },
            ].map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="card-sm px-5 py-3 flex flex-col items-center"
                style={{ minWidth: 90 }}
              >
                <span className="font-bold text-lg gold-text" style={{ fontFamily: 'Playfair Display, serif' }}>{s.n}</span>
                <span className="text-xs muted-text mt-0.5">{s.l}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Converter tool ──────────────────────────────────── */}
        <div id="converter">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .35, duration: .6 }}
            className="card-hero p-8"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <span className="section-label block mb-1">Conversion Studio</span>
                <h2 className="display-sm text-xl cream-text">Upload & Convert</h2>
              </div>
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="flex gap-2 flex-wrap">
                    {doneCount > 0 && (
                      <button onClick={handleDownloadAll} disabled={downloadingAll} className="btn btn-success" style={{ fontSize: 13, padding: '10px 18px' }}>
                        <FolderArchive className="w-4 h-4" />
                        {downloadingAll ? 'Zipping…' : `Download All (${doneCount})`}
                      </button>
                    )}
                    {idleCount > 0 && (
                      <button onClick={handleConvertAll} className="btn btn-gold" style={{ fontSize: 13, padding: '10px 20px' }}>
                        <Zap className="w-4 h-4" />
                        Convert ({idleCount})
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="gold-rule mb-6" />

            {/* Upload zone */}
            <UploadBox onFilesSelected={handleFilesSelected} />

            {/* Batch rename */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                  className="mt-4"
                >
                  <div className="card-sm p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex-1">
                      <label className="section-label block mb-2">Batch Rename Prefix <span className="muted-text font-normal normal-case tracking-normal text-xs">(optional)</span></label>
                      <input type="text" placeholder="e.g. project_photo → project_photo_001.jpg"
                        value={batchPrefix} onChange={e => setBatchPrefix(e.target.value)}
                        className="lux-input" />
                    </div>
                    <div className="flex gap-2 flex-wrap flex-shrink-0">
                      <span className="tag tag-gold">{files.length} total</span>
                      {doneCount > 0 && <span className="tag tag-green">{doneCount} ready</span>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* File list */}
            <FileList
              files={files}
              onRemove={handleRemove}
              onFormatChange={handleFormatChange}
              onDownload={downloadFile}
              downloadingMap={downloadingMap}
            />

            {/* Bottom actions */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 flex justify-end gap-3 flex-wrap"
                >
                  {doneCount > 0 && (
                    <button onClick={handleDownloadAll} disabled={downloadingAll} className="btn btn-success" style={{ fontSize: 13, padding: '11px 22px' }}>
                      <FolderArchive className="w-4 h-4" />
                      {downloadingAll ? 'Zipping…' : `Download All ZIP (${doneCount})`}
                    </button>
                  )}
                  {idleCount > 0 && (
                    <button onClick={handleConvertAll} className="btn btn-gold" style={{ fontSize: 13, padding: '11px 24px' }}>
                      <Zap className="w-4 h-4" /> Convert Now ({idleCount}) <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── Other sections ─────────────────────────────────────── */}
      <div className="relative z-10">
        <FeaturesSection />
        <HowSection />
        <FormatsSection />
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <CookieConsent />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/legal" element={<Legal />} />
      </Routes>
    </>
  );
}
