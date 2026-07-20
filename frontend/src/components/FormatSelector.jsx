import React from 'react';

const FORMAT_OPTIONS = {
  image: [
    { label: '── Smart Auto ──', value: '', disabled: true },
    { label: '📸 JPG  — Web & Photos', value: 'jpg' },
    { label: '🖼 PNG  — Transparency', value: 'png' },
    { label: '🌊 WEBP — Small & Sharp', value: 'webp' },
    { label: '🔮 AVIF — Ultra Modern', value: 'avif' },
    { label: '📐 TIFF — Print Quality', value: 'tiff' },
    { label: '🎞 GIF  — Animated', value: 'gif' },
    { label: '🖍 BMP  — Raw Bitmap', value: 'bmp' },
  ],
  video: [
    { label: '── Smart Auto ──', value: '', disabled: true },
    { label: '🎬 MP4  — Universal', value: 'mp4' },
    { label: '🎥 MOV  — Apple/Pro', value: 'mov' },
    { label: '📦 MKV  — High Quality', value: 'mkv' },
    { label: '🌐 WEBM — Browser', value: 'webm' },
    { label: '📼 AVI  — Legacy', value: 'avi' },
    { label: '🎮 FLV  — Flash', value: 'flv' },
    { label: '🌀 GIF  — Video to GIF', value: 'gif' },
    { label: '🗜 MP4  — Compressed', value: 'mp4_compressed' },
  ],
  audio: [
    { label: '── Smart Auto ──', value: '', disabled: true },
    { label: '🎵 MP3  — Universal', value: 'mp3' },
    { label: '🎧 WAV  — Lossless', value: 'wav' },
    { label: '📻 AAC  — Apple/Phone', value: 'aac' },
    { label: '🎶 OGG  — Open Source', value: 'ogg' },
    { label: '❄  FLAC — Studio Grade', value: 'flac' },
  ],
};

const FormatSelector = ({ fileType = 'image', selected, onChange }) => {
  const options = FORMAT_OPTIONS[fileType] || FORMAT_OPTIONS.image;

  return (
    <select
      value={selected}
      onChange={e => onChange(e.target.value)}
      className="format-select"
    >
      {options.map((opt, i) => (
        <option
          key={i}
          value={opt.value}
          disabled={opt.disabled}
          style={{ background: '#0d0d26', color: opt.disabled ? '#4b4d72' : '#c4b5fd' }}
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default FormatSelector;
