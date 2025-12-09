import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useLanguage } from '../../context/LanguageContext';
import { tucasaData } from '../../data/tucasaData';
import Reveal from '../ui/Reveal';
import { Loader2 } from 'lucide-react';

const Gallery = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setImages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          setImages(tucasaData.gallery);
        }
      } catch (err) {
        setImages(tucasaData.gallery);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  if (loading) return <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <section id="gallery" className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal width="100%">
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">{t('gallery.subtitle')}</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-2">{t('gallery.title')}</h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={img.id} className="relative group overflow-hidden rounded-2xl aspect-square cursor-pointer bg-slate-100">
              <Reveal delay={index * 0.05}>
                <img 
                  src={img.src} 
                  alt={img.alt || "Gallery Image"} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* CAPTION OVERLAY (FIXED) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-6">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-bold text-sm md:text-base line-clamp-2">
                      {img.caption || img.alt || "TUCASA Moment"}
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Gallery;