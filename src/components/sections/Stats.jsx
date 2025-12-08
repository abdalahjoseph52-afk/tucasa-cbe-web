import React from 'react';
import Reveal from '../ui/Reveal';

// --- GOOGLE MATERIAL ICONS (OFFICIAL & SOLID) ---

const IconGroups = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const IconSchool = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
  </svg>
);

const IconBook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z"/>
  </svg>
);

const IconMusic = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
);

// --- DATA ---
const statsData = [
  { id: 1, label: "Wanachama", value: "650+", icon: IconGroups, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  { id: 2, label: "Wahitimu", value: "1,200+", icon: IconSchool, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  { id: 3, label: "Vipindi / Wiki", value: "5", icon: IconBook, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  { id: 4, label: "Nyimbo Mpya", value: "24", icon: IconMusic, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
];

const Stats = () => {
  return (
    <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Container for Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statsData.map((stat, index) => (
            <Reveal key={stat.id} delay={index * 0.1} width="100%">
              <div className="flex flex-col items-center text-center group cursor-default">
                
                {/* Icon Box with Hover Effect */}
                <div className={`w-20 h-20 mb-6 rounded-3xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 ease-out`}>
                  <stat.icon />
                </div>
                
                {/* Number */}
                <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                  {stat.value}
                </h3>
                
                {/* Label with Divider Line */}
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-1 ${stat.bg.replace('/30','')} rounded-full`}></div>
                  <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </p>
                </div>

              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Stats;