import React, { useState, useEffect } from 'react';
import { Play, Pause, Download, Heart, Youtube, BarChart3, DollarSign, Check, Music, Share2, Disc } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import Reveal from '../ui/Reveal';
import Modal from '../ui/Modal'; 

const Choir = () => {
  const { t } = useLanguage();
  
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState({ title: "Loading...", artist: "", url: "", cover: "" });
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [settings, setSettings] = useState({ youtube: '', paymentNumber: '', paymentName: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "songs"), orderBy("createdAt", "desc"));
    const unsubscribeSongs = onSnapshot(q, (snapshot) => {
      const fetchedSongs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSongs(fetchedSongs);
      if (fetchedSongs.length > 0 && !currentSong.url) setCurrentSong(fetchedSongs[0]);
    });

    const fetchSettings = async () => {
      const docRef = doc(db, "settings", "general");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setSettings(docSnap.data());
    };
    fetchSettings();

    return () => unsubscribeSongs();
  }, []);

  useEffect(() => {
    if (currentSong.url && isPlaying) {
      if (audio && audio.src === currentSong.url) { audio.play(); } 
      else { if (audio) audio.pause(); const newAudio = new Audio(currentSong.url); newAudio.play(); newAudio.onended = () => setIsPlaying(false); setAudio(newAudio); }
    } else if (audio) { audio.pause(); }
  }, [currentSong, isPlaying]);

  const handlePlayPause = (song) => {
    if (currentSong?.id === song.id) { setIsPlaying(!isPlaying); } 
    else { if (audio) audio.pause(); setCurrentSong(song); setIsPlaying(true); const newAudio = new Audio(song.url); setAudio(newAudio); newAudio.play(); }
  };

  const handleCopy = () => { if (settings.paymentNumber) { navigator.clipboard.writeText(settings.paymentNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); } };

  // FIX: Web Share API Logic
  const handleShare = async () => {
    if (navigator.share && currentSong.url) {
      try {
        await navigator.share({
          title: currentSong.title,
          text: `Sikiliza wimbo mpya "${currentSong.title}" kutoka TUCASA CBE!`,
          url: currentSong.url,
        });
      } catch (error) { console.log('Error sharing', error); }
    } else {
      alert("Browser yako haisupport share. Copy link hapa: " + currentSong.url);
    }
  };

  return (
    <section id="choir" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal width="100%">
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">{t('choir.subtitle')}</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-2">{t('choir.title')}</h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <div className="lg:col-span-5 sticky top-24">
            <Reveal width="100%">
              <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-white p-4 overflow-hidden relative group">
                <div className="aspect-square rounded-[2.5rem] overflow-hidden relative bg-slate-100 shadow-inner">
                  <img src={currentSong.cover || "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=1000&auto=format&fit=crop"} alt="Cover Art" className={`w-full h-full object-cover transition-transform duration-[3s] ${isPlaying ? 'scale-110' : 'scale-100'}`}/>
                  <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                    <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                      <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                      <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Now Playing</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 pb-4 px-4 text-center">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1 truncate px-2 leading-tight">{currentSong.title}</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-8">{currentSong.artist || "TUCASA CBE Choir"}</p>

                  <div className="flex items-center justify-center gap-8">
                    <button onClick={handleShare} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><Share2 size={20}/></button>

                    <button onClick={() => currentSong.url && handlePlayPause(currentSong)} disabled={!currentSong.url} className="w-20 h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isPlaying ? <Pause size={32} fill="currentColor"/> : <Play size={32} fill="currentColor" className="ml-1"/>}
                    </button>
                    
                    {/* FIX: Download Link opens in new tab to allow download */}
                    {currentSong.url ? (
                      <a href={currentSong.url} target="_blank" rel="noreferrer" download className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><Download size={20}/></a>
                    ) : (
                      <div className="p-3 text-slate-200"><Download size={20}/></div>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal width="100%" delay={0.2}>
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 p-6 md:p-8 h-full flex flex-col">
                <div className="flex justify-between items-center mb-8"><h4 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Disc size={24} className="text-blue-600"/> Orodha ya Nyimbo</h4><span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">{songs.length} Nyimbo</span></div>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                  {songs.length === 0 ? <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><Music size={40} className="mx-auto mb-3 opacity-20"/><p>Hakuna nyimbo bado.</p></div> : songs.map((song) => (
                      <div key={song.id} onClick={() => handlePlayPause(song)} className={`group flex items-center p-3 rounded-2xl cursor-pointer transition-all duration-300 border ${currentSong?.id === song.id ? 'bg-blue-50 border-blue-100 shadow-sm translate-x-2' : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100 hover:translate-x-1'}`}>
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden mr-4 bg-slate-200 shrink-0">
                           {currentSong?.id === song.id && isPlaying && <div className="absolute inset-0 bg-blue-900/60 flex items-center justify-center z-10"><BarChart3 size={16} className="text-white animate-pulse"/></div>}
                           <img src={song.cover || "https://via.placeholder.com/40"} alt="" className="w-full h-full object-cover"/>
                        </div>
                        <div className="flex-1 min-w-0"><h5 className={`text-sm font-bold truncate ${currentSong?.id === song.id ? 'text-blue-700' : 'text-slate-700 group-hover:text-slate-900'}`}>{song.title}</h5><p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{song.artist || "Choir"}</p></div>
                        <div className="text-slate-300">{currentSong?.id === song.id ? <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div> : <Play size={16} className="group-hover:text-blue-600 transition-colors"/>}</div>
                      </div>
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <button onClick={() => setIsPaymentModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-1"><Heart size={16} className="text-pink-500 fill-current" /> {t('choir.btn_support')}</button>
                  <a href={settings.youtube || "#"} target="_blank" rel="noreferrer" className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-1"><Youtube size={18} /> YouTube</a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title=""><div className="text-center p-4"><div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-4 relative"><button onClick={handleCopy} className="absolute top-3 right-3 bg-white border border-slate-200 hover:border-blue-500 text-slate-500 hover:text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all">{copied ? "IMECOPIWA" : "COPY"}</button><div className="text-left"><p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Namba ya Malipo</p><div className="text-2xl font-mono font-bold text-slate-900 tracking-tight mb-1">{settings.paymentNumber || "000 000 000"}</div><p className="text-xs font-bold text-blue-600 flex items-center gap-1"><Check size={12} /> {settings.paymentName || "TUCASA CBE"}</p></div></div><button onClick={() => setIsPaymentModalOpen(false)} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-black transition-colors">Funga</button></div></Modal>
    </section>
  );
};

export default Choir;