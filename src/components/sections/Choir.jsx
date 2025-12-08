import React, { useState, useEffect } from 'react';
import { Play, Pause, Download, Heart, Youtube, BarChart3, DollarSign, Check, Music } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import Reveal from '../ui/Reveal';
import Modal from '../ui/Modal'; 

const Choir = () => {
  const { t } = useLanguage();
  
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [settings, setSettings] = useState({ youtube: '', paymentNumber: '', paymentName: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "songs"), orderBy("createdAt", "desc"));
    const unsubscribeSongs = onSnapshot(q, (s) => {
      const fetchedSongs = s.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSongs(fetchedSongs);
      if (fetchedSongs.length > 0 && !currentSong) setCurrentSong(fetchedSongs[0]);
    });
    const fetchSettings = async () => {
      const d = await getDoc(doc(db, "settings", "general"));
      if (d.exists()) setSettings(d.data());
    };
    fetchSettings();
    return () => unsubscribeSongs();
  }, []);

  useEffect(() => {
    if (currentSong && isPlaying) {
      if (audio && audio.src === currentSong.url) { audio.play(); } 
      else { if (audio) audio.pause(); const n = new Audio(currentSong.url); n.play(); n.onended = () => setIsPlaying(false); setAudio(n); }
    } else if (audio) { audio.pause(); }
  }, [currentSong, isPlaying]);

  const handlePlayPause = (song) => {
    if (currentSong?.id === song.id) { setIsPlaying(!isPlaying); } 
    else { if (audio) audio.pause(); setCurrentSong(song); setIsPlaying(true); const n = new Audio(song.url); setAudio(n); n.play(); }
  };

  const handleCopy = () => { navigator.clipboard.writeText(settings.paymentNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <section id="choir" className="py-16 md:py-24 bg-white border-t border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER COMPACT */}
        <div className="text-center mb-10">
          <Reveal width="100%">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">{t('choir.title')}</h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: PLAYER (Small on Mobile) */}
          <div className="lg:col-span-5 sticky top-20 z-20">
            <Reveal width="100%">
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-2 overflow-hidden">
                {/* Image: Square on Desktop, Banner on Mobile */}
                <div className="aspect-video md:aspect-square bg-slate-100 rounded-2xl overflow-hidden relative group">
                  <img src={currentSong?.cover || "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=800"} alt="Art" className="w-full h-full object-cover"/>
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                    <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest bg-blue-600/80 px-2 py-0.5 rounded mb-1 inline-block">Now Playing</span>
                    <h3 className="text-lg font-bold text-white truncate">{currentSong?.title || "Chagua Wimbo"}</h3>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <button onClick={() => currentSong && handlePlayPause(currentSong)} className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95">
                    {isPlaying ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor" className="ml-1"/>}
                  </button>
                  {currentSong && <a href={currentSong.url} download className="p-2 bg-slate-100 rounded-full"><Download size={18} className="text-slate-600"/></a>}
                </div>
              </div>
            </Reveal>
          </div>

          {/* RIGHT: PLAYLIST */}
          <div className="lg:col-span-7">
            <Reveal width="100%" delay={0.2}>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-8">
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {songs.map((song, index) => (
                    <div key={song.id} onClick={() => handlePlayPause(song)} className={`flex items-center p-3 rounded-xl cursor-pointer border ${currentSong?.id === song.id ? 'bg-blue-50 border-blue-100' : 'bg-white border-transparent hover:bg-slate-50'}`}>
                      <div className="w-10 h-10 rounded-lg overflow-hidden mr-3 bg-slate-200">
                         <img src={song.cover || "https://via.placeholder.com/40"} alt="" className="w-full h-full object-cover"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className={`text-sm font-bold truncate ${currentSong?.id === song.id ? 'text-blue-700' : 'text-slate-700'}`}>{song.title}</h5>
                      </div>
                      {currentSong?.id === song.id && isPlaying && <BarChart3 size={16} className="text-blue-600 animate-pulse"/>}
                    </div>
                  ))}
                </div>
                
                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-100">
                  <button onClick={() => setIsPaymentModalOpen(true)} className="bg-slate-900 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"><Heart size={14} className="text-pink-500 fill-current"/> Changia</button>
                  <a href={settings.youtube} target="_blank" rel="noreferrer" className="bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"><Youtube size={16}/> YouTube</a>
                </div>
              </div>
            </Reveal>
          </div>

        </div>
      </div>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="">
        <div className="text-center">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 relative">
            <button onClick={handleCopy} className="absolute top-3 right-3 text-blue-600 font-bold text-xs bg-blue-100 px-2 py-1 rounded">{copied ? "COPIED" : "COPY"}</button>
            <p className="text-xs font-bold text-slate-400 uppercase">M-Pesa / Tigo</p>
            <div className="text-2xl font-mono font-bold text-slate-900 my-1">{settings.paymentNumber}</div>
            <p className="text-xs text-blue-600 font-bold">{settings.paymentName}</p>
          </div>
          <button onClick={() => setIsPaymentModalOpen(false)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm">Funga</button>
        </div>
      </Modal>

    </section>
  );
};

export default Choir;