import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useLanguage } from '../../context/LanguageContext';
import { tucasaData } from '../../data/tucasaData'; 
import Reveal from '../ui/Reveal';
import { Phone, MessageCircle, X, ChevronRight } from 'lucide-react';

const Leadership = () => {
  const { t } = useLanguage();
  const [leaders, setLeaders] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState(null);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const q = query(collection(db, "leaders"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) { setLeaders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); } else { setLeaders(tucasaData.leaders); }
      } catch (err) { setLeaders(tucasaData.leaders); }
    };
    fetchLeaders();
  }, []);

  return (
    <section id="leadership" className="py-16 md:py-24 bg-white border-t border-slate-100 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12"><Reveal width="100%"><span className="text-blue-600 font-bold uppercase tracking-widest text-[10px] md:text-xs mb-2 block">{t('leadership.subtitle')}</span><h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{t('leadership.title')}</h2></Reveal></div>
        {leaders.length === 0 ? <div className="text-center text-slate-400 text-sm">Loading...</div> : (
          <div className="flex md:grid md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 overflow-x-auto pb-4 md:pb-0 snap-x scrollbar-hide -mx-4 px-4 md:mx-0">
            {leaders.map((leader, index) => (
              <div key={leader.id} className="snap-start shrink-0 w-24 md:w-auto flex flex-col items-center"><Reveal delay={index * 0.05} width="100%"><div onClick={() => setSelectedLeader(leader)} className="group cursor-pointer flex flex-col items-center"><div className="w-20 h-20 md:w-full md:h-auto md:aspect-[3/4] rounded-full md:rounded-2xl overflow-hidden border-[3px] border-slate-100 p-0.5 mb-2 md:mb-3 shadow-sm group-hover:border-blue-500 transition-all relative"><img src={leader.image || "https://via.placeholder.com/400x533"} alt={leader.name} className="w-full h-full object-cover rounded-full md:rounded-xl filter grayscale group-hover:grayscale-0 transition-all duration-500"/></div><div className="text-center w-full px-1"><h3 className="text-[10px] md:text-base font-bold text-slate-900 truncate leading-tight md:mb-1">{leader.name.split(' ')[0]} <span className="hidden md:inline"> {leader.name.split(' ').slice(1).join(' ')}</span></h3><p className="text-[8px] md:text-xs font-bold text-slate-400 uppercase tracking-wide truncate bg-slate-50 rounded-full px-2 py-0.5 mt-1">{leader.role}</p></div></div></Reveal></div>
            ))}
          </div>
        )}
        <div className="md:hidden text-center text-[10px] text-slate-400 mt-4 flex justify-center items-center gap-1 animate-pulse">{t('leadership.swipe_hint')} <ChevronRight size={12}/></div>
      </div>

      {/* FIX: Centered Modal (items-center instead of items-end) */}
      {selectedLeader && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200" onClick={() => setSelectedLeader(null)}>
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative border border-slate-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedLeader(null)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors"><X size={20}/></button>
            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-28 h-28 rounded-full p-1 border-4 border-blue-50 mb-4 shadow-xl bg-white"><img src={selectedLeader.image || "https://via.placeholder.com/400"} className="w-full h-full rounded-full object-cover"/></div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">{selectedLeader.name}</h3>
              <div className="inline-block px-4 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest rounded-full mb-6">{selectedLeader.role}</div>
              <div className="grid grid-cols-2 gap-4 w-full">
                {selectedLeader.phone ? <a href={`tel:${selectedLeader.phone}`} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-2xl border border-slate-100 transition-all group"><Phone size={20}/><span className="text-xs font-bold uppercase">Piga Simu</span></a> : <div className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 opacity-50 cursor-not-allowed"><Phone size={20} className="text-slate-400"/><span className="text-xs font-bold text-slate-400">Haipo</span></div>}
                {selectedLeader.whatsapp ? <a href={`https://wa.me/${selectedLeader.whatsapp}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-green-600 hover:text-white rounded-2xl border border-slate-100 transition-all group"><MessageCircle size={20}/><span className="text-xs font-bold uppercase">WhatsApp</span></a> : <div className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 opacity-50 cursor-not-allowed"><MessageCircle size={20} className="text-slate-400"/><span className="text-xs font-bold text-slate-400">Haipo</span></div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Leadership;