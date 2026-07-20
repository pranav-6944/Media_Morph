import React, { useState } from 'react';
import { Layers, FolderArchive } from 'lucide-react';
import UploadBox from './components/UploadBox';
import FileList from './components/FileList';
import { uploadFiles, startConversion, checkJobStatus, downloadFileUrl, downloadBatch } from './api';

function App() {
  const [files, setFiles] = useState([]);
  const [downloadingMap, setDownloadingMap] = useState({});
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [batchPrefix, setBatchPrefix] = useState('');

  const handleFilesSelected = (acceptedFiles) => {
    // Only accept relevant files by filtering
    const validFiles = acceptedFiles.filter(f => 
      f.name.match(/\.(heic|hevc|h265|mp4|mov)$/i) || f.type.includes('video') || f.type.includes('image')
    );

    const newFiles = validFiles.map(file => {
      const isVideo = file.type.includes('video') || file.name.toLowerCase().match(/\.(hevc|mp4|mov)$/i);
      return {
        id: crypto.randomUUID(),
        file,
        status: 'idle', 
        progress: 0,
        targetFormat: isVideo ? 'mp4' : 'jpg',
        fileId: null, 
        jobId: null, 
        outFileName: null,
        cleanName: null
      };
    });
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleFormatChange = (id, targetFormat) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, targetFormat } : f));
  };

  const handleRemove = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleConvertAll = async () => {
    const idleFiles = files.filter(f => f.status === 'idle');
    if (idleFiles.length === 0) return;

    const formData = new FormData();
    idleFiles.forEach(f => formData.append('files', f.file));

    try {
      setFiles(prev => prev.map(f => idleFiles.find(xf => xf.id === f.id) ? { ...f, status: 'uploading' } : f));

      const response = await uploadFiles(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setFiles(prev => prev.map(f => idleFiles.find(xf => xf.id === f.id) ? { ...f, progress: percent } : f));
      });

      const uploadedFiles = response.data.files;
      
      let counter = 1;
      setFiles(prev => prev.map(f => {
        const upFile = uploadedFiles.find(uf => uf.originalName === f.file.name);
        if (upFile && f.status === 'uploading') {
          const finalBaseName = batchPrefix.trim() ? `${batchPrefix.trim()}_${String(counter++).padStart(3, '0')}` : f.file.name.split('.')[0];
          startJob(f.id, upFile.id, f.file.name, f.targetFormat, finalBaseName);
          return { ...f, status: 'processing', progress: 0, fileId: upFile.id };
        }
        return f;
      }));
    } catch (error) {
      console.error("Upload failed", error);
      setFiles(prev => prev.map(f => idleFiles.find(xf => xf.id === f.id) ? { ...f, status: 'failed', progress: 0 } : f));
    }
  };

  const startJob = async (localFileId, backendFileId, originalName, targetFormat, finalBaseName) => {
    try {
      const res = await startConversion({
        fileId: backendFileId,
        inputFormat: originalName.split('.').pop(),
        outputFormat: targetFormat,
        originalName,
        finalBaseName
      });
      const { jobId, outFileName, cleanName } = res.data;
      
      setFiles(prev => prev.map(f => f.id === localFileId ? { ...f, jobId, outFileName, cleanName } : f));
      pollJobStatus(localFileId, jobId);
    } catch (error) {
      console.error("Failed to start job", error);
      setFiles(prev => prev.map(f => f.id === localFileId ? { ...f, status: 'failed' } : f));
    }
  };

  const pollJobStatus = (localFileId, jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await checkJobStatus(jobId);
        const { status, progress } = res.data;
        
        setFiles(prev => prev.map(f => {
          if (f.id === localFileId) return { ...f, status, progress: status === 'completed' ? 100 : progress };
          return f;
        }));

        if (status === 'completed' || status === 'failed') clearInterval(interval);
      } catch (error) {
        clearInterval(interval);
        setFiles(prev => prev.map(f => f.id === localFileId ? { ...f, status: 'failed' } : f));
      }
    }, 2000);
  };

  const downloadFile = async (filename, id) => {
    const f = files.find(x => x.id === id);
    setDownloadingMap(p => ({...p, [id]: true}));
    try {
      const url = downloadFileUrl(filename);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', f?.cleanName || filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } finally {
      setDownloadingMap(p => ({...p, [id]: false}));
    }
  };

  const handleDownloadAll = async () => {
    const completedFiles = files.filter(f => f.status === 'completed');
    if (completedFiles.length === 0) return;
    
    setDownloadingAll(true);
    try {
        const payload = completedFiles.map(f => ({ serverName: f.outFileName, cleanName: f.cleanName || f.outFileName }));
        const response = await downloadBatch(payload);
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'MediaMorph_Batch.zip');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    } catch (e) {
        console.error("Batch download failed", e);
    } finally {
        setDownloadingAll(false);
    }
  };

  const idleCount = files.filter(f => f.status === 'idle').length;
  const completedCount = files.filter(f => f.status === 'completed').length;

  return (
    <div className="min-h-screen relative p-6">
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      
      <div className="max-w-4xl mx-auto relative z-10 pt-10 pb-20">
        <header className="flex items-center space-x-3 mb-10">
          <Layers className="w-10 h-10 text-indigo-400" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            MediaMorph
          </h1>
        </header>

        <section className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-slate-100 tracking-tight lg:text-5xl">
              Convert strictly everything ⚡
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Drop entire folders or bulk files. We handle the heavy lifting.
            </p>
          </div>
          
          <UploadBox onFilesSelected={handleFilesSelected} />
        </section>

        {files.length > 0 && (
          <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-300 mb-2">Batch Rename Prefix (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. vacation_pic" 
                value={batchPrefix}
                onChange={(e) => setBatchPrefix(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-xs text-slate-500 mt-1">Leaves original names if empty. Otherwise, outputs: {batchPrefix ? `${batchPrefix}_001` : '...'}</p>
            </div>
          </div>
        )}

        <FileList 
          files={files} 
          onRemove={handleRemove} 
          onFormatChange={handleFormatChange} 
          onDownload={downloadFile}
          downloadingMap={downloadingMap}
        />

        {files.length > 0 && (
          <div className="mt-8 flex justify-end space-x-4">
            {completedCount > 0 && (
              <button
                onClick={handleDownloadAll}
                disabled={downloadingAll}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 transition-all flex items-center"
              >
                {downloadingAll ? 'Zipping...' : <><FolderArchive className="w-5 h-5 mr-2" /> Download All (ZIP)</>}
              </button>
            )}
            
            {idleCount > 0 && (
              <button
                onClick={handleConvertAll}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all"
              >
                Convert Now ({idleCount}) 🚀
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
