import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000); // Inapotea baada ya sekunde 3
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ success: (msg) => addToast(msg, 'success'), error: (msg) => addToast(msg, 'error') }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl transition-all animate-in slide-in-from-right-full ${
              toast.type === 'success' ? 'bg-white border-l-4 border-green-500 text-slate-800' : 'bg-white border-l-4 border-red-500 text-slate-800'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={20} className="text-green-500"/> : <AlertCircle size={20} className="text-red-500"/>}
            <p className="text-sm font-bold">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="ml-4 text-slate-400 hover:text-slate-600"><X size={16}/></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};