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
    noClick: true, // Disable traditional click so custom buttons handle it natively for attributes
    accept: {
      'image/heic': ['.heic'],
      'video/mp4': ['.mp4', '.mov'],
      'video/hevc': ['.hevc', '.h265']
    }
  });

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = ''; 
    }
  };

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
            or choose an option below
          </p>
        </div>

        <div className="flex space-x-3 mt-6 z-20 relative">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple 
            accept=".heic,.mp4,.mov,.hevc,.h265"
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

        <div className="flex space-x-4 mt-8 text-sm text-slate-500 justify-center">
          <span className="flex items-center"><FileType className="w-4 h-4 mr-1"/> HEIC</span>
          <span className="flex items-center"><FileType className="w-4 h-4 mr-1"/> HEVC</span>
          <span className="flex items-center"><FileType className="w-4 h-4 mr-1"/> MOV</span>
        </div>
      </div>
    </motion.div>
  );
};

export default UploadBox;
