import React, { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { UploadCloud, MousePointerClick, FolderOpen } from 'lucide-react';

const ACCEPT_TYPES = {
  'image/heic':        ['.heic'],
  'video/hevc':        ['.hevc', '.h265'],
  'image/jpeg':        ['.jpg', '.jpeg'],
  'image/png':         ['.png'],
  'image/webp':        ['.webp'],
  'image/avif':        ['.avif'],
  'image/tiff':        ['.tiff', '.tif'],
  'image/bmp':         ['.bmp'],
  'image/gif':         ['.gif'],
  'image/svg+xml':     ['.svg'],
  'video/mp4':         ['.mp4'],
  'video/quicktime':   ['.mov'],
  'video/x-msvideo':  ['.avi'],
  'video/x-matroska': ['.mkv'],
  'video/webm':        ['.webm'],
  'video/x-flv':       ['.flv'],
  'audio/mpeg':        ['.mp3'],
  'audio/wav':         ['.wav'],
  'audio/aac':         ['.aac'],
  'audio/ogg':         ['.ogg'],
  'audio/flac':        ['.flac'],
  'audio/x-m4a':       ['.m4a'],
};

const ACCEPT_STRING = Object.values(ACCEPT_TYPES).flat().join(',');

const PILLS = [
  { label: 'HEIC/HEVC', cls: 'pill-heic', icon: '🖼' },
  { label: 'MP4/MOV/MKV', cls: 'pill-video', icon: '🎬' },
  { label: 'MP3/WAV/AAC', cls: 'pill-audio', icon: '🎵' },
  { label: 'PNG/WEBP/AVIF', cls: 'pill-image', icon: '✨' },
];

const UploadBox = ({ onFilesSelected }) => {
  const fileInputRef   = useRef(null);
  const folderInputRef = useRef(null);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, isDragActive } = useDropzone({
    onDrop, noClick: true, accept: ACCEPT_TYPES,
  });

  const handleInputChange = (e) => {
    if (e.target.files?.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`upload-zone ${isDragActive ? 'upload-zone-active' : ''}`}
      {...getRootProps()}
    >
      {/* Inner glass surface */}
      <div
        className="glass-card-high p-12 text-center"
        style={{
          background: isDragActive
            ? 'rgba(124,58,237,0.12)'
            : 'rgba(13,13,38,0.7)',
          transition: 'background 0.3s ease',
        }}
      >
        {/* Hidden file inputs */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept={ACCEPT_STRING}
          onChange={handleInputChange}
        />
        <input
          type="file"
          ref={folderInputRef}
          className="hidden"
          webkitdirectory="true"
          directory="true"
          multiple
          onChange={handleInputChange}
        />

        {/* Upload icon with orbiting rings */}
        <motion.div
          animate={isDragActive
            ? { scale: 1.1, rotate: 5 }
            : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-center mb-6"
        >
          <div className="upload-icon-ring">
            <div
              className="p-5 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.2))',
                border: '1px solid rgba(124,58,237,0.4)',
                boxShadow: '0 0 30px rgba(124,58,237,0.3)',
              }}
            >
              <UploadCloud
                className="w-10 h-10"
                style={{ color: isDragActive ? '#a78bfa' : '#7c3aed' }}
                strokeWidth={1.5}
              />
            </div>
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <h2
            className="text-2xl font-bold mb-2"
            style={{
              fontFamily: 'Syne, sans-serif',
              color: isDragActive ? '#c4b5fd' : 'var(--text-primary)',
            }}
          >
            {isDragActive ? '✦ Drop them right here' : 'Drop files or folders'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {isDragActive
              ? 'Release to add your files to the queue'
              : 'Drag anything or click the buttons below — batch supported'}
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary"
            style={{ padding: '11px 22px', fontSize: '14px' }}
          >
            <MousePointerClick className="w-4 h-4" />
            Select Files
          </button>
          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="btn-primary btn-ghost"
            style={{ padding: '11px 22px', fontSize: '14px' }}
          >
            <FolderOpen className="w-4 h-4" />
            Select Folder
          </button>
        </div>

        {/* Format pills */}
        <div className="flex justify-center flex-wrap gap-2">
          {PILLS.map(p => (
            <motion.span
              key={p.label}
              whileHover={{ scale: 1.05, y: -1 }}
              className={`format-pill ${p.cls}`}
            >
              {p.icon} {p.label}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default UploadBox;
