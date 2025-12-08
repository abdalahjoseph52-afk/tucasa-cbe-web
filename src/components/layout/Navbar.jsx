import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import TucasaLogo from '../ui/TucasaLogo';

const Navbar = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* LOGO - PREMIUM & BIGGER */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0,0)}>
            {/* Logo kubwa zaidi na yenye animation ndogo ikiguswa */}
            <TucasaLogo className="h-14 md:h-16 w-auto drop-shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300" />
            <div className="hidden md:block leading-tight">
              <span className={`block font-extrabold text-2xl tracking-tighter ${scrolled ? 'text-slate-900' : 'text-white drop-shadow-sm'}`}>TUCASA</span>
              <span className={`block text-[10px] font-bold tracking-[0.3em] uppercase ${scrolled ? 'text-blue-600' : 'text-yellow-400 drop-shadow-sm'}`}>CBE Chapter</span>
            </div>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className={`text-sm font-bold hover:-translate-y-0.5 transition-all relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-yellow-400 after:transition-all hover:after:w-full ${scrolled ? 'text-slate-700 hover:text-blue-600' : 'text-white/90 hover:text-white'}`}>{link.name}</a>
            ))}
            <button onClick={toggleLanguage} className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold transition-all hover:scale-105 active:scale-95 ${scrolled ? 'bg-slate-100 border-slate-200 text-slate-900 hover:bg-blue-50 hover:border-blue-200' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}>
              <Globe size={14} /> <span>{language === 'en' ? 'EN' : 'SW'}</span>
            </button>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleLanguage} className={`text-xs font-bold p-2 rounded-full border ${scrolled ? 'text-slate-900 border-slate-200' : 'text-white border-white/20'}`}>{language === 'en' ? 'EN' : 'SW'}</button>
            <button onClick={() => setIsOpen(!isOpen)} className={scrolled ? 'text-slate-900' : 'text-white'}>{isOpen ? <X size={30} /> : <Menu size={30} />}</button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-2xl animate-in slide-in-from-top-5">
          <div className="flex flex-col p-6 gap-2">
            {navLinks.map((link) => (<a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="text-xl font-bold text-slate-800 hover:text-blue-600 py-3 border-b border-slate-50">{link.name}</a>))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;