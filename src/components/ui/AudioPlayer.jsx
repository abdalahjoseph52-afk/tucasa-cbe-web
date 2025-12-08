import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { motion } from 'framer-motion';

const AudioPlayer = ({ song }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // Safety check
  if (!song || !song.url) return null;

  const togglePlay = () => {
    if (isPlaying) { audioRef.current.pause(); } 
    else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
    setProgress((current / duration) * 100);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-md w-full mx-auto mt-8 shadow-2xl relative overflow-hidden group">
      
      <audio 
        ref={audioRef} 
        src={song.url} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Simplified Info (No Cover Art Required) */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-lg bg-tucasa-900 flex items-center justify-center shadow-lg border border-white/10">
           <Music className="text-yellow-400" size={32} />
        </div>
        <div className="text-left">
          <h4 className="text-white font-bold text-lg leading-tight">{song.title}</h4>
          <p className="text-blue-200 text-sm">TUCASA Choir</p> 
        </div>
      </div>

      <div className="w-full bg-white/10 h-1.5 rounded-full mb-6 overflow-hidden">
        <motion.div className="h-full bg-yellow-400" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => { audioRef.current.muted = !isMuted; setIsMuted(!isMuted); }} className="p-2 text-white/70 hover:text-white transition-colors">
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <button onClick={togglePlay} className="w-14 h-14 bg-white text-tucasa-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/10">
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>

        <div className="flex items-center gap-1 text-xs text-white/50 font-mono">
          <Music size={14} /> <span>AUDIO</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;