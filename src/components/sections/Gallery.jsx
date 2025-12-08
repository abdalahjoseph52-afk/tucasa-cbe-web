import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '../../context/LanguageContext';
import Reveal from '../ui/Reveal';
import { ZoomIn, X, Download } from 'lucide-react';

const Gallery = () => {
  const { t } = useLanguage();
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (s) => setImages(s.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, []);

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <Reveal width="100%">
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">{t('gallery.subtitle')}</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">{t('gallery.title')}</h2>
          </Reveal>
        </div>

        {images.length === 0 ? (
          <p className="text-center text-slate-400">Gallery is empty.</p>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {images.map((img, index) => (
              <div 
                key={img.id} 
                onClick={() => setSelectedImage(img)}
                className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-zoom-in bg-slate-100"
              >
                <img 
                  src={img.src} 
                  alt={img.alt} 
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white p-3 rounded-full shadow-lg">
                    <ZoomIn size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"><X size={24}/></button>
          <div className="max-w-5xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img src={selectedImage.src} alt="View" className="max-h-[80vh] rounded-lg shadow-2xl mb-4"/>
            <a href={selectedImage.src} download className="bg-white text-blue-900 px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors">
              <Download size={18}/> Download Photo
            </a>
          </div>
        </div>
      )}

    </section>
  );
};

export default Gallery;