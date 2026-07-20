import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Menu, X, Sun, Moon, Monitor } from 'lucide-react';

const LINKS = [
  { label: 'Features',  href: '/#features'  },
  { label: 'Formats',   href: '/#formats'   },
  { label: 'How It Works', href: '/#how'    },
  { label: 'Analytics', href: '/analytics'  },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    if (theme === 'system') {
      localStorage.removeItem('theme');
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    } else {
      localStorage.setItem('theme', theme);
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
  }, [theme]);

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  return (
    <header className="navbar" style={{ borderBottomColor: scrolled ? 'rgba(192,154,95,.14)' : 'transparent', transition: 'border-color .3s' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="flex items-center gap-3 no-underline">
          <img src="/logo.png" alt="MediaMorph" className="w-10 h-10 rounded-xl" style={{ objectFit: 'cover' }} />
          <div>
            <span className="display-sm text-base tracking-tight" style={{ color: 'var(--cream)', fontFamily: 'Playfair Display, serif', fontSize: 17 }}>
              MediaMorph
            </span>
          </div>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map(l => (
            <a key={l.href} href={l.href}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--muted)' }}
              onMouseEnter={e => e.target.style.color = 'var(--cream)'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <button 
            onClick={cycleTheme}
            className="p-2 rounded-lg btn-ghost flex items-center justify-center transition-colors"
            title={`Current theme: ${theme}`}
          >
            {theme === 'system' && <Monitor className="w-4 h-4 gold-text" />}
            {theme === 'light' && <Sun className="w-4 h-4 gold-text" />}
            {theme === 'dark' && <Moon className="w-4 h-4 gold-text" />}
          </button>
          <a href="/#converter" className="btn btn-gold hidden sm:flex" style={{ padding: '9px 20px', fontSize: 13 }}>
            Convert Free
          </a>
          <button className="md:hidden p-2 rounded-lg btn-ghost" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', borderTop: '1px solid rgba(192,154,95,.1)' }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {LINKS.map(l => (
                <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                  className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  {l.label}
                </a>
              ))}
              <a href="/#converter" className="btn btn-gold" style={{ padding: '10px 18px', fontSize: 13, justifyContent: 'center' }}>
                Convert Free
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
