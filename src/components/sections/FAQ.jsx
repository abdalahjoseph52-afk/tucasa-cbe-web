import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useLanguage } from '../../context/LanguageContext';
import Reveal from '../ui/Reveal';
import { Plus, Minus } from 'lucide-react';

const FAQ = () => {
  const { t } = useLanguage();
  const [faqs, setFaqs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "faqs"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (s) => setFaqs(s.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, []);

  const toggleFAQ = (index) => setActiveIndex(activeIndex === index ? null : index);

  return (
    <section id="faq" className="py-24 bg-slate-50 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <Reveal width="100%">
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">{t('faq.title')}</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">Questions & Answers</h2>
          </Reveal>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Reveal key={faq.id} delay={index * 0.05} width="100%">
              <div 
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                  activeIndex === index 
                    ? 'border-blue-500 shadow-lg shadow-blue-500/10' 
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <button 
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                >
                  <span className={`font-bold text-lg ${activeIndex === index ? 'text-blue-700' : 'text-slate-800'}`}>
                    {faq.question}
                  </span>
                  <div className={`shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all ${activeIndex === index ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                    {activeIndex === index ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-6 pt-0 text-slate-600 leading-relaxed text-sm">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FAQ;