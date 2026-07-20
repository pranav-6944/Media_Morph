import React from 'react';

const OPTS = {
  image: [
    { label: '─ Smart Pick ─', value: '', disabled: true },
    { label: 'JPG  · Web & Photos',    value: 'jpg'  },
    { label: 'PNG  · Transparency',    value: 'png'  },
    { label: 'WEBP · Smallest Size',   value: 'webp' },
    { label: 'AVIF · Ultra Modern',    value: 'avif' },
    { label: 'TIFF · Print Quality',   value: 'tiff' },
    { label: 'GIF  · Animated',        value: 'gif'  },
  ],
  video: [
    { label: '─ Smart Pick ─', value: '', disabled: true },
    { label: 'MP4  · Universal',       value: 'mp4'            },
    { label: 'MOV  · Apple / Pro',     value: 'mov'            },
    { label: 'MKV  · High Quality',    value: 'mkv'            },
    { label: 'WEBM · Browser Ready',   value: 'webm'           },
    { label: 'AVI  · Legacy',          value: 'avi'            },
    { label: 'GIF  · Video to GIF',    value: 'gif'            },
    { label: 'MP4  · Compressed',      value: 'mp4_compressed' },
  ],
  audio: [
    { label: '─ Smart Pick ─', value: '', disabled: true },
    { label: 'MP3  · Universal',       value: 'mp3'  },
    { label: 'WAV  · Lossless',        value: 'wav'  },
    { label: 'AAC  · Apple / Mobile',  value: 'aac'  },
    { label: 'OGG  · Open Source',     value: 'ogg'  },
    { label: 'FLAC · Studio Grade',    value: 'flac' },
  ],
};

export default function FormatSelector({ fileType = 'image', selected, onChange }) {
  const opts = OPTS[fileType] || OPTS.image;
  return (
    <select value={selected} onChange={e => onChange(e.target.value)} className="fmt-select">
      {opts.map((o, i) => (
        <option key={i} value={o.value} disabled={o.disabled}
          style={{ background: '#141328', color: o.disabled ? '#5A5450' : '#EAE0CE', fontWeight: 500 }}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
