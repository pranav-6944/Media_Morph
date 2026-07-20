import React from 'react';

// Format groups with labels
const VIDEO_OPTIONS = [
  { value: 'mp4',  label: '🎬 MP4  — Universal' },
  { value: 'webm', label: '🌐 WEBM — Web / Streaming' },
  { value: 'mkv',  label: '📦 MKV  — High Quality' },
  { value: 'mov',  label: '🍎 MOV  — Apple / iMovie' },
  { value: 'avi',  label: '📼 AVI  — Legacy Windows' },
  { value: 'gif',  label: '🎞  GIF  — Animated / Social' },
];

const IMAGE_OPTIONS = [
  { value: 'jpg',  label: '📷 JPG  — Social / Photos' },
  { value: 'png',  label: '🖼  PNG  — Transparent / HQ' },
  { value: 'webp', label: '🌐 WEBP — Web Optimized' },
  { value: 'avif', label: '⚡ AVIF — Next-Gen Small' },
  { value: 'tiff', label: '🎨 TIFF — Print / Editing' },
];

const AUDIO_OPTIONS = [
  { value: 'mp3',  label: '🎵 MP3  — Universal Audio' },
  { value: 'wav',  label: '🔊 WAV  — Lossless / Studio' },
  { value: 'aac',  label: '🍎 AAC  — Apple / iTunes' },
  { value: 'ogg',  label: '🐧 OGG  — Open Source' },
  { value: 'flac', label: '💎 FLAC — Hi-Fi Lossless' },
];

const FormatSelector = ({ fileType, selected, onChange }) => {
  // fileType: 'video' | 'image' | 'audio'
  const isVideo = fileType === 'video';
  const isAudio = fileType === 'audio';

  const autoOptions = isAudio
    ? [
        { value: 'mp3', label: '🤖 Auto: Portable (MP3)' },
        { value: 'wav', label: '🤖 Auto: Lossless (WAV)' },
      ]
    : isVideo
    ? [
        { value: 'mp4',  label: '🤖 Auto: Universal (MP4)' },
        { value: 'gif',  label: '🤖 Auto: Social GIF' },
        { value: 'mp3',  label: '🤖 Auto: Extract Audio (MP3)' },
      ]
    : [
        { value: 'jpg',  label: '🤖 Auto: Social Media (JPG)' },
        { value: 'webp', label: '🤖 Auto: Web Upload (WebP)' },
        { value: 'avif', label: '🤖 Auto: Smallest File (AVIF)' },
      ];

  const customOptions = isAudio
    ? AUDIO_OPTIONS
    : isVideo
    ? [...VIDEO_OPTIONS, ...AUDIO_OPTIONS.filter(o => ['mp3', 'wav', 'aac'].includes(o.value))]
    : IMAGE_OPTIONS;

  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 cursor-pointer min-w-[190px]"
    >
      <optgroup label="Smart Auto 🤖">
        {autoOptions.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </optgroup>
      <optgroup label="All Formats">
        {customOptions.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </optgroup>
    </select>
  );
};

export default FormatSelector;
