import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Reveal from '../ui/Reveal';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '../../context/ToastContext';

const Contact = () => {
  const { t } = useLanguage();
  const { success, error } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // FORCE PHONE FORMAT (0 -> 255)
      let formattedPhone = formData.phone.trim();
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '255' + formattedPhone.substring(1);
      } else if (formattedPhone.startsWith('+255')) {
        formattedPhone = formattedPhone.substring(1); // Remove +
      }

      await addDoc(collection(db, "messages"), {
        ...formData,
        phone: formattedPhone,
        createdAt: serverTimestamp()
      });
      
      // Fallback text if translation fails
      success(t('contact.success') || "Ujumbe umetumwa kikamilifu!");
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      error("Imeshindikana kutuma ujumbe. Tafadhali jaribu tena.");
    }
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal width="100%">
            {/* FALLBACK TEXT ADDED */}
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">
              {t('contact.subtitle') !== 'contact.subtitle' ? t('contact.subtitle') : 'Wasiliana Nasi'}
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-2">
              {t('contact.title') !== 'contact.title' ? t('contact.title') : 'Tuma Ujumbe'}
            </h2>
          </Reveal>
        </div>

        <div className="max-w-xl mx-auto">
          <Reveal width="100%" delay={0.2}>
            <form onSubmit={handleSubmit} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Jina Kamili</label>
                  <input required className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" placeholder="Mfano: John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Simu</label>
                    <input required type="tel" className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" placeholder="0xxx xxx xxx" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Barua Pepe</label>
                    <input type="email" className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" placeholder="email@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Ujumbe</label>
                  <textarea required rows="4" className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none" placeholder="Andika ujumbe wako hapa..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                </div>

                <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Tuma Ujumbe</>}
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Contact;