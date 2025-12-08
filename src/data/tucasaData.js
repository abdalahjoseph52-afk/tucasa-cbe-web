import { Users, BookOpen, Music, Award, Heart, Star, Briefcase, FileText } from 'lucide-react';

export const tucasaData = {
  organization: "TUCASA CBE",
  tagline: "Educating for Eternity",
  
  // 1. Daily Programs
  programs: [
    { day: "Monday", title: "Prophecy", desc: "Unveiling the deep truths of the Scriptures and understanding the times.", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { day: "Tuesday", title: "Health Teachings", desc: "Physical and mental wellness guidance based on Adventist health principles.", icon: Heart, color: "bg-green-100 text-green-600" },
    { day: "Wednesday", title: "Prayers", desc: "Mid-week spiritual recharging through intercessory prayer and testimonies.", icon: Star, color: "bg-yellow-100 text-yellow-600" },
    { day: "Thursday", title: "Lifestyle & Development", desc: "Rotational topics: Adventist Lifestyle, Entrepreneurship, or Relationships.", icon: Briefcase, color: "bg-purple-100 text-purple-600" },
    { day: "Friday", title: "Vesper & Sabbath Prep", desc: "Sabbath School lesson review, singing, and preparation for the Holy Sabbath.", icon: Music, color: "bg-indigo-100 text-indigo-600" }
  ],

  // 2. LEADERS (NIMEONGEZA NAMBA ZA SIMU HAPA)
  leaders: [
    { 
      id: 1, 
      role: "Chairperson", 
      name: "Paul Sokoni", 
      phone: "+255712345678", // Weka namba sahihi
      whatsapp: "255712345678", // Weka namba bila alama ya jumlisha (+)
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop" 
    },
    { 
      id: 2, 
      role: "Deputy Chairperson", 
      name: "Lucas Saguda", 
      phone: "+255755123456",
      whatsapp: "255755123456",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&fit=crop" 
    },
    { 
      id: 3, 
      role: "Secretary", 
      name: "Martha Lucas", 
      phone: "+255655123456",
      whatsapp: "255655123456",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&fit=crop" 
    },
    { 
      id: 4, 
      role: "Treasurer", 
      name: "Jesca Justine", 
      phone: "+255713123456",
      whatsapp: "255713123456",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&fit=crop" 
    },
    { 
      id: 5, 
      role: "Spiritual Leader", 
      name: "Mwamisa Juma", 
      phone: "+255784123456",
      whatsapp: "255784123456",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop" 
    }
  ],

  // 3. Daily Verses
  verses: [
    { text: "For I know the plans I have for you, plans to prosper you and not to harm you.", ref: "Jeremiah 29:11" },
    { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" }
  ],

  // 4. Gallery
  gallery: [
    { id: 1, category: "Worship", src: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=800", alt: "Sabbath Worship" },
    { id: 2, category: "Choir", src: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&q=80&w=800", alt: "TUCASA Choir" },
    { id: 3, category: "Social", src: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800", alt: "Students Fellowship" }
  ],

  // 5. Events
  events: [
    { id: 1, title: "TUCASA CBE Retreat 2025", date: "2025-06-15", location: "Kigamboni Beach", desc: "A weekend of spiritual revival.", image: "https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=1000" },
    { id: 2, title: "Health & Nutrition Expo", date: "2025-04-20", location: "CBE Main Hall", desc: "Free checkups and nutrition advice.", image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=1000" }
  ],

  // 6. Resources
  resources: [
    { id: 1, title: "TUCASA Constitution", type: "PDF", size: "2.4 MB", link: "#" },
    { id: 2, title: "Choir Songbook 2025", type: "PDF", size: "5.6 MB", link: "#" }
  ],

  // 7. Testimonials
  testimonials: [
    { id: 1, name: "Baraka Juma", role: "Alumni (2023)", text: "TUCASA CBE was my safe haven. The mid-week prayers gave me strength.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" },
    { id: 2, name: "Sarah M.", role: "3rd Year", text: "The choir members are my second family.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200" }
  ],

  // 8. FAQs
  faqs: [
    { question: "How do I join the Choir?", answer: "Contact the Choir Coordinator or attend Friday Vesper." },
    { question: "Are programs open to all?", answer: "Yes! Everyone is welcome regardless of denomination." }
  ],

  // 9. Songs
  songs: [
    { id: 1, title: "Bwana U Sehemu Yangu", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", category: "Worship" },
    { id: 2, title: "Safari Ya Imani", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", category: "Choir" },
    { id: 3, title: "Tunasonga Mbele", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", category: "Praise" }
  ],

  // 10. Settings
  settings: {
    paymentNumber: "0755 123 456",
    paymentName: "TUCASA TREASURY",
    youtubeLink: "https://youtube.com/@tucasacbe",
    whatsappLink: "https://chat.whatsapp.com/..."
  }
};