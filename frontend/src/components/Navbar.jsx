import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Menu, X, Sun, Moon, Monitor } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const LINKS = [
  { label: 'Features',  href: '/#features', id: 'features' },
  { label: 'Formats',   href: '/#formats',  id: 'formats'  },
  { label: 'How It Works', href: '/#how',   id: 'how'      },
  { label: 'Analytics', href: '/analytics' },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  const handleNavClick = (e, link) => {
    setMenuOpen(false);
    if (link.id) {
      e.preventDefault();
      if (location.pathname !== '/') {
        navigate(`/#${link.id}`);
        setTimeout(() => {
          const elem = document.getElementById(link.id);
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const elem = document.getElementById(link.id);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `/#${link.id}`);
        }
      }
    } else {
      e.preventDefault();
      navigate(link.href);
    }
  };

  return (
    <header className="navbar" style={{ borderBottomColor: scrolled ? 'rgba(192,154,95,.14)' : 'transparent', transition: 'border-color .3s' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <a 
          href="/" 
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen(false);
            if (location.pathname !== '/') {
              navigate('/');
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-3 no-underline"
        >
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
              onClick={(e) => handleNavClick(e, l)}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--muted)' }}
              onMouseEnter={e => e.target.style.color = 'var(--cream)'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="hidden md:flex p-2 rounded-lg btn-ghost items-center justify-center transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Sun className="w-4 h-4 gold-text" /> : <Moon className="w-4 h-4 gold-text" />}
          </button>
          <a 
            href="/#converter" 
            onClick={(e) => handleNavClick(e, { href: '/#converter', id: 'converter' })} 
            className="btn btn-gold hidden sm:flex" 
            style={{ padding: '9px 20px', fontSize: 13 }}
          >
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
            style={{ overflow: 'hidden', borderTop: '1px solid color-mix(in srgb, var(--gold) calc(100% * .15), transparent)' }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {LINKS.map(l => (
                <a 
                  key={l.href} 
                  href={l.href} 
                  onClick={(e) => handleNavClick(e, l)}
                  className="text-sm font-medium" 
                  style={{ color: 'var(--muted)' }}
                >
                  {l.label}
                </a>
              ))}

              <a 
                href="/#converter" 
                onClick={(e) => handleNavClick(e, { href: '/#converter', id: 'converter' })} 
                className="btn btn-gold" 
                style={{ padding: '10px 18px', fontSize: 13, justifyContent: 'center' }}
              >
                Convert Free
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
