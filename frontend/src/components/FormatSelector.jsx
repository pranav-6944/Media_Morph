import React from 'react';

const FormatSelector = ({ isVideo, selected, onChange }) => {
  const options = isVideo ? ['mp4', 'avi'] : ['jpg', 'png'];

  return (
    <select 
      value={selected} 
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 cursor-pointer"
    >
      <optgroup label="Smart Auto mode 🤖">
        <option value={isVideo ? "mp4" : "jpg"}>🤖 Auto: Social Media (Insta/FB)</option>
        <option value={isVideo ? "mp4" : "webp"}>🤖 Auto: Website Uploads (WebP)</option>
        <option value={isVideo ? "mp4" : "png"}>🤖 Auto: High-Quality Editing</option>
      </optgroup>
      <optgroup label="Custom Formats">
        {isVideo ? (
          <>
            <option value="mp4">MP4 Video</option>
            <option value="avi">AVI Video</option>
          </>
        ) : (
          <>
            <option value="jpg">JPG Image</option>
            <option value="png">PNG Image</option>
            <option value="webp">WebP Image</option>
          </>
        )}
      </optgroup>
    </select>
  );
};

export default FormatSelector;
