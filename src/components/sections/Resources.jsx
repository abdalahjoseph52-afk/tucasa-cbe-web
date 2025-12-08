import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '../../context/LanguageContext';
import Reveal from '../ui/Reveal';
import { Search, FileText, Download, ArrowRight } from 'lucide-react';

const Resources = () => {
  const { t } = useLanguage();
  const [resources, setResources] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, "resources"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResources(data);
      setFilteredDocs(data);
    });
  }, []);

  useEffect(() => {
    if (searchQuery) setFilteredDocs(resources.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())));
    else setFilteredDocs(resources);
  }, [searchQuery, resources]);

  return (
    <section id="resources" className="py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER WITH SEARCH */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <Reveal width="100%">
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">{t('resources.subtitle')}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">{t('resources.title')}</h2>
          </Reveal>
          
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={t('resources.search_placeholder')} 
              className="w-full pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* LIST (Uniform Blue Icons) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc, index) => (
            <Reveal key={doc.id} delay={index * 0.05} width="100%">
              <div className="group flex items-center gap-5 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300">
                
                {/* Uniform Icon Container */}
                <div className="shrink-0 w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText size={24} />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">{doc.title}</h4>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-0.5">PDF Document • {doc.size || '2MB'}</p>
                </div>

                <a 
                  href={doc.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Download size={18} />
                </a>

              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Resources;