import React from 'react';
import { Logo } from './Logo';
import { Github, Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[var(--card)]/90 backdrop-blur-lg border-t border-[var(--border)] pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <Logo />
            <p className="text-[var(--muted)] leading-relaxed">
              Ecosistemas digitales vivos para la industria. 
              Gobernanza, escalabilidad y evolución conectada.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm">Ecosistema</h4>
            <ul className="space-y-4 text-[var(--muted)]">
              <li><a href="#ecosistema" className="hover:text-[var(--primary)] transition-colors">Ecosistema</a></li>
              <li><a href="#upstream" className="hover:text-[var(--primary)] transition-colors">Upstream Hub</a></li>
              <li><a href="#arquitectura" className="hover:text-[var(--primary)] transition-colors">Arquitectura</a></li>
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Gobernanza</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm">Servicios</h4>
            <ul className="space-y-4 text-[var(--muted)]">
              <li><a href="#factory" className="hover:text-[var(--primary)] transition-colors">Software Factory</a></li>
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Ingeniería O&G</a></li>
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Consultoría</a></li>
              <li><a href="#" className="hover:text-[var(--primary)] transition-colors">Soporte</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-sm">Contacto</h4>
            <ul className="space-y-4 text-[var(--muted)]">
              <li className="flex items-center gap-3"><Mail size={18} /> info@terabound.com</li>
              <li className="flex items-center gap-3"><Phone size={18} /> +1 (555) 000-0000</li>
              <li className="flex items-center gap-3"><MapPin size={18} /> Houston, TX / Bogotá, COL</li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-[var(--border)] flex flex-col md:row items-center justify-between gap-4 text-sm text-[var(--muted)]">
          <p>© 2026 Terabound. Todos los derechos reservados.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-[var(--foreground)]">Privacidad</a>
            <a href="#" className="hover:text-[var(--foreground)]">Términos</a>
            <a href="#" className="hover:text-[var(--foreground)]">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
