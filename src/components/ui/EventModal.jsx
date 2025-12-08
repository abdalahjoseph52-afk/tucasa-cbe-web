import React from 'react';
import { X, Calendar, Clock, MapPin, Share2 } from 'lucide-react';

const EventModal = ({ event, onClose }) => {
  if (!event) return null;

  // Google Maps Link (Auto-generated from location name)
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || 'CBE Dar es Salaam')}`;

  // Share Function (Web Share API)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Join us for ${event.title} at ${event.location}!`,
          url: window.location.href,
        });
      } catch (err) { console.log('Share canceled'); }
    } else {
      alert("Link copied to clipboard!"); // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative" 
        onClick={e => e.stopPropagation()} // Zuia kufunga ukibonyeza ndani
      >
        
        {/* CLOSE BUTTON */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors">
          <X size={24} />
        </button>

        {/* IMAGE HEADER */}
        <div className="h-64 sm:h-80 w-full relative shrink-0">
          <img 
            src={event.image || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop"} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>
          
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 shadow-sm">{event.title}</h2>
            <div className="flex flex-wrap gap-4 text-white/90 font-medium text-sm">
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full"><Calendar size={16}/> {new Date(event.date).toLocaleDateString()}</span>
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full"><MapPin size={16}/> {event.location}</span>
            </div>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="p-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">About This Event</h3>
              <div className="w-12 h-1 bg-tucasa-600 rounded-full"></div>
            </div>
            
            <button onClick={handleShare} className="flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
              <Share2 size={20}/> Share
            </button>
          </div>

          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg mb-8 whitespace-pre-wrap">
            {event.description || "No description provided. Come and join us!"}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <a href={mapLink} target="_blank" rel="noreferrer" className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <MapPin size={20}/> View Map
            </a>
            {/* Hapa unaweza kuongeza button ya "Add to Calendar" siku za usoni */}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventModal;