import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Activity, FileDigit, Clock, HardDrive } from 'lucide-react';
import { getStats } from '../api';
import Navbar from '../components/Navbar';

export default function Analytics() {
  const [stats, setStats] = useState({ totalConversions: 0, byFormat: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load stats', err);
        setLoading(false);
      });
  }, []);

  const sortedFormats = Object.entries(stats.byFormat).sort((a, b) => b[1] - a[1]);
  
  const categories = { Image: 0, Video: 0, Audio: 0 };
  const IMAGE_FMTS = new Set(['jpg','jpeg','png','webp','avif','tiff','bmp','gif','svg']);
  const VIDEO_FMTS = new Set(['mp4','mov','avi','mkv','webm','flv','mp4_compressed']);
  
  Object.entries(stats.byFormat).forEach(([fmt, count]) => {
    if (IMAGE_FMTS.has(fmt.toLowerCase())) categories.Image += count;
    else if (VIDEO_FMTS.has(fmt.toLowerCase())) categories.Video += count;
    else categories.Audio += count;
  });

  const estTimeSaved = (stats.totalConversions * 45) / 60; // 45 seconds per file
  const estDataProcessed = (stats.totalConversions * 15.4) / 1024; // 15.4 MB avg

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="orb-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>
      <div className="grain" />
      
      <div className="relative z-50">
        <Navbar />
      </div>

      <div className="relative z-10 pt-32 pb-20 max-w-5xl mx-auto px-6">
        <div className="mb-12 text-center">
          <span className="section-label mb-4">Platform Insights</span>
          <h1 className="display-lg text-4xl cream-text">Global Analytics Dashboard</h1>
          <p className="muted-text mt-4">Real-time statistics of media conversions. Anonymized and privacy-first.</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Activity className="w-8 h-8 animate-spin" style={{ color: 'var(--gold)' }} />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(192,154,95,0.1)' }}>
                    <FileDigit className="w-6 h-6 gold-text" />
                  </div>
                  <h3 className="cream-text font-semibold">Total Conversions</h3>
                </div>
                <div className="text-5xl font-bold mt-6 mb-2 cream-text" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {stats.totalConversions}
                </div>
                <p className="text-sm muted-text">Files successfully processed</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(192,154,95,0.1)' }}>
                    <Clock className="w-6 h-6 gold-text" />
                  </div>
                  <h3 className="cream-text font-semibold">Time Saved</h3>
                </div>
                <div className="text-5xl font-bold mt-6 mb-2 cream-text" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {estTimeSaved.toFixed(0)} <span className="text-lg">mins</span>
                </div>
                <p className="text-sm muted-text">Estimated time saved vs manual conversion</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(192,154,95,0.1)' }}>
                    <HardDrive className="w-6 h-6 gold-text" />
                  </div>
                  <h3 className="cream-text font-semibold">Data Processed</h3>
                </div>
                <div className="text-5xl font-bold mt-6 mb-2 cream-text" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {estDataProcessed.toFixed(2)} <span className="text-lg">GB</span>
                </div>
                <p className="text-sm muted-text">Total anonymized payload volume</p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <Activity className="w-6 h-6 cream-text" />
                  </div>
                  <h3 className="cream-text font-semibold">Category Breakdown</h3>
                </div>
                <div className="space-y-6">
                  {Object.entries(categories).map(([cat, count], idx) => {
                    const pct = stats.totalConversions > 0 ? (count / stats.totalConversions) * 100 : 0;
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-semibold cream-text">{cat}</span>
                          <span className="muted-text">{count} ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className="h-2 rounded-full"
                            style={{ background: cat === 'Image' ? 'var(--gold)' : cat === 'Video' ? '#8A9ECC' : '#C08080' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <BarChart className="w-6 h-6 cream-text" />
                  </div>
                  <h3 className="cream-text font-semibold">Top Formats</h3>
                </div>
                
                <div className="space-y-4">
                  {sortedFormats.length === 0 ? (
                    <div className="text-sm muted-text italic">No conversions yet.</div>
                  ) : (
                    sortedFormats.slice(0, 5).map(([fmt, count], idx) => (
                      <div key={fmt}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="uppercase font-semibold cream-text">{fmt}</span>
                          <span className="muted-text">{count}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / stats.totalConversions) * 100}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className="h-2 rounded-full"
                            style={{ background: 'var(--gold)' }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
