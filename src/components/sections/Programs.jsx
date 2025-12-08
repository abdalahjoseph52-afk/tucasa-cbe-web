import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { BookOpen, Heart, Star, Briefcase, Music, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react'; 
import Reveal from '../ui/Reveal';
import { useLanguage } from '../../context/LanguageContext';

// Icon Map
const iconMap = { 'BookOpen': BookOpen, 'Heart': Heart, 'Star': Star, 'Briefcase': Briefcase, 'Music': Music };

const Programs = () => {
  const { t } = useLanguage();
  const [programs, setPrograms] = useState([]);
  const [schedule, setSchedule] = useState({ days: 'Mon-Fri', time: '2PM', venue: 'BTD' });
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    // 1. Fetch Weekly Programs
    const unsubPrograms = onSnapshot(query(collection(db, "programs"), orderBy("createdAt", "asc")), (s) => {
      setPrograms(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    // 2. Fetch General Settings (Time/Venue)
    const unsubSettings = onSnapshot(doc(db, "settings", "general"), (d) => {
      if (d.exists()) {
        const data = d.data();
        setSchedule({ days: data.scheduleDays, time: data.scheduleTime, venue: data.scheduleVenue });
      }
    });

    // 3. Fetch Featured Session (Somo la Leo)
    const unsubFeatured = onSnapshot(doc(db, "settings", "featuredSession"), (d) => {
      if (d.exists()) setFeatured(d.data());
    });

    return () => { unsubPrograms(); unsubSettings(); unsubFeatured(); };
  }, []);

  return (
    <section id="programs" className="py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* LEFT: SOMO LA LEO & INFO */}
          <div>
            <Reveal width="100%">
              <span className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-2 block">{t('programs.subtitle')}</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">{t('programs.title')}</h2>
              
              {/* Badges (White & Blue Only) */}
              <div className="flex flex-wrap gap-2 mb-8">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold">
                  <Calendar size={14} className="text-blue-600"/> {schedule.days || '...'}
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold">
                  <Clock size={14} className="text-blue-600"/> {schedule.time || '...'}
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold">
                  <MapPin size={14} className="text-blue-600"/> {schedule.venue || '...'}
                </div>
              </div>

              {/* FEATURED CARD (Somo la Leo) */}
              {featured && featured.topic && (
                <div className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xl transition-all hover:shadow-2xl">
                  {/* Background Image Overlay */}
                  <div className="absolute inset-0">
                    <img 
                      src={featured.image || "https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800&fit=crop"} 
                      alt="Featured" 
                      className="w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-slate-900/90 mix-blend-multiply"></div>
                  </div>

                  <div className="relative z-10 p-8 text-white">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-yellow-500 text-slate-900 text-[10px] font-bold uppercase tracking-widest rounded-full">
                        Somo la Leo
                      </span>
                      <Star size={20} className="text-yellow-400 fill-current animate-pulse"/>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3 leading-tight">{featured.topic}</h3>
                    <p className="text-sm text-slate-300 mb-6 line-clamp-2">{featured.description || "Karibu tujifunze..."}</p>
                    
                    <div className="flex items-center gap-4 text-xs font-bold border-t border-white/10 pt-4 text-slate-300">
                      <span>Mhudumu: <span className="text-white">{featured.speaker}</span></span>
                      <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                      <span>Muda: <span className="text-white">{featured.date}</span></span>
                    </div>
                  </div>
                </div>
              )}
            </Reveal>
          </div>

          {/* RIGHT: LIST YA VIPINDI (Safi & Kiofisi) */}
          <div className="space-y-3">
            {programs.length === 0 ? (
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm text-center">Loading programs...</div>
            ) : (
              programs.map((prog, index) => {
                const IconComponent = iconMap[prog.icon] || BookOpen;
                return (
                  <Reveal key={prog.id} delay={index * 0.1} width="100%">
                    <div className="group flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                      
                      {/* Icon */}
                      <div className="shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <IconComponent size={20} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-bold text-slate-900">{prog.day}</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">{prog.title}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-1">
                          {prog.desc}
                        </p>
                      </div>

                      <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1"/>
                    </div>
                  </Reveal>
                );
              })
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Programs;