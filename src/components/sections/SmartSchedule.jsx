import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Radio } from 'lucide-react';
import { useCurrentProgram } from '../../hooks/useCurrentProgram';

const SmartSchedule = () => {
  const { todaysProgram, isProgramLive } = useCurrentProgram();

  if (!todaysProgram) return null; // Don't show anything on days with no program (e.g. Sunday/Sat)

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full max-w-4xl mx-auto px-4 mt-8 relative z-20"
      >
        <div className={`
          relative overflow-hidden rounded-2xl p-6 shadow-xl border
          ${isProgramLive 
            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500' 
            : 'bg-white border-blue-100'
          }
        `}>
          
          {/* Background Pulse Effect if Live */}
          {isProgramLive && (
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-20 rounded-full animate-ping"></div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-4">
              <div className={`
                p-3 rounded-full flex items-center justify-center
                ${isProgramLive ? 'bg-white/20' : 'bg-blue-50 text-tucasa-600'}
              `}>
                {isProgramLive ? <Radio className="animate-pulse" /> : <Clock />}
              </div>
              
              <div className="text-center md:text-left">
                <h3 className={`font-bold uppercase tracking-wider text-xs mb-1 ${isProgramLive ? 'text-red-100' : 'text-tucasa-600'}`}>
                  {isProgramLive ? '🔴 HAPPENING NOW (20:00 - 21:00)' : `TONIGHT'S PROGRAM (${todaysProgram.day})`}
                </h3>
                <p className={`text-lg md:text-xl font-bold ${isProgramLive ? 'text-white' : 'text-slate-900'}`}>
                  {todaysProgram.title}
                </p>
              </div>
            </div>

            <div className="hidden md:block h-10 w-px bg-current opacity-20"></div>

            <p className={`text-sm md:text-base max-w-md text-center md:text-left ${isProgramLive ? 'text-red-50' : 'text-slate-600'}`}>
              {todaysProgram.desc}
            </p>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SmartSchedule;