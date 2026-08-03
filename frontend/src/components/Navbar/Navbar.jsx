import React from 'react';
import { Zap, Menu, X, Globe } from 'lucide-react';
import { translations } from '../../i18n/translations.js';

const navItems = [
  { key: 'nav_home', target: 'accueil' },
  { key: 'nav_services', target: 'services' },
  { key: 'nav_about', target: 'apropos' },
  { key: 'nav_projects', target: 'projets' },
  { key: 'nav_careers', target: 'carrieres' },
  { key: 'nav_blog', target: 'blog' },
  { key: 'nav_contact', target: 'contact' }
];

export default function Navbar({ activeSection, mobileMenuOpen, setMobileMenuOpen, scrolled, language = 'fr', setLanguage }) {
  const t = translations[language] || translations['fr'];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/95 backdrop-blur-md py-4 shadow-xl border-b border-slate-800' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#accueil" className="flex items-center gap-3 group">
          <div className="bg-amber-500 text-slate-900 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-amber-500/20">
            <Zap className="h-6 w-6 fill-slate-900" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-extrabold tracking-wider text-white">DIVERSIA <span className="text-amber-500">SARL</span></span>
            <span className="block text-[10px] tracking-widest text-slate-400 font-semibold uppercase">Énergie & Ingénierie • RDC</span>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          <div className="flex gap-6 text-sm font-semibold tracking-wide">
            {navItems.map((item) => (
              <a
                key={item.target}
                href={`#${item.target}`}
                className={`relative py-2 transition-all duration-300 ${
                  activeSection === item.target ? 'text-amber-500 font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t[item.key]}
                <span className={`absolute bottom-0 left-0 h-[2px] bg-amber-500 rounded-full transition-all duration-300 ${activeSection === item.target ? 'w-full opacity-100' : 'w-0 opacity-0'}`} />
              </a>
            ))}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/50 p-1 rounded-xl text-xs font-bold text-white">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${language === 'fr' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'hover:text-amber-500'}`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${language === 'en' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'hover:text-amber-500'}`}
            >
              EN
            </button>
          </div>

          <a
            href="#contact"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 hover:scale-105 shadow-lg shadow-amber-500/20"
          >
            {t.btn_quote}
          </a>
        </nav>

        <div className="flex items-center gap-4 lg:hidden">
          {/* Mobile Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-850 p-0.5 rounded-lg text-[10px] font-bold text-white border border-slate-800">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-2 py-0.5 rounded ${language === 'fr' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'}`}
            >
              EN
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:text-amber-500 p-2 focus:outline-none transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-lg border-b border-slate-800 shadow-2xl animate-slide-up">
          <div className="flex flex-col gap-4 px-8 py-8 text-left">
            {navItems.map((item) => (
              <a
                key={item.target}
                href={`#${item.target}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-lg font-medium py-1.5 transition-all ${
                  activeSection === item.target ? 'text-amber-500 font-bold border-l-2 border-amber-500 pl-3' : 'text-slate-300 hover:text-white pl-3'
                }`}
              >
                {t[item.key]}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 text-center py-3.5 rounded-xl font-bold text-sm tracking-wide uppercase transition-all shadow-lg"
            >
              {t.btn_quote}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
