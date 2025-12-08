import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Quote, Star, BookOpen } from 'lucide-react';
import Reveal from '../ui/Reveal';
import { useLanguage } from '../../context/LanguageContext';

const DailyManna = () => {
  const { t } = useLanguage();
  
  const [manna, setManna] = useState({ 
    text: "Bwana ndiye mchungaji wangu, sitapungukiwa na kitu.", 
    ref: "Zaburi 23:1",
    image: "https://images.unsplash.com/photo-1507692049790-de58293a4697?q=80&w=2070&auto=format&fit=crop"
  });

  useEffect(() => {
    try {
      const q = query(collection(db, "verses"), orderBy("createdAt", "desc"), limit(1));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setManna({
            text: data.text || manna.text,
            ref: data.ref || manna.ref,
            image: data.image || manna.image
          });
        }
      }, (err) => console.log(err));
      return () => unsubscribe();
    } catch (err) {}
  }, []);

  return (
    <section id="manna" className="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-32 h-32 md:w-64 md:h-64 bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal width="100%">
          
          {/* CARD: Stack on Mobile, Row on Desktop */}
          <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-lg md:shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
            
            {/* IMAGE: Height ndogo kwenye simu (h-48) */}
            <div className="h-48 md:h-auto md:w-1/2 relative overflow-hidden">
              <img 
                src={manna.image} 
                alt="Daily Manna" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-blue-900/10"></div>
              {/* Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                <BookOpen size={14} className="text-blue-600" />
                <span className="text-[10px] md:text-xs font-bold text-blue-900 uppercase tracking-wider">Neno la Siku</span>
              </div>
            </div>
            
            {/* TEXT: Padding ndogo kwenye simu */}
            <div className="p-6 md:p-12 md:w-1/2 flex flex-col justify-center relative">
              <Quote size={40} className="text-blue-50 absolute top-4 right-4 md:top-8 md:right-8 -z-10" />

              <div className="flex items-center gap-2 mb-4">
                 <Star size={14} className="text-yellow-500 fill-current" />
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{t('manna.title')}</span>
              </div>
              
              {/* Font size controlled for mobile */}
              <blockquote className="text-xl md:text-3xl font-serif font-medium text-slate-900 leading-relaxed mb-6">
                "{manna.text}"
              </blockquote>
              
              <div className="flex items-center gap-3">
                <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
                <span className="text-sm md:text-lg font-bold text-blue-900 tracking-wide font-sans">
                  {manna.ref}
                </span>
              </div>
            </div>

          </div>

        </Reveal>
      </div>
    </section>
  );
};

export default DailyManna;