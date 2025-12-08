import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '../../context/LanguageContext';
import Reveal from '../ui/Reveal';
import EventModal from '../ui/EventModal';
import { ArrowRight } from 'lucide-react';

// GOOGLE STYLE ICONS (CLEAN SVG)
const IconCalendar = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/></svg>);
const IconLocation = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>);
const IconTime = () => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>);

const Events = () => {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    return onSnapshot(q, (s) => {
      const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
      const today = new Date().toISOString().split('T')[0];
      setEvents(data.filter(e => e.date >= today));
    });
  }, []);

  return (
    <section id="events" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-slate-100 pb-6">
          <Reveal width="100%">
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">{t('events.subtitle')}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">{t('events.title')}</h2>
          </Reveal>
        </div>

        {/* EVENTS GRID (Clean Corporate Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-slate-100">
              Hakuna matukio yajayo kwa sasa.
            </div>
          ) : (
            events.map((event, index) => (
              <Reveal key={event.id} delay={index * 0.1} width="100%">
                <div 
                  onClick={() => setSelectedEvent(event)}
                  className="group cursor-pointer bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
                >
                  {/* Hover Accent Line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                  {/* Date & Title */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1 text-center min-w-[60px]">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="block text-xl font-bold text-slate-900 leading-none">{new Date(event.date).getDate()}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ArrowRight size={14} />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                    {event.title}
                  </h3>

                  {/* Metadata (Uniform Slate Icons) */}
                  <div className="mt-auto space-y-2 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                      <IconLocation /> <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                      <IconTime /> <span>{event.time || '00:00'}</span>
                    </div>
                  </div>

                </div>
              </Reveal>
            ))
          )}
        </div>

      </div>
      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </section>
  );
};

export default Events;