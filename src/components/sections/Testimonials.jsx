import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '../../context/LanguageContext';
import Reveal from '../ui/Reveal';
import { Quote } from 'lucide-react';

const Testimonials = () => {
  const { t } = useLanguage();
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "testimonials"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (s) => setTestimonials(s.docs.map(doc => ({id: doc.id, ...doc.data()}))));
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-24 bg-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16">
          <Reveal width="100%">
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">{t('testimonials.subtitle')}</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">{t('testimonials.title')}</h2>
          </Reveal>
        </div>

        <div className="flex overflow-x-auto pb-10 gap-6 snap-x snap-mandatory scrollbar-hide">
          {testimonials.map((test, index) => (
            <div key={test.id} className="snap-center shrink-0 w-[320px] md:w-[400px]">
              <Reveal key={test.id} delay={index * 0.1} width="100%">
                <div className="bg-slate-50 p-8 rounded-[2rem] h-full border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:bg-white transition-all duration-300 relative group">
                  
                  {/* Uniform Blue Quote Icon */}
                  <Quote size={48} className="text-blue-100 absolute top-6 right-6 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-500" />
                  
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={test.image || "https://via.placeholder.com/100"} 
                      alt={test.name} 
                      className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-md"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{test.name}</h4>
                      <p className="text-xs text-blue-600 font-bold uppercase tracking-wide">{test.role}</p>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 leading-relaxed italic text-sm">
                    "{test.text}"
                  </p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;