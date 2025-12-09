import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Star, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Reveal from '../ui/Reveal';
import { db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import RegistrationModal from '../ui/RegistrationModal';

const Hero = () => {
  const { t } = useLanguage();
  const [heroData, setHeroData] = useState(null); // Anza na NULL
  const [loading, setLoading] = useState(true); // Loading State
  const [isRegOpen, setIsRegOpen] = useState(false);

  useEffect(() => {
    // Tunasikiliza data mara moja
    const unsub = onSnapshot(doc(db, "settings", "general"), (doc) => {
      if (doc.exists()) {
        setHeroData(doc.data());
      }
      setLoading(false); // Data imefika, ondoa loading
    });
    return unsub;
  }, []);

  const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  // KAMA BADO INALODA, ONYESHA KIOO CHEUSI SAFI (BILA MAANDISHI YA ZAMANI)
  if (loading) {
    return (
      <section className="relative min-h-[90vh] flex items-center justify-center bg-slate-900">
        <Loader2 className="text-blue-500 animate-spin" size={40} />
      </section>
    );
  }

  // DATA IMEFIKA: TUMIA YAKO AU DEFAULT KAMA BACKUP
  const title = heroData?.heroTitle || t('hero.title');
  const subtitle = heroData?.heroSubtitle || t('hero.subtitle');
  const image = heroData?.heroImage || "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2073&auto=format&fit=crop";

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-900">
      
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <img 
          src={image} 
          alt="Hero" 
          className="w-full h-full object-cover transition-transform duration-[10s] hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/80 to-blue-900/40"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="max-w-3xl">
          
          <Reveal width="100%">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-yellow-400 font-bold text-xs uppercase tracking-widest mb-6 shadow-lg">
              <Star size={14} fill="currentColor" /> TUCASA CBE Chapter
            </div>
          </Reveal>

          <Reveal width="100%" delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
              {title}
            </h1>
          </Reveal>

          <Reveal width="100%" delay={0.2}>
            <p className="text-lg md:text-xl text-slate-200 leading-relaxed mb-10 border-l-4 border-yellow-500 pl-6">
              {subtitle}
            </p>
          </Reveal>

          <Reveal width="100%" delay={0.3}>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setIsRegOpen(true)}
                className="group relative px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] hover:-translate-y-1"
              >
                <div className="relative z-10 flex items-center gap-2">
                  {t('hero.btn_join')} 
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                </div>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-white/20 transition-transform duration-300"></div>
              </button>

              <button 
                onClick={() => scrollToSection('choir')}
                className="px-8 py-4 bg-white text-blue-900 rounded-full font-bold text-lg transition-all hover:bg-slate-100 hover:shadow-lg hover:-translate-y-1 flex items-center gap-2"
              >
                <Play size={20} fill="currentColor" />
                {t('hero.btn_watch')}
              </button>
            </div>
          </Reveal>

        </div>
      </div>

      <RegistrationModal isOpen={isRegOpen} onClose={() => setIsRegOpen(false)} />
    </section>
  );
};

export default Hero;