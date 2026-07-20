import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { FolderArchive, Zap, Layers, ArrowRight } from 'lucide-react';
import UploadBox from './components/UploadBox';
import FileList from './components/FileList';
import { uploadFiles, startConversion, checkJobStatus, downloadFileUrl, downloadBatch } from './api';

/* ── Star field generator ─────────────────────────────────────────────────── */
function StarField({ count = 80 }) {
  const stars = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      dur: (Math.random() * 3 + 2).toFixed(1),
      delay: (Math.random() * 4).toFixed(1),
    }))
  ).current;

  return (
    <div className="star-field">
      {stars.map(s => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            '--dur': `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── 3D Rotating Logo Cube ────────────────────────────────────────────────── */
function LogoCube() {
  return (
    <div className="logo-3d-wrapper">
      <div className="logo-3d">
        <div className="logo-3d-face face-front">
          <Layers className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="logo-3d-face face-back" />
        <div className="logo-3d-face face-right" />
        <div className="logo-3d-face face-left" />
        <div className="logo-3d-face face-top" />
        <div className="logo-3d-face face-bottom" />
      </div>
    </div>
  );
}

/* ── Stat Card ────────────────────────────────────────────────────────────── */
function StatCard({ number, label }) {
  return (
    <div className="stat-card">
      <div className="stat-card-inner">
        <div className="stat-number">{number}</div>
        <div className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
function App() {
  const [files, setFiles] = useState([]);
  const [downloadingMap, setDownloadingMap]   = useState({});
  const [downloadingAll, setDownloadingAll]   = useState(false);
  const [batchPrefix, setBatchPrefix]         = useState('');
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 80], [1, 0.85]);

  /* ── File selection ─────────────────────────────────────────────────────── */
  const handleFilesSelected = (acceptedFiles) => {
    const AUDIO_EXTS = /\.(mp3|wav|aac|ogg|flac|m4a)$/i;
    const VIDEO_EXTS = /\.(hevc|h265|mp4|mov|avi|mkv|webm|flv)$/i;

    const newFiles = acceptedFiles.map(file => {
      const name     = file.name.toLowerCase();
      const isAudio  = AUDIO_EXTS.test(name) || file.type.startsWith('audio/');
      const isVideo  = !isAudio && (VIDEO_EXTS.test(name) || file.type.startsWith('video/'));
      const fileType = isAudio ? 'audio' : isVideo ? 'video' : 'image';
      return {
        id: crypto.randomUUID(),
        file,
        fileType,
        status: 'idle',
        progress: 0,
        targetFormat: isAudio ? 'mp3' : isVideo ? 'mp4' : 'jpg',
        fileId: null, jobId: null, outFileName: null, cleanName: null, errorMsg: null,
      };
    });
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleFormatChange = (id, targetFormat) =>
    setFiles(prev => prev.map(f => f.id === id ? { ...f, targetFormat } : f));

  const handleRemove = (id) =>
    setFiles(prev => prev.filter(f => f.id !== id));

  /* ── Convert all ────────────────────────────────────────────────────────── */
  const handleConvertAll = async () => {
    const idleFiles = files.filter(f => f.status === 'idle');
    if (idleFiles.length === 0) return;

    const formData = new FormData();
    idleFiles.forEach(f => formData.append('files', f.file));

    try {
      setFiles(prev => prev.map(f =>
        idleFiles.find(xf => xf.id === f.id) ? { ...f, status: 'uploading' } : f
      ));

      const response = await uploadFiles(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setFiles(prev => prev.map(f =>
          idleFiles.find(xf => xf.id === f.id) ? { ...f, progress: percent } : f
        ));
      });

      const uploadedFiles = response.data.files;
      let counter = 1;
      setFiles(prev => prev.map(f => {
        const upFile = uploadedFiles.find(uf => uf.originalName === f.file.name);
        if (upFile && f.status === 'uploading') {
          const finalBaseName = batchPrefix.trim()
            ? `${batchPrefix.trim()}_${String(counter++).padStart(3, '0')}`
            : f.file.name.split('.')[0];
          startJob(f.id, upFile.id, f.file.name, f.targetFormat, finalBaseName);
          return { ...f, status: 'processing', progress: 0, fileId: upFile.id };
        }
        return f;
      }));
    } catch (error) {
      console.error('Upload failed', error);
      setFiles(prev => prev.map(f =>
        idleFiles.find(xf => xf.id === f.id) ? { ...f, status: 'failed', progress: 0 } : f
      ));
    }
  };

  const startJob = async (localFileId, backendFileId, originalName, targetFormat, finalBaseName) => {
    try {
      const res = await startConversion({ fileId: backendFileId, inputFormat: originalName.split('.').pop(), outputFormat: targetFormat, originalName, finalBaseName });
      const { jobId, outFileName, cleanName } = res.data;
      setFiles(prev => prev.map(f => f.id === localFileId ? { ...f, jobId, outFileName, cleanName } : f));
      pollJobStatus(localFileId, jobId);
    } catch {
      setFiles(prev => prev.map(f => f.id === localFileId ? { ...f, status: 'failed' } : f));
    }
  };

  const pollJobStatus = (localFileId, jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await checkJobStatus(jobId);
        const { status, progress, error: errMsg } = res.data;
        setFiles(prev => prev.map(f => {
          if (f.id !== localFileId) return f;
          return { ...f, status, progress: status === 'completed' ? 100 : (progress || 0), errorMsg: errMsg || null };
        }));
        if (status === 'completed' || status === 'failed') clearInterval(interval);
      } catch {
        clearInterval(interval);
        setFiles(prev => prev.map(f =>
          f.id === localFileId ? { ...f, status: 'failed', errorMsg: 'Connection lost' } : f
        ));
      }
    }, 2000);
  };

  const downloadFile = async (filename, id) => {
    const f = files.find(x => x.id === id);
    setDownloadingMap(p => ({ ...p, [id]: true }));
    try {
      const url  = downloadFileUrl(filename);
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', f?.cleanName || filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } finally {
      setDownloadingMap(p => ({ ...p, [id]: false }));
    }
  };

  const handleDownloadAll = async () => {
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length === 0) return;
    setDownloadingAll(true);
    try {
      const payload  = completedFiles.map(f => ({ serverName: f.outFileName, cleanName: f.cleanName || f.outFileName }));
      const response = await downloadBatch(payload);
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', 'MediaMorph_Batch.zip');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (e) {
      console.error('Batch download failed', e);
    } finally {
      setDownloadingAll(false);
    }
  };

  const idleCount      = files.filter(f => f.status === 'idle').length;
  const completedCount = files.filter(f => f.status === 'completed').length;
  const processingCount = files.filter(f => f.status === 'processing' || f.status === 'uploading').length;

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div className="relative min-h-screen" style={{ background: 'var(--bg-void)' }}>

      {/* ── 3D Background Scene ───────────────────────────────────────────── */}
      <div className="bg-scene">
        <StarField count={100} />
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
        <div className="grid-floor" />
      </div>

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <motion.nav
        style={{ opacity: headerOpacity }}
        className="relative z-50 px-6 py-4"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoCube />
            <div>
              <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}>
                MediaMorph
              </span>
              <div className="text-xs" style={{ color: 'var(--text-dim)' }}>Universal Converter</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              All servers online
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pb-32">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center pt-10 pb-14"
        >
          {/* Floating decorative orbs */}
          <div className="float-anim" style={{ position: 'absolute', left: '8%', top: '12%', width: 60, height: 60, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.3), transparent)', filter: 'blur(10px)', pointerEvents: 'none' }} />
          <div className="float-anim-delay" style={{ position: 'absolute', right: '10%', top: '20%', width: 40, height: 40, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.3), transparent)', filter: 'blur(8px)', pointerEvents: 'none' }} />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-block mb-6"
          >
            <span className="hero-badge">
              <Zap className="w-3 h-3" />
              Phase 1 — 18+ Formats
            </span>
          </motion.div>

          <motion.h1
            className="hero-title text-5xl sm:text-6xl lg:text-7xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Convert<br />
            <span style={{ color: '#fff', WebkitTextFillColor: 'unset' }}>strictly </span>
            everything<span style={{ WebkitTextFillColor: 'unset', color: '#7c3aed' }}>.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-lg max-w-xl mx-auto mb-12"
            style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}
          >
            Drop entire folders or bulk files. Images, videos, audio — all converted
            instantly on your server. Zero cloud, zero limits.
          </motion.p>

          {/* Stat row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            <StatCard number="18+" label="Output Formats" />
            <StatCard number="500MB" label="Max File Size" />
            <StatCard number="0ms" label="Cloud Latency" />
            <StatCard number="∞" label="Batch Files" />
          </motion.div>
        </motion.section>

        {/* ── Upload Section ────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-8"
        >
          <UploadBox onFilesSelected={handleFilesSelected} />
        </motion.section>

        {/* ── Batch Rename Panel ────────────────────────────────────────────── */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 overflow-hidden"
            >
              <div className="glass-card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 w-full">
                  <label className="section-label block mb-2">Batch Rename Prefix</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. vacation_pic  →  vacation_pic_001.jpg"
                      value={batchPrefix}
                      onChange={(e) => setBatchPrefix(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm"
                      style={{
                        background: 'rgba(4,4,15,0.6)',
                        border: '1px solid rgba(124,58,237,0.25)',
                        color: 'var(--text-primary)',
                        fontFamily: 'Space Grotesk, sans-serif',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.7)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(124,58,237,0.25)'}
                    />
                  </div>
                </div>
                {/* Live status chips */}
                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                  {processingCount > 0 && (
                    <span className="format-pill pill-video">{processingCount} converting…</span>
                  )}
                  {completedCount > 0 && (
                    <span className="format-pill" style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                      {completedCount} ready
                    </span>
                  )}
                  <span className="format-pill pill-heic">{files.length} total</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── File List ─────────────────────────────────────────────────────── */}
        <FileList
          files={files}
          onRemove={handleRemove}
          onFormatChange={handleFormatChange}
          onDownload={downloadFile}
          downloadingMap={downloadingMap}
        />

        {/* ── Action Buttons ────────────────────────────────────────────────── */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="mt-8 flex justify-end gap-3 flex-wrap"
            >
              {completedCount > 0 && (
                <button
                  onClick={handleDownloadAll}
                  disabled={downloadingAll}
                  className="btn-primary btn-success"
                >
                  <FolderArchive className="w-4 h-4" />
                  {downloadingAll ? 'Zipping…' : `Download All (${completedCount}) ZIP`}
                </button>
              )}

              {idleCount > 0 && (
                <button onClick={handleConvertAll} className="btn-primary">
                  <Zap className="w-4 h-4" />
                  Convert Now ({idleCount})
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        {files.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-20 text-center"
          >
            <div className="divider mb-8" />
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              MediaMorph · All conversions run locally · No data leaves your machine
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default App;
