import React, { useState } from 'react';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../lib/firebase'; // Import DB
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Firestore functions

const RegistrationForm = () => {
  const [status, setStatus] = useState('idle');
  const { addToast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    // Get data from form
    const formData = new FormData(e.target);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      regNo: formData.get('regNo'),
      phone: formData.get('phone'),
      ministry: formData.get('ministry'),
      createdAt: serverTimestamp(), // Auto-add time
      status: 'pending' // Default status
    };

    try {
      // SAVE TO CLOUD (Firestore)
      await addDoc(collection(db, "registrations"), data);
      
      setStatus('success');
      addToast(t('form.success_msg'), 'success');
    } catch (error) {
      console.error("Error adding document: ", error);
      setStatus('error');
      addToast("Connection failed. Please try again.", 'error');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('form.success_title')}</h3>
        <p className="text-slate-600 mb-6">{t('form.success_msg')}</p>
        <button onClick={() => setStatus('idle')} className="text-tucasa-600 font-bold hover:underline">
          {t('form.btn_again')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === 'error' && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={16} /> Submission failed. Check your internet.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">{t('contact.label_fname')}</label>
          <input name="firstName" required type="text" className="w-full p-3 rounded-lg border border-slate-200 focus:border-tucasa-600 focus:outline-none" placeholder="Juma" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">{t('contact.label_lname')}</label>
          <input name="lastName" required type="text" className="w-full p-3 rounded-lg border border-slate-200 focus:border-tucasa-600 focus:outline-none" placeholder="Baraka" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">{t('form.reg_no')}</label>
        <input name="regNo" required type="text" className="w-full p-3 rounded-lg border border-slate-200 focus:border-tucasa-600 focus:outline-none" placeholder="BCP/D/2023/..." />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">{t('form.phone')}</label>
        <input name="phone" required type="tel" className="w-full p-3 rounded-lg border border-slate-200 focus:border-tucasa-600 focus:outline-none" placeholder="07..." />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-500 uppercase">{t('form.ministry')}</label>
        <select name="ministry" className="w-full p-3 rounded-lg border border-slate-200 focus:border-tucasa-600 focus:outline-none bg-white">
          <option>Choir</option>
          <option>Ushering</option>
          <option>Evangelism</option>
          <option>Community Service</option>
          <option>Media & IT</option>
        </select>
      </div>

      <button 
        disabled={status === 'submitting'}
        type="submit" 
        className="w-full bg-tucasa-600 text-white font-bold py-3 rounded-xl hover:bg-tucasa-900 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
      >
        {status === 'submitting' ? (
          <> <Loader2 size={20} className="animate-spin" /> {t('form.processing')} </>
        ) : (
          t('form.btn_submit')
        )}
      </button>
    </form>
  );
};

export default RegistrationForm;