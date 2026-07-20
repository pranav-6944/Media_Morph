import React from 'react';
import { motion } from 'framer-motion';
import { FileImage, FileVideo, X, CheckCircle, Loader2, Download } from 'lucide-react';
import FormatSelector from './FormatSelector';

const FileList = ({ files, onRemove, onFormatChange, onDownload, downloadingMap }) => {
  if (files.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-lg font-medium text-slate-200">Selected Files</h3>
      <div className="space-y-3">
        {files.map((fileObj, idx) => {
          const { file, id, status, progress, targetFormat, outFileName } = fileObj;
          const isVideo = file.type.includes('video') || file.name.toLowerCase().endsWith('.hevc');
          const isDone = status === 'completed';
          const isProcessing = status === 'processing';
          const isError = status === 'failed';
          const isDownloading = downloadingMap[id];

          return (
            <motion.div 
              key={id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700 backdrop-blur-md"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${isVideo ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {isVideo ? <FileVideo className="w-6 h-6" /> : <FileImage className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {status === 'idle' && (
                  <FormatSelector 
                    isVideo={isVideo} 
                    selected={targetFormat} 
                    onChange={(val) => onFormatChange(id, val)} 
                  />
                )}

                {isProcessing && (
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">{progress}%</span>
                  </div>
                )}

                {isDone && (
                  <button 
                    onClick={() => onDownload(outFileName, id)}
                    disabled={isDownloading}
                    className="flex items-center text-sm px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                  >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Download className="w-4 h-4 mr-1" />}
                    Download
                  </button>
                )}

                {isError && (
                  <span className="text-sm text-red-400">Failed</span>
                )}

                {(status === 'idle' || isError) && (
                  <button onClick={() => onRemove(id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FileList;
