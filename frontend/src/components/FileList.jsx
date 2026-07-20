import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileImage, FileVideo, Music, X, CheckCircle, Loader2, Download, AlertCircle } from 'lucide-react';
import FormatSelector from './FormatSelector';

const TYPE_CONFIG = {
  audio: {
    Icon: Music,
    iconClass: 'icon-audio',
    badgeClass: 'badge-audio',
    label: 'Audio',
    glow: 'rgba(249,115,22,0.15)',
    border: 'rgba(249,115,22,0.25)',
  },
  video: {
    Icon: FileVideo,
    iconClass: 'icon-video',
    badgeClass: 'badge-video',
    label: 'Video',
    glow: 'rgba(124,58,237,0.12)',
    border: 'rgba(124,58,237,0.25)',
  },
  image: {
    Icon: FileImage,
    iconClass: 'icon-image',
    badgeClass: 'badge-image',
    label: 'Image',
    glow: 'rgba(79,70,229,0.1)',
    border: 'rgba(79,70,229,0.2)',
  },
};

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const FileRow = ({ fileObj, idx, onRemove, onFormatChange, onDownload, downloadingMap }) => {
  const { id, file, status, progress, targetFormat, outFileName, fileType, errorMsg } = fileObj;
  const cfg          = TYPE_CONFIG[fileType] || TYPE_CONFIG.image;
  const { Icon }     = cfg;
  const isDone       = status === 'completed';
  const isProcessing = status === 'processing' || status === 'uploading';
  const isError      = status === 'failed';
  const isDownloading = downloadingMap[id];

  return (
    <motion.div
      layout
      key={id}
      initial={{ opacity: 0, x: -24, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.3, delay: idx * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="file-row"
      style={isDone ? { borderColor: 'rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.04)' } : {}}
    >
      {/* Progress track bar at bottom */}
      {isProcessing && (
        <div className="progress-bar-track">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress || 5}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}

      <div className="p-4 flex items-center gap-4 flex-wrap">
        {/* ── File type icon ─────────────────────────────────────────────── */}
        <div
          className={`p-2.5 rounded-xl flex-shrink-0 ${cfg.iconClass}`}
          style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon className="w-5 h-5" strokeWidth={1.5} />
        </div>

        {/* ── File info ──────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: 'var(--text-primary)', maxWidth: 260 }}
              title={file.name}
            >
              {file.name}
            </p>
            <span className={`format-pill text-xs ${cfg.badgeClass}`} style={{ padding: '2px 8px', fontSize: '10px' }}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatBytes(file.size)}
            </span>
            {isProcessing && (
              <span className="text-xs font-medium" style={{ color: '#a78bfa' }}>
                {progress || 0}% — converting…
              </span>
            )}
            {isDone && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs font-medium"
                style={{ color: '#34d399' }}
              >
                ✓ Done
              </motion.span>
            )}
            {isError && (
              <span className="text-xs" style={{ color: '#f87171' }}>
                {errorMsg || 'Conversion failed'}
              </span>
            )}
          </div>
        </div>

        {/* ── Controls ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">

          {/* Format selector */}
          {status === 'idle' && (
            <FormatSelector
              fileType={fileType}
              selected={targetFormat}
              onChange={(val) => onFormatChange(id, val)}
            />
          )}

          {/* Processing spinner */}
          {isProcessing && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#a78bfa' }} />
              <span className="text-xs font-medium" style={{ color: '#a78bfa' }}>Working</span>
            </div>
          )}

          {/* Download */}
          {isDone && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onDownload(outFileName, id)}
              disabled={isDownloading}
              className="btn-download"
            >
              {isDownloading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Download className="w-3.5 h-3.5" />}
              {isDownloading ? 'Saving…' : 'Download'}
            </motion.button>
          )}

          {/* Error */}
          {isError && (
            <div className="flex items-center gap-1.5 px-2" style={{ color: '#f87171' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            </div>
          )}

          {/* Remove */}
          {(status === 'idle' || isError) && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={() => onRemove(id)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: '#64748b' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════ */
const FileList = ({ files, onRemove, onFormatChange, onDownload, downloadingMap }) => {
  if (files.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-2"
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          Queue · {files.length} {files.length === 1 ? 'file' : 'files'}
        </h3>
        <div className="flex gap-2">
          {['idle','processing','completed','failed'].map(s => {
            const count = files.filter(f => f.status === s || (s === 'processing' && f.status === 'uploading')).length;
            if (!count) return null;
            const colors = {
              idle: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.2)' },
              processing: { bg: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: 'rgba(124,58,237,0.3)' },
              completed: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.25)' },
              failed: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.25)' },
            };
            const c = colors[s];
            return (
              <span key={s} className="format-pill text-xs" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: '3px 10px', fontSize: '11px' }}>
                {count} {s === 'idle' ? 'pending' : s === 'processing' ? 'converting' : s}
              </span>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {files.map((fileObj, idx) => (
            <FileRow
              key={fileObj.id}
              fileObj={fileObj}
              idx={idx}
              onRemove={onRemove}
              onFormatChange={onFormatChange}
              onDownload={onDownload}
              downloadingMap={downloadingMap}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default FileList;
