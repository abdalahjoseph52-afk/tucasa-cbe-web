import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useLanguage } from '../../context/LanguageContext';
import { tucasaData } from '../../data/tucasaData';
import Reveal from '../ui/Reveal';

const Gallery = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) setImages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        else setImages(tucasaData.gallery);
      } catch (err) { setImages(tucasaData.gallery); }
    };
    fetchGallery();
  }, []);

  return (
    <section id="gallery" className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16"><Reveal width="100%"><span className="text-blue-600 font-bold uppercase tracking-widest text-xs">{t('gallery.subtitle')}</span><h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-2">{t('gallery.title')}</h2></Reveal></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={img.id} className="relative group overflow-hidden rounded-2xl aspect-square cursor-pointer">
              <Reveal delay={index * 0.05}>
                <img src={img.src} alt={img.alt || "Gallery Image"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                {/* CAPTION OVERLAY */}
                {img.caption && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm font-bold">{img.caption}</p>
                  </div>
                )}
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;