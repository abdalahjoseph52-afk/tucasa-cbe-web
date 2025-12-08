import React, { useState, useEffect } from 'react';
import { Mail, MapPin, Send, Phone, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { db } from '../../lib/firebase';
import { doc, onSnapshot, addDoc, collection, serverTimestamp } from 'firebase/firestore';

// OFFICIAL BRAND ICONS (Real SVGs)
const WhatsAppIcon = () => (<svg viewBox="0 0 24 24" width="20" height="20" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>);
const InstagramIcon = () => (<svg viewBox="0 0 24 24" width="20" height="20" fill="#E4405F"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>);
const TikTokIcon = () => (<svg viewBox="0 0 24 24" width="20" height="20" fill="#000000"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.16c0 3.13-2.19 6.18-5.55 6.86-2.6.54-5.36-.52-6.84-2.61-1.55-2.1-1.31-5.18.66-7.03 1.96-1.88 5.23-1.55 6.66.75.54.85.54 1.35.54 1.35-1.36 1.07-2.4 2.09-3.77 2.09-1.02 0-1.99-.52-2.53-1.37-.6-1.39.42-3.3 2.02-3.62 1.15-.23 2.32.29 2.97 1.25.14.22.23.48.25.75v-12.11c0-.04-.01-.08-.01-.12Z"/></svg>);

const Contact = () => {
  const { t } = useLanguage();
  const toast = useToast(); 
  const [contactInfo, setContactInfo] = useState({ whatsapp: '', instagram: '', tiktok: '', customLinks: [] });
  const [formData, setFormData] = useState({ firstName: '', lastName: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    return onSnapshot(doc(db, "settings", "general"), (d) => { if(d.exists()) setContactInfo(d.data()); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "messages"), { ...formData, createdAt: serverTimestamp(), read: false });
      toast.success("Ujumbe umetumwa kikamilifu!"); 
      setFormData({ firstName: '', lastName: '', message: '' });
    } catch (err) { toast.error("Imeshindikana kutuma."); }
    setIsSubmitting(false);
  };

  return (
    <section id="join" className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* INFO SIDE (Blue Theme + Real Social Icons) */}
          <div>
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">{t('contact.badge')}</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2 mb-6">{t('contact.title')}</h2>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">{t('contact.desc')}</p>

            <div className="space-y-8">
              {[
                { icon: MapPin, title: t('contact.location_title'), text: contactInfo.location },
                { icon: Mail, title: t('contact.email_title'), text: contactInfo.email },
                { icon: Phone, title: "Phone", text: contactInfo.phone }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-5">
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{item.title}</h4>
                    <p className="text-slate-500 mt-1">{item.text || "---"}</p>
                  </div>
                </div>
              ))}

              {/* SOCIAL MEDIA ROW (Real Icons restored here) */}
              <div className="pt-6 border-t border-slate-100 mt-8">
                <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">Social Media</h4>
                <div className="flex gap-4">
                  {contactInfo.whatsapp && (
                    <a href={contactInfo.whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 bg-slate-50 hover:bg-[#25D366]/10 border border-slate-200 hover:border-[#25D366] rounded-xl transition-all group">
                      <WhatsAppIcon /> <span className="text-sm font-bold text-slate-700 group-hover:text-[#25D366]">WhatsApp</span>
                    </a>
                  )}
                  {contactInfo.instagram && (
                    <a href={contactInfo.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 bg-slate-50 hover:bg-[#E4405F]/10 border border-slate-200 hover:border-[#E4405F] rounded-xl transition-all group">
                      <InstagramIcon /> <span className="text-sm font-bold text-slate-700 group-hover:text-[#E4405F]">Instagram</span>
                    </a>
                  )}
                  {contactInfo.tiktok && (
                    <a href={contactInfo.tiktok} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 bg-slate-50 hover:bg-black/5 border border-slate-200 hover:border-black rounded-xl transition-all group">
                      <TikTokIcon /> <span className="text-sm font-bold text-slate-700 group-hover:text-black">TikTok</span>
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* FORM SIDE (Clean Blue Focus) */}
          <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-xl">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">{t('contact.form_title')}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {['firstName', 'lastName'].map((field) => (
                  <div key={field} className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">{t(`contact.label_${field === 'firstName' ? 'fname' : 'lname'}`)}</label>
                    <input required type="text" className="w-full px-4 py-4 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none transition-all" value={formData[field]} onChange={e => setFormData({...formData, [field]: e.target.value})} placeholder="..." />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">{t('contact.label_msg')}</label>
                <textarea required rows="4" className="w-full px-4 py-4 rounded-xl bg-white border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 outline-none resize-none transition-all" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder={t('contact.placeholder_msg')}></textarea>
              </div>
              <button disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                {isSubmitting ? "Sending..." : <>{t('contact.btn_send')} <Send size={20} /></>}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;