import React, { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileType, FolderOpen, MousePointerClick } from 'lucide-react';
import { motion } from 'framer-motion';

const UploadBox = ({ onFilesSelected }) => {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const onDrop = useCallback(acceptedFiles => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, isDragActive } = useDropzone({ 
    onDrop,
    noClick: true,
    accept: {
      // HEIC / HEVC
      'image/heic':  ['.heic'],
      'video/hevc':  ['.hevc', '.h265'],
      // Images
      'image/jpeg':  ['.jpg', '.jpeg'],
      'image/png':   ['.png'],
      'image/webp':  ['.webp'],
      'image/avif':  ['.avif'],
      'image/tiff':  ['.tiff', '.tif'],
      'image/bmp':   ['.bmp'],
      'image/gif':   ['.gif'],
      'image/svg+xml': ['.svg'],
      // Videos
      'video/mp4':   ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/x-msvideo': ['.avi'],
      'video/x-matroska': ['.mkv'],
      'video/webm':  ['.webm'],
      'video/x-flv': ['.flv'],
      // Audio
      'audio/mpeg':  ['.mp3'],
      'audio/wav':   ['.wav'],
      'audio/aac':   ['.aac'],
      'audio/ogg':   ['.ogg'],
      'audio/flac':  ['.flac'],
      'audio/x-m4a': ['.m4a'],
    }
  });

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = ''; 
    }
  };

  const badges = [
    { label: 'HEIC', color: 'text-indigo-400' },
    { label: 'HEVC', color: 'text-purple-400' },
    { label: 'MP4/MOV', color: 'text-blue-400' },
    { label: 'JPG/PNG', color: 'text-emerald-400' },
    { label: 'MP3/WAV', color: 'text-orange-400' },
    { label: '+ more', color: 'text-slate-500' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 backdrop-blur-sm
      ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-600 bg-slate-800/50 hover:border-indigo-400'}`}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-indigo-500/20 rounded-full">
          <UploadCloud className="w-12 h-12 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-100">
            {isDragActive ? 'Drop your files or folders here' : 'Drag & drop files or folders'}
          </h3>
          <p className="text-slate-400 mt-2">
            Images · Videos · Audio · and more
          </p>
        </div>

        <div className="flex space-x-3 mt-6 z-20 relative">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple 
            accept=".heic,.hevc,.h265,.jpg,.jpeg,.png,.webp,.avif,.tiff,.bmp,.gif,.svg,.mp4,.mov,.avi,.mkv,.webm,.flv,.mp3,.wav,.aac,.ogg,.flac,.m4a"
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

          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2 bg-slate-700/50 hover:bg-indigo-500/30 text-indigo-300 rounded-xl transition-colors font-medium text-sm"
          >
            <MousePointerClick className="w-4 h-4 mr-2" />
            Select Files
          </button>
          
          <button 
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center px-4 py-2 bg-slate-700/50 hover:bg-purple-500/30 text-purple-300 rounded-xl transition-colors font-medium text-sm"
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Select Folder
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 text-xs justify-center">
          {badges.map(b => (
            <span key={b.label} className={`flex items-center ${b.color}`}>
              <FileType className="w-3 h-3 mr-1"/> {b.label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default UploadBox;


