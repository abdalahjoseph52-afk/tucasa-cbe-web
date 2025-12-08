import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Lock } from 'lucide-react'; // Icons safi
import { useLanguage } from '../../context/LanguageContext'; // Tunavuta Lugha
import TucasaLogo from '../ui/TucasaLogo';

const Navbar = () => {
  const { t, language, toggleLanguage } = useLanguage(); // <--- HAPA TUNAVUTA 'language'
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll Effect (Kiofisi: Navbar inabadilika ikishuka)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home'), href: "#home" },
    { name: t('nav.programs'), href: "#programs" },
    { name: t('nav.events'), href: "#events" },
    { name: t('nav.choir'), href: "#choir" },
    { name: t('nav.leaders'), href: "#leadership" },
    { name: t('nav.contact'), href: "#contact" },
  ];

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-sm py-3 border-b border-slate-100' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* 1. LOGO */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <TucasaLogo className="h-10 w-auto" />
            <div className="hidden md:block leading-tight">
              <span className={`block font-extrabold text-lg tracking-tight ${scrolled ? 'text-slate-900' : 'text-white'}`}>TUCASA CBE</span>
              <span className={`block text-[10px] font-bold tracking-widest uppercase ${scrolled ? 'text-blue-600' : 'text-yellow-400'}`}>Dar es Salaam</span>
            </div>
          </div>

          {/* 2. DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className={`text-sm font-bold hover:text-blue-500 transition-colors ${scrolled ? 'text-slate-600' : 'text-white/90 hover:text-white'}`}
              >
                {link.name}
              </a>
            ))}

            {/* LANGUAGE SWITCHER (FIXED) */}
            <button 
              onClick={toggleLanguage}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${
                scrolled 
                  ? 'bg-slate-100 border-slate-200 text-slate-900 hover:bg-blue-50 hover:border-blue-200' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <Globe size={14} />
              {/* HAPA NDIPO PALIPOREKEBISHWA: Inaonyesha EN au SW kulingana na state */}
              <span>{language === 'en' ? 'EN' : 'SW'}</span>
            </button>
          </div>

          {/* 3. MOBILE MENU BUTTON */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className={`text-xs font-bold p-2 rounded-full border ${scrolled ? 'text-slate-900 border-slate-200' : 'text-white border-white/20'}`}
            >
              {language === 'en' ? 'EN' : 'SW'}
            </button>

            <button onClick={() => setIsOpen(!isOpen)} className={scrolled ? 'text-slate-900' : 'text-white'}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

        </div>
      </div>

      {/* 4. MOBILE DROPDOWN (Clean & White) */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-xl animate-in slide-in-from-top-5 duration-200">
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="text-lg font-bold text-slate-800 hover:text-blue-600 py-2 border-b border-slate-50"
              >
                {link.name}
              </a>
            ))}
            
            {/* Mobile Footer Info */}
            <div className="mt-4 pt-4 bg-slate-50 -mx-6 -mb-6 p-6 text-center">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Educating for Eternity</p>
            </div>
          </div>
        </div>
      )}

    </nav>
  );
};

export default Navbar;