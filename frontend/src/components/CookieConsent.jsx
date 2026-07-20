import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('mediamorph_cookie_consent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('mediamorph_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('mediamorph_cookie_consent', 'rejected');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <div className="card p-5 border border-white/10" style={{ background: 'rgba(20,20,25,0.95)', backdropFilter: 'blur(20px)' }}>
            <button onClick={() => setIsVisible(false)} className="absolute top-3 right-3 text-white/50 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full" style={{ background: 'rgba(192,154,95,0.1)' }}>
                <ShieldAlert className="w-5 h-5" style={{ color: 'var(--gold)' }} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold cream-text mb-1">Privacy & Cookies</h4>
                <p className="text-xs muted-text mb-4 leading-relaxed">
                  We use cookies to improve your experience. Our conversions are 100% local and we don't retain any files.
                </p>
                <div className="flex gap-2">
                  <button onClick={handleAccept} className="px-4 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--gold)', color: '#000' }}>
                    Accept
                  </button>
                  <button onClick={handleReject} className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors hover:bg-white/5" style={{ color: 'var(--cream)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Reject Non-Essential
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
