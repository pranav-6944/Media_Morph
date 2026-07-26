import React, { useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, MousePointer2, FolderOpen } from 'lucide-react';

const ACCEPT = {
  'image/heic':['.heic'],'video/hevc':['.hevc','.h265'],
  'image/jpeg':['.jpg','.jpeg'],'image/png':['.png'],'image/webp':['.webp'],
  'image/avif':['.avif'],'image/tiff':['.tiff','.tif'],'image/bmp':['.bmp'],
  'image/gif':['.gif'],'image/svg+xml':['.svg'],
  'video/mp4':['.mp4'],'video/quicktime':['.mov'],'video/x-msvideo':['.avi'],
  'video/x-matroska':['.mkv'],'video/webm':['.webm'],'video/x-flv':['.flv'],
  'audio/mpeg':['.mp3'],'audio/wav':['.wav'],'audio/aac':['.aac'],
  'audio/ogg':['.ogg'],'audio/flac':['.flac'],'audio/x-m4a':['.m4a'],
};

const FORMAT_GROUPS = [
  { label: 'Image',  formats: ['HEIC','JPG','PNG','WEBP','AVIF'],  cls: 'badge-image' },
  { label: 'Video',  formats: ['MP4','MOV','MKV','WEBM','GIF'],    cls: 'badge-video' },
  { label: 'Audio',  formats: ['MP3','WAV','AAC','OGG','FLAC'],    cls: 'badge-audio' },
];

export default function UploadBox({ onFilesSelected }) {
  const fileRef   = useRef(null);
  const folderRef = useRef(null);

  const onDrop = useCallback(files => {
    if (files.length) onFilesSelected(files);
  }, [onFilesSelected]);

  const { getRootProps, isDragActive } = useDropzone({
    onDrop, noClick: true, accept: ACCEPT,
  });

  const handleChange = (e) => {
    if (e.target.files?.length) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .55 }}
      className={`upload-zone ${isDragActive ? 'upload-zone-active' : ''}`}
      {...getRootProps()}
    >
      <input type="file" ref={fileRef} className="hidden" multiple
        accept={Object.values(ACCEPT).flat().join(',')} onChange={handleChange} />
      <input type="file" ref={folderRef} className="hidden"
        webkitdirectory="true" multiple onChange={handleChange} />

      <div className="p-12 text-center" style={{ position: 'relative', zIndex: 1 }}>

        {/* Icon */}
        <motion.div
          animate={isDragActive ? { scale: 1.12, rotate: 4 } : { scale: 1, rotate: 0 }}
          transition={{ duration: .25 }}
          className="flex justify-center mb-7"
        >
          <div className="icon-wrap icon-image" style={{ width: 64, height: 64, borderRadius: 18 }}>
            <Upload className="w-7 h-7" strokeWidth={1.6} />
          </div>
        </motion.div>

        <h3 className="display-sm text-xl mb-2" style={{ color: 'var(--cream)' }}>
          {isDragActive ? 'Release to add files' : 'Drop files or folders here'}
        </h3>
        <p className="text-sm mb-8 muted-text">
          Batch processing supported — mix images, video, and audio freely
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-3 mb-9 flex-wrap">
          <button type="button" className="btn btn-gold" style={{ fontSize: 13, padding: '10px 20px' }}
            onClick={() => fileRef.current?.click()}>
            <MousePointer2 className="w-4 h-4" /> Select Files
          </button>
          <button type="button" className="btn btn-ghost" style={{ fontSize: 13, padding: '10px 20px' }}
            onClick={() => folderRef.current?.click()}>
            <FolderOpen className="w-4 h-4" /> Select Folder
          </button>
        </div>

        {/* Format groups */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          {FORMAT_GROUPS.map(g => (
            <div key={g.label} className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs muted-text font-medium shrink-0">{g.label}:</span>
              {g.formats.map(f => (
                <span key={f} className={`badge ${g.cls}`}>{f}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
