import React, { useState } from 'react';
import { X, Loader2, CheckCircle, User, Book, Phone, Home, Heart } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const RegistrationModal = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Fomu yenye taarifa za msingi za TUCASA
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    phone: '',
    email: '',
    regNo: '', // Format: 02.4567.01.01.2020
    course: '', // e.g. BIT, BBA
    year: '1',
    homeChurch: '',
    ministry: 'Choir', // Kwaya, Ushering, etc.
    baptismStatus: 'Yes'
  });

  if (!isOpen) return null;

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple Validation for CBE Reg No Format
    // Inakagua kama ina nukta 4 (mfano rahisi)
    if ((formData.regNo.match(/\./g) || []).length !== 4) {
      alert("Tafadhali weka Namba ya Usajili kwa usahihi (Mfano: 02.1234.01.01.2024)");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "registrations"), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'Pending' // Admin can approve later
      });
      setIsSuccess(true);
      // Reset form after 3 seconds or keep success message
    } catch (err) {
      alert("Hitilafu imetokea. Tafadhali jaribu tena.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-tucasa-900 dark:text-white">Fomu ya Usajili</h2>
            <p className="text-sm text-slate-500">Karibu kwenye Familia ya TUCASA CBE</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* SUCCESS MESSAGE */}
        {isSuccess ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Usajili Umekamilika!</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8">Asante kwa kujiunga nasi. Taarifa zako zimehifadhiwa.</p>
            <button onClick={onClose} className="px-8 py-3 bg-tucasa-600 text-white rounded-xl font-bold hover:bg-tucasa-700">Funga</button>
          </div>
        ) : (
          /* FORM */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* 1. TAARIFA BINAFSI */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-tucasa-600 uppercase tracking-wider flex items-center gap-2">
                <User size={16}/> Taarifa Binafsi
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required name="firstName" placeholder="Jina la Kwanza" className="input-field" onChange={handleChange} />
                <input required name="lastName" placeholder="Jina la Ukoo" className="input-field" onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select name="gender" className="input-field bg-white dark:bg-slate-800" onChange={handleChange}>
                  <option value="Male">Kiume (Male)</option>
                  <option value="Female">Kike (Female)</option>
                </select>
                <input required name="phone" type="tel" placeholder="Namba ya Simu (07...)" className="input-field" onChange={handleChange} />
              </div>
            </div>

            {/* 2. TAARIFA ZA CHUO (CBE DETAILS) */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-tucasa-600 uppercase tracking-wider flex items-center gap-2">
                <Book size={16}/> Taarifa za Chuo (CBE)
              </h4>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Namba ya Usajili (Format: 02.xxxx.xx.xx.xxxx)</label>
                <input 
                  required 
                  name="regNo" 
                  placeholder="Mfano: 02.1234.01.01.2024" 
                  className="input-field font-mono text-sm tracking-wide" 
                  onChange={handleChange} 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required name="course" placeholder="Kozi (Mfano: BIT, BBA, Procurement)" className="input-field" onChange={handleChange} />
                <select name="year" className="input-field bg-white dark:bg-slate-800" onChange={handleChange}>
                  <option value="1">Mwaka wa Kwanza</option>
                  <option value="2">Mwaka wa Pili</option>
                  <option value="3">Mwaka wa Tatu</option>
                </select>
              </div>
            </div>

            {/* 3. TAARIFA ZA KIROHO */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-tucasa-600 uppercase tracking-wider flex items-center gap-2">
                <Home size={16}/> Taarifa za Kiroho
              </h4>
              <input required name="homeChurch" placeholder="Kanisa la Nyumbani / Unapotoka" className="input-field" onChange={handleChange} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Je, Umebatizwa?</label>
                  <select name="baptismStatus" className="input-field bg-white dark:bg-slate-800" onChange={handleChange}>
                    <option value="Yes">Ndiyo, Nimebatizwa</option>
                    <option value="No">Hapana, Bado</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Huduma Unayopenda</label>
                  <select name="ministry" className="input-field bg-white dark:bg-slate-800" onChange={handleChange}>
                    <option value="Choir">Kwaya</option>
                    <option value="Ushering">Ukaribishaji</option>
                    <option value="Evangelism">Uinjilisti</option>
                    <option value="Community Service">Huduma za Jamii</option>
                    <option value="IT & Media">IT na Media</option>
                    <option value="Literature">Machapisho</option>
                  </select>
                </div>
              </div>
            </div>

            <button disabled={isSubmitting} className="w-full bg-tucasa-600 text-white font-bold py-4 rounded-xl hover:bg-tucasa-700 transition-all flex items-center justify-center gap-2 mt-6">
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Tuma Usajili'}
            </button>

          </form>
        )}
      </div>
      
      <style>{`
        .input-field {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          outline: none;
          transition: all 0.3s;
        }
        .dark .input-field {
          background-color: #1e293b;
          border-color: #334155;
          color: white;
        }
        .input-field:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
      `}</style>
    </div>
  );
};

export default RegistrationModal;