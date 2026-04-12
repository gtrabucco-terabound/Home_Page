import React from 'react';
import { useTheme } from '../lib/ThemeContext';
import { Logo } from './Logo';
import { Button } from './Button';
import { Sun, Moon, Monitor, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const navLinks = [
    { name: 'Ecosistemas', href: '#ecosistema' },
    { name: 'Upstream', href: '#upstream' },
    { name: 'Software Factory', href: '#factory' },
    { name: 'Arquitectura', href: '#arquitectura' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Logo />

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <div className="flex items-center bg-[var(--card)] border border-[var(--border)] rounded-full p-1">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            >
              <Sun size={16} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            >
              <Moon size={16} />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-full transition-all ${theme === 'system' ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted)] hover:text-[var(--foreground)]'}`}
            >
              <Monitor size={16} />
            </button>
          </div>

          <Button variant="primary" size="sm" className="hidden md:flex opacity-0">
            Solicitar Demo
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-[var(--foreground)]"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[var(--border)] bg-[var(--background)] overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-[var(--foreground)] hover:text-[var(--primary)]"
                >
                  {link.name}
                </a>
              ))}
              <Button variant="primary" className="w-full">
                Solicitar Demo
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
