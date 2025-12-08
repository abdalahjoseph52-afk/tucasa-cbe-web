import React, { Suspense, lazy, useState, useEffect } from 'react';
import ScrollProgress from './components/ui/ScrollProgress';
import BackToTop from './components/ui/BackToTop';
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import Seo from './components/utils/Seo';
import TucasaLogo from './components/ui/TucasaLogo';
import { useLanguage } from './context/LanguageContext';
import { Loader2, Lock, MapPin, Mail, Phone } from 'lucide-react';
import { db } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

import AdminDashboard from './components/admin/AdminDashboard';

const DailyManna = lazy(() => import('./components/sections/DailyManna'));
const Programs = lazy(() => import('./components/sections/Programs'));
const Events = lazy(() => import('./components/sections/Events'));
const Gallery = lazy(() => import('./components/sections/Gallery'));
const Testimonials = lazy(() => import('./components/sections/Testimonials'));
const Resources = lazy(() => import('./components/sections/Resources'));
const Leadership = lazy(() => import('./components/sections/Leadership'));
const Choir = lazy(() => import('./components/sections/Choir'));
const FAQ = lazy(() => import('./components/sections/FAQ'));
const Contact = lazy(() => import('./components/sections/Contact'));

const SectionLoader = () => (<div className="py-24 flex justify-center items-center"><Loader2 size={32} className="text-blue-600 animate-spin" /></div>);

function App() {
  const { t } = useLanguage();
  const [isAdminView, setIsAdminView] = useState(false);
  const [contactInfo, setContactInfo] = useState({});

  useEffect(() => {
    return onSnapshot(doc(db, "settings", "general"), (doc) => { if (doc.exists()) setContactInfo(doc.data()); });
  }, []);

  if (isAdminView) return <><div className="fixed top-4 right-4 z-[60]"><button onClick={() => setIsAdminView(false)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg">Back to Site</button></div><AdminDashboard /></>;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Seo />
      <ScrollProgress /> 
      <BackToTop />
      <Navbar />
      
      <main>
        <div id="home"><Hero /></div>
        <Suspense fallback={<SectionLoader />}><div id="manna"><DailyManna /></div></Suspense>
        <Suspense fallback={<SectionLoader />}><div id="programs"><Programs /></div><div className="border-t border-slate-100 max-w-7xl mx-auto" /><div id="events"><Events /></div></Suspense>
        <div className="bg-slate-50"><Suspense fallback={<SectionLoader />}><div id="choir"><Choir /></div><div id="gallery"><Gallery /></div></Suspense></div>
        <Suspense fallback={<SectionLoader />}><div id="leaders"><Leadership /></div><div id="testimonials"><Testimonials /></div><div id="resources"><Resources /></div></Suspense>
        <Suspense fallback={<SectionLoader />}><div id="faq"><FAQ /></div><div id="contact"><Contact /></div></Suspense>
      </main>
      
      {/* FOOTER - FIXED LAYOUT */}
      <footer className="bg-[#0f172a] text-slate-300 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 mb-12">
            
            {/* BRAND */}
            <div className="md:w-1/3 space-y-4">
              <div className="flex items-center gap-3">
                 <TucasaLogo className="h-12 w-auto" isFooter={true} />
                 <div className="h-8 w-[1px] bg-slate-700"></div>
                 <div>
                   <h3 className="text-white font-bold text-base tracking-wider">TUCASA CBE</h3>
                   <p className="text-[10px] text-slate-500 uppercase tracking-widest">Dar es Salaam</p>
                 </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{t('footer.brand_desc')}</p>
            </div>

            {/* LINKS & ADDRESS GRID */}
            <div className="md:w-2/3 grid grid-cols-2 gap-8 md:gap-12">
              
              {/* Quick Links */}
              <div>
                <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span> {t('footer.quick_links')}
                </h4>
                <ul className="space-y-2 text-xs md:text-sm">
                  {[
                    {l: t('nav.home'), h:'#home'}, {l: t('nav.programs'), h:'#programs'}, 
                    {l: t('nav.events'), h:'#events'}, {l: t('nav.choir'), h:'#choir'},
                    {l: t('nav.leaders'), h:'#leaders'}, {l: t('nav.contact'), h:'#contact'}
                  ].map((item) => (
                    <li key={item.l}><a href={item.h} className="hover:text-white transition-colors block py-1">{item.l}</a></li>
                  ))}
                </ul>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> {t('footer.location')}
                </h4>
                <ul className="space-y-3 text-xs md:text-sm">
                  <li className="flex items-start gap-2">
                    <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <span>CBE Dar Campus,<br/>Bibi Titi Mohamed Rd.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone size={16} className="text-blue-500 shrink-0" />
                    <span className="font-mono">{contactInfo.phone}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail size={16} className="text-blue-500 shrink-0" />
                    <span className="break-all">{contactInfo.email}</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs text-slate-500 gap-4">
            <p>© 2025 TUCASA CBE. {t('footer.rights')}</p>
            <div className="flex gap-4">
               <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
               <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
            </div>
            <button onClick={() => setIsAdminView(true)} className="flex items-center gap-1 hover:text-white"><Lock size={10} /> Admin</button>
          </div>

        </div>
      </footer>
    </div>
  );
}

export default App;