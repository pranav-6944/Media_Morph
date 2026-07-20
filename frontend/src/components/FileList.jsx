import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileImage, FileVideo, Music, X, Loader2, Download, AlertCircle } from 'lucide-react';
import FormatSelector from './FormatSelector';

const TYPE = {
  image: { Icon: FileImage, iconCls: 'icon-image', badgeCls: 'badge-image', label: 'Image' },
  video: { Icon: FileVideo, iconCls: 'icon-video', badgeCls: 'badge-video', label: 'Video' },
  audio: { Icon: Music,     iconCls: 'icon-audio', badgeCls: 'badge-audio', label: 'Audio' },
};

function fmtSize(b) {
  return b < 1048576 ? `${(b/1024).toFixed(0)} KB` : `${(b/1048576).toFixed(2)} MB`;
}

function FileRow({ fileObj, idx, onRemove, onFormatChange, onDownload, downloadingMap }) {
  const { id, file, status, progress, targetFormat, outFileName, fileType, errorMsg } = fileObj;
  const cfg   = TYPE[fileType] || TYPE.image;
  const done  = status === 'completed';
  const proc  = status === 'processing' || status === 'uploading';
  const err   = status === 'failed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, scale: .96 }}
      transition={{ duration: .26, delay: idx * .04 }}
      className={`file-row ${done ? 'file-row-done' : ''}`}
    >
      {proc && (
        <div className="prog-track">
          <motion.div className="prog-fill"
            initial={{ width: 0 }} animate={{ width: `${progress || 4}%` }}
            transition={{ duration: .4, ease: 'easeOut' }} />
        </div>
      )}

      <div className="p-4 flex items-center gap-3 flex-wrap">
        {/* Icon */}
        <div className={`icon-wrap ${cfg.iconCls}`} style={{ width: 42, height: 42 }}>
          <cfg.Icon className="w-5 h-5" strokeWidth={1.6} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--cream)', maxWidth: 240 }} title={file.name}>
              {file.name}
            </span>
            <span className={`badge ${cfg.badgeCls}`}>{cfg.label}</span>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
            <span>{fmtSize(file.size)}</span>
            {proc && <span style={{ color: 'var(--gold)' }}>{progress || 0}% — converting…</span>}
            {done && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: 'var(--success)' }}>
                ✓ Complete {fileObj.endTime && fileObj.startTime ? `(${((fileObj.endTime - fileObj.startTime) / 1000).toFixed(1)}s)` : ''}
              </motion.span>
            )}
            {err  && <span style={{ color: 'var(--error)' }}>{errorMsg || 'Conversion failed'}</span>}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          {status === 'idle' && (
            <FormatSelector fileType={fileType} selected={targetFormat} onChange={v => onFormatChange(id, v)} />
          )}

          {proc && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(192,154,95,.08)', color: 'var(--gold)', border: '1px solid rgba(192,154,95,.15)' }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing
            </div>
          )}

          {done && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: .97 }}
              onClick={() => onDownload(outFileName, id)} disabled={downloadingMap[id]}
              className="dl-btn">
              {downloadingMap[id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {downloadingMap[id] ? 'Saving…' : 'Download'}
            </motion.button>
          )}

          {err && <AlertCircle className="w-4 h-4" style={{ color: 'var(--error)' }} />}

          {(status === 'idle' || err || done) && (
            <motion.button
              title="Remove file"
              whileHover={{ scale: 1.1 }} whileTap={{ scale: .9 }}
              onClick={() => onRemove(id)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--dim)', border: '1px solid rgba(255,255,255,.06)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--dim)'}
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function FileList({ files, onRemove, onFormatChange, onDownload, downloadingMap }) {
  if (!files.length) return null;

  const counts = {
    idle:      files.filter(f => f.status === 'idle').length,
    proc:      files.filter(f => f.status === 'processing' || f.status === 'uploading').length,
    done:      files.filter(f => f.status === 'completed').length,
    failed:    files.filter(f => f.status === 'failed').length,
  };

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className="section-label">Queue — {files.length} {files.length === 1 ? 'file' : 'files'}</span>
        <div className="flex gap-2 flex-wrap">
          {counts.idle   > 0 && <span className="tag tag-muted">{counts.idle} pending</span>}
          {counts.proc   > 0 && <span className="tag tag-gold">{counts.proc} converting</span>}
          {counts.done   > 0 && <span className="tag tag-green">{counts.done} done</span>}
          {counts.failed > 0 && <span className="tag tag-red">{counts.failed} failed</span>}
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {files.map((f, i) => (
            <FileRow key={f.id} fileObj={f} idx={i}
              onRemove={onRemove} onFormatChange={onFormatChange}
              onDownload={onDownload} downloadingMap={downloadingMap} />
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
