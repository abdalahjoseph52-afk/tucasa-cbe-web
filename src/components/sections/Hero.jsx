import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Star } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Reveal from '../ui/Reveal';
import { db } from '../../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import RegistrationModal from '../ui/RegistrationModal';

const Hero = () => {
  const { t } = useLanguage();
  const [heroData, setHeroData] = useState({ title: '', subtitle: '', image: '' });
  const [isRegOpen, setIsRegOpen] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "general"), (doc) => {
      if (doc.exists()) setHeroData(doc.data());
    });
    return unsub;
  }, []);

  const scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const bgImage = heroData.image || "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2073&auto=format&fit=crop";

  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-white">
      
      {/* 1. BACKGROUND (Clean & Bright) */}
      <div className="absolute inset-0 z-0">
        <img src={bgImage} alt="Hero" className="w-full h-full object-cover" />
        {/* Modern Gradient Overlay: Dark Blue to Transparent */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/80 to-blue-900/40"></div>
      </div>

      {/* 2. CONTENT (Aligned Left like Corporate Sites) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="max-w-3xl">
          
          <Reveal width="100%">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-yellow-400 font-bold text-xs uppercase tracking-widest mb-6">
              <Star size={14} fill="currentColor" /> TUCASA CBE Chapter
            </div>
          </Reveal>

          <Reveal width="100%" delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
              {heroData.title || t('hero.title')}
            </h1>
          </Reveal>

          <Reveal width="100%" delay={0.2}>
            <p className="text-lg md:text-xl text-slate-200 leading-relaxed mb-10 border-l-4 border-yellow-500 pl-6">
              {heroData.subtitle || t('hero.subtitle')}
            </p>
          </Reveal>

          <Reveal width="100%" delay={0.3}>
            <div className="flex flex-wrap gap-4">
              {/* Primary Button (Solid Blue) */}
              <button 
                onClick={() => setIsRegOpen(true)}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2 group"
              >
                {t('hero.btn_join')} 
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
              </button>

              {/* Secondary Button (White Outline) */}
              <button 
                onClick={() => scrollToSection('choir')}
                className="px-8 py-4 bg-white text-blue-900 rounded-full font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2"
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