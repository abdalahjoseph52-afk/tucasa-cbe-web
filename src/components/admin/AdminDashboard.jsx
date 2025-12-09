import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { uploadImage, uploadFile } from '../../lib/uploadService';
import { useToast } from '../../context/ToastContext';

// ICONS
import { 
  Lock, LogOut, User, Calendar, Trash2, Edit2, Image as ImageIcon, Loader2, 
  Users, FileText, Music, FileAudio, HelpCircle, MessageCircle, BookOpen, 
  Scroll, Settings, Save, X, Download, LayoutDashboard, Plus, UploadCloud, 
  Star, Eye, Phone, MapPin, Link, Mail, Menu, MessageSquare
} from 'lucide-react';

const AdminDashboard = () => {
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // DATA STATES
  const [data, setData] = useState({
    registrations: [], events: [], leaders: [], resources: [], gallery: [], 
    songs: [], programs: [], testimonials: [], faqs: [], verses: [], messages: []
  });

  // UI STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');

  // SETTINGS STATE
  const [settings, setSettings] = useState({
    heroTitle: '', heroSubtitle: '', heroImage: '',
    scheduleDays: '', scheduleTime: '', scheduleVenue: '', 
    email: '', phone: '', location: '', 
    whatsapp: '', instagram: '', tiktok: '', youtube: '', 
    customLinks: [], paymentNumber: '', paymentName: ''
  });
  
  const [featuredSession, setFeaturedSession] = useState({ topic: '', speaker: '', date: '', description: '', image: '' });
  const [authForm, setAuthForm] = useState({ email: '', password: '' });

  // --- INIT ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        const collections = Object.keys(data);
        const unsubs = collections.map(key => 
          onSnapshot(query(collection(db, key), orderBy(key === 'events' ? 'date' : 'createdAt', key === 'programs' ? 'asc' : 'desc')), 
          s => { setData(prev => ({...prev, [key]: s.docs.map(d => ({id: d.id, ...d.data()}))})); }));
        
        getDoc(doc(db, "settings", "general")).then(d => { if(d.exists()) setSettings({ ...d.data(), customLinks: d.data().customLinks || [] }); });
        getDoc(doc(db, "settings", "featuredSession")).then(d => { if(d.exists()) setFeaturedSession(d.data()); });
        
        setIsLoading(false);
        return () => unsubs.forEach(u => u());
      } else { setIsLoading(false); }
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (e) => { e.preventDefault(); setIsSubmitting(true); try { await signInWithEmailAndPassword(auth, authForm.email, authForm.password); success("Umeingia!"); } catch (err) { error("Imeshindikana."); } setIsSubmitting(false); };
  const handleLogout = async () => { await signOut(auth); };

  const handleSave = async (col, fileField = 'image', fileType = 'image') => {
    setIsSubmitting(true);
    try {
      let payload = { ...formData };
      
      // AUTO FORMAT PHONE (0 -> 255)
      if (payload.phone && payload.phone.startsWith('0')) {
        payload.phone = '255' + payload.phone.substring(1);
      }

      if (selectedFile) { setUploadStatus("Uploading..."); payload[fileField] = fileType === 'image' ? await uploadImage(selectedFile) : await uploadFile(selectedFile); }
      if (col === 'songs' && audioFile) { setUploadStatus("Uploading Audio..."); payload.url = await uploadFile(audioFile); }

      if (editingId) { await setDoc(doc(db, col, editingId), payload, { merge: true }); success("Updated!"); } 
      else { await addDoc(collection(db, col), { ...payload, createdAt: serverTimestamp() }); success("Created!"); }
      closeModal();
    } catch (err) { error(err.message); }
    setIsSubmitting(false); setUploadStatus('');
  };

  const openModal = (item = null) => { setFormData(item || {}); setEditingId(item ? item.id : null); setSelectedFile(null); setAudioFile(null); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setFormData({}); setEditingId(null); };
  const deleteItem = async (col, id) => { if(confirm("Futa kabisa?")) await deleteDoc(doc(db, col, id)); };
  
  const handleSettingsSave = async (docName, dataObj) => { 
    setIsSubmitting(true); 
    try { 
      let payload = { ...dataObj }; 
      if (selectedFile) { const url = await uploadImage(selectedFile); if (docName === 'general') payload.heroImage = url; if (docName === 'featuredSession') payload.image = url; }
      await setDoc(doc(db, "settings", docName), payload, { merge: true }); success("Settings Saved!"); setSelectedFile(null);
    } catch(err) { error(err.message); }
    setIsSubmitting(false);
  };
  
  const updateCustomLink = (idx, field, val) => { const newLinks = settings.customLinks.map((link, i) => i === idx ? { ...link, [field]: val } : link); setSettings({...settings, customLinks: newLinks}); };
  const addCustomLink = () => setSettings({ ...settings, customLinks: [...settings.customLinks, { name: '', url: '' }] });
  const removeCustomLink = (idx) => setSettings({...settings, customLinks: settings.customLinks.filter((_, i) => i !== idx)});

  // FIX: ROBUST CSV EXPORT (ALL FIELDS)
  const handleExportMembers = () => {
    if (data.registrations.length === 0) { error("Hakuna members wa kudownload."); return; }
    try {
      const headers = ["FirstName,LastName,RegNo,Phone,Email,Course,Year,Gender,Ministry,HomeChurch,Baptized,DateJoined"];
      const rows = data.registrations.map(r => [
        `"${r.firstName || ''}"`,
        `"${r.lastName || ''}"`,
        `"${r.regNo || ''}"`,
        `"${r.phone ? (r.phone.startsWith('0') ? '255'+r.phone.substring(1) : r.phone) : ''}"`, // Force 255 in export if not already
        `"${r.email || ''}"`,
        `"${r.course || ''}"`,
        `"${r.year || ''}"`,
        `"${r.gender || ''}"`,
        `"${r.ministry || ''}"`,
        `"${r.homeChurch || ''}"`,
        `"${r.baptismStatus || ''}"`,
        `"${r.createdAt ? new Date(r.createdAt.toDate()).toLocaleDateString() : ''}"`
      ].join(","));
      
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `tucasa_members_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      success("CSV imepakuliwa!");
    } catch (err) { error("Export failed: " + err.message); }
  };
  
  const filteredMembers = data.registrations.filter(r => JSON.stringify(r).toLowerCase().includes(memberSearch.toLowerCase()));
  
  const FileInput = ({ label, accept, onChange, file }) => (
    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 cursor-pointer relative bg-white">
      <input type="file" accept={accept} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={e => onChange(e.target.files[0])} />
      <div className="flex flex-col items-center gap-1"><UploadCloud className="text-blue-500" size={20}/><span className="text-xs font-bold text-slate-500 uppercase">{label}</span>{file && <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">{file.name}</span>}</div>
    </div>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div><h1 className="text-xl font-extrabold text-blue-900">TUCASA Admin</h1><p className="text-xs text-slate-500 mt-1 truncate">{user?.email}</p></div>
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 bg-slate-100 rounded-full"><X size={20}/></button>
      </div>
      <nav className="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
        {[{id:'overview',icon:LayoutDashboard, l:'Overview'},{id:'settings',icon:Settings, l:'Settings'},{id:'messages',icon:Mail, l:'Inbox'},{id:'members',icon:User, l:'Members'},{id:'programs',icon:BookOpen, l:'Programs'},{id:'events',icon:Calendar, l:'Events'},{id:'songs',icon:Music, l:'Songs'},{id:'leaders',icon:Users, l:'Leaders'},{id:'verses',icon:Scroll, l:'Manna'},{id:'resources',icon:FileText, l:'Resources'},{id:'gallery',icon:ImageIcon, l:'Gallery'},{id:'testimonials',icon:MessageCircle, l:'Testimonies'},{id:'faqs',icon:HelpCircle, l:'FAQs'}].map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setIsMobileMenuOpen(false); window.scrollTo(0,0); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === t.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}><t.icon size={18}/> {t.l}</button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100"><button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"><LogOut size={18}/> Sign Out</button></div>
    </div>
  );

  const renderFormContent = () => {
    switch (activeTab) {
      case 'events': return (<><input className="w-full p-4 border rounded-xl" placeholder="Title" value={formData.title||''} onChange={e=>setFormData({...formData, title:e.target.value})}/><div className="grid grid-cols-2 gap-3"><input type="date" className="p-4 border rounded-xl" value={formData.date||''} onChange={e=>setFormData({...formData, date:e.target.value})}/><input type="time" className="p-4 border rounded-xl" value={formData.time||''} onChange={e=>setFormData({...formData, time:e.target.value})}/></div><input className="w-full p-4 border rounded-xl" placeholder="Location" value={formData.location||''} onChange={e=>setFormData({...formData, location:e.target.value})}/><textarea className="w-full p-4 border rounded-xl" rows="3" placeholder="Description" value={formData.description||''} onChange={e=>setFormData({...formData, description:e.target.value})}/><FileInput label="Event Image (Optional)" accept="image/*" onChange={setSelectedFile} file={selectedFile}/></>);
      case 'leaders': return (<><input className="w-full p-4 border rounded-xl" placeholder="Name" value={formData.name||''} onChange={e=>setFormData({...formData, name:e.target.value})}/><input className="w-full p-4 border rounded-xl" placeholder="Role" value={formData.role||''} onChange={e=>setFormData({...formData, role:e.target.value})}/><input className="w-full p-4 border rounded-xl" placeholder="Phone" value={formData.phone||''} onChange={e=>setFormData({...formData, phone:e.target.value})}/><input className="w-full p-4 border rounded-xl" placeholder="WhatsApp Link" value={formData.whatsapp||''} onChange={e=>setFormData({...formData, whatsapp:e.target.value})}/><FileInput label="Profile Photo" accept="image/*" onChange={setSelectedFile} file={selectedFile}/></>);
      case 'songs': return (<><input className="w-full p-4 border rounded-xl" placeholder="Song Title" value={formData.title||''} onChange={e=>setFormData({...formData, title:e.target.value})}/><input className="w-full p-4 border rounded-xl" placeholder="Artist Name" value={formData.artist||''} onChange={e=>setFormData({...formData, artist:e.target.value})}/><FileInput label="1. MP3 Audio" accept="audio/*" onChange={setAudioFile} file={audioFile}/><FileInput label="2. Cover Art" accept="image/*" onChange={setSelectedFile} file={selectedFile}/></>);
      case 'programs': return (<><div className="grid grid-cols-2 gap-3"><input className="p-4 border rounded-xl" placeholder="Day (Mon)" value={formData.day||''} onChange={e=>setFormData({...formData, day:e.target.value})}/><input className="p-4 border rounded-xl" placeholder="Title" value={formData.title||''} onChange={e=>setFormData({...formData, title:e.target.value})}/></div><textarea className="w-full p-4 border rounded-xl" placeholder="Description" rows="2" value={formData.desc||''} onChange={e=>setFormData({...formData, desc:e.target.value})}/></>);
      case 'verses': return (<><textarea className="w-full p-4 border rounded-xl" placeholder="Verse Text" rows="3" value={formData.text||''} onChange={e=>setFormData({...formData, text:e.target.value})}/><input className="w-full p-4 border rounded-xl" placeholder="Reference" value={formData.ref||''} onChange={e=>setFormData({...formData, ref:e.target.value})}/><FileInput label="Background Image" accept="image/*" onChange={setSelectedFile} file={selectedFile}/></>);
      case 'resources': return (<><input className="w-full p-4 border rounded-xl" placeholder="Title" value={formData.title||''} onChange={e=>setFormData({...formData, title:e.target.value})}/><FileInput label="PDF File" accept=".pdf,.doc" onChange={setSelectedFile} file={selectedFile}/></>);
      case 'gallery': return (<><input className="w-full p-4 border rounded-xl" placeholder="Caption (Description)" value={formData.caption||''} onChange={e=>setFormData({...formData, caption:e.target.value})}/><FileInput label="Photo" accept="image/*" onChange={setSelectedFile} file={selectedFile}/></>);
      case 'testimonials': return (<><input className="w-full p-4 border rounded-xl" placeholder="Name" value={formData.name||''} onChange={e=>setFormData({...formData, name:e.target.value})}/><input className="w-full p-4 border rounded-xl" placeholder="Role" value={formData.role||''} onChange={e=>setFormData({...formData, role:e.target.value})}/><textarea className="w-full p-4 border rounded-xl" placeholder="Story" rows="3" value={formData.text||''} onChange={e=>setFormData({...formData, text:e.target.value})}/><FileInput label="Photo" accept="image/*" onChange={setSelectedFile} file={selectedFile}/></>);
      case 'faqs': return (<><input className="w-full p-4 border rounded-xl" placeholder="Question" value={formData.question||''} onChange={e=>setFormData({...formData, question:e.target.value})}/><textarea className="w-full p-4 border rounded-xl" placeholder="Answer" rows="3" value={formData.answer||''} onChange={e=>setFormData({...formData, answer:e.target.value})}/></>);
      default: return null;
    }
  };

  if (!user) return (<div className="min-h-screen flex items-center justify-center bg-slate-100 p-4"><div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200"><h2 className="text-2xl font-extrabold text-center text-slate-900 mb-6">Admin Portal</h2><form onSubmit={handleLogin} className="space-y-4"><input className="w-full p-4 border rounded-xl" placeholder="Email" value={authForm.email} onChange={e=>setAuthForm({...authForm, email:e.target.value})}/><input className="w-full p-4 border rounded-xl" type="password" placeholder="Password" value={authForm.password} onChange={e=>setAuthForm({...authForm, password:e.target.value})}/><button disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">{isSubmitting ? '...' : 'Login'}</button></form></div></div>);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      <aside className="hidden md:block w-64 bg-white border-r border-slate-200 flex-shrink-0 h-screen sticky top-0 overflow-y-auto z-10"><SidebarContent /></aside>
      {isMobileMenuOpen && (<div className="md:hidden fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)}><div className="w-3/4 h-full bg-white shadow-2xl animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}><SidebarContent /></div></div>)}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white border-b z-40 px-4 py-3 flex justify-between items-center shadow-sm"><div className="flex items-center gap-3"><button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600"><Menu size={24}/></button><h1 className="font-extrabold text-lg text-blue-900 truncate">Admin</h1></div><div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full capitalize">{activeTab}</div></div>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-32 md:pb-8 pt-20 md:pt-8">
        {isLoading && (<div className="text-center py-24"><Loader2 size={40} className="text-blue-600 animate-spin mx-auto"/></div>)}

        {!isLoading && activeTab !== 'overview' && activeTab !== 'settings' && activeTab !== 'messages' && activeTab !== 'members' && (
          <div className="flex justify-between items-center mb-6 sticky top-16 md:top-0 bg-slate-50 z-30 py-2"><h2 className="text-2xl font-bold capitalize hidden md:block">{activeTab}</h2><button onClick={() => openModal()} className="w-full md:w-auto bg-blue-600 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-blue-700 active:scale-95 transition-all"><Plus size={20}/> <span className="hidden md:inline">Add New</span></button></div>
        )}

        {/* LISTS */}
        {!isLoading && ['events', 'songs', 'programs', 'leaders', 'resources', 'gallery', 'testimonials', 'faqs', 'verses'].includes(activeTab) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data[activeTab].map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div className="mb-4">{(item.image || item.cover || item.src) && <img src={item.image || item.cover || item.src} className="w-full h-32 object-cover rounded-xl mb-3 bg-slate-100"/>}<h4 className="font-bold text-lg text-slate-900 line-clamp-1">{item.title || item.name || item.text || item.question || item.caption || "Item"}</h4><p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description || item.desc || item.role || item.answer || item.ref}</p></div>
                <div className="flex gap-2 pt-3 border-t border-slate-50"><button onClick={() => openModal(item)} className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1 active:bg-blue-100"><Edit2 size={16}/> Edit</button><button onClick={() => deleteItem(activeTab, item.id)} className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1 active:bg-red-100"><Trash2 size={16}/> Delete</button></div>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS */}
        {!isLoading && activeTab === 'settings' && (
          <div className="max-w-4xl space-y-6">
            <div className="grid md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="font-bold text-lg mb-4 text-blue-900">General</h3><div className="space-y-4"><input className="w-full p-4 border rounded-xl mb-3 bg-slate-50" placeholder="Hero Title" value={settings.heroTitle} onChange={e=>setSettings({...settings, heroTitle:e.target.value})} /><textarea className="w-full p-4 border rounded-xl bg-slate-50" placeholder="Hero Subtitle" value={settings.heroSubtitle} onChange={e=>setSettings({...settings, heroSubtitle:e.target.value})} /><FileInput label="Hero Background Image" accept="image/*" onChange={setSelectedFile} file={selectedFile} /></div></div><div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="font-bold text-lg mb-4 text-blue-900">Contacts & Schedule</h3><div className="grid grid-cols-2 gap-4 mb-4"><input className="p-4 border rounded-xl bg-slate-50" placeholder="Email" value={settings.email} onChange={e=>setSettings({...settings, email:e.target.value})} /><input className="p-4 border rounded-xl bg-slate-50" placeholder="Phone" value={settings.phone} onChange={e=>setSettings({...settings, phone:e.target.value})} /></div><input className="w-full p-4 border rounded-xl mb-4 bg-slate-50" placeholder="Physical Location" value={settings.location} onChange={e=>setSettings({...settings, location:e.target.value})} /><div className="grid grid-cols-3 gap-3"><input className="p-4 border rounded-xl bg-slate-50" placeholder="Days" value={settings.scheduleDays} onChange={e=>setSettings({...settings, scheduleDays:e.target.value})} /><input className="p-4 border rounded-xl bg-slate-50" placeholder="Time" value={settings.scheduleTime} onChange={e=>setSettings({...settings, scheduleTime:e.target.value})} /><input className="p-4 border rounded-xl bg-slate-50" placeholder="Venue" value={settings.scheduleVenue} onChange={e=>setSettings({...settings, scheduleVenue:e.target.value})} /></div></div></div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="font-bold text-lg mb-4 text-blue-900">Social & Links</h3><div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4"><input className="p-4 border rounded-xl bg-slate-50" placeholder="WhatsApp" value={settings.whatsapp} onChange={e=>setSettings({...settings, whatsapp:e.target.value})} /><input className="p-4 border rounded-xl bg-slate-50" placeholder="YouTube" value={settings.youtube} onChange={e=>setSettings({...settings, youtube:e.target.value})} /><input className="p-4 border rounded-xl bg-slate-50" placeholder="Instagram" value={settings.instagram} onChange={e=>setSettings({...settings, instagram:e.target.value})} /><input className="p-4 border rounded-xl bg-slate-50" placeholder="TikTok" value={settings.tiktok} onChange={e=>setSettings({...settings, tiktok:e.target.value})} /></div><div className="space-y-3 border-t pt-4"><label className="text-xs font-bold text-slate-500 uppercase">Footer Links</label>{settings.customLinks.map((link, i) => (<div key={i} className="flex gap-2"><input className="w-1/3 p-3 border rounded-xl text-sm bg-slate-50" placeholder="Name" value={link.name} onChange={e => updateCustomLink(i, 'name', e.target.value)} /><input className="flex-1 p-3 border rounded-xl text-sm bg-slate-50" placeholder="URL" value={link.url} onChange={e => updateCustomLink(i, 'url', e.target.value)} /><button onClick={() => removeCustomLink(i)} className="p-3 text-red-600 bg-red-50 rounded-xl"><Trash2 size={18}/></button></div>))}<button onClick={addCustomLink} className="text-sm font-bold text-blue-600 flex items-center gap-1 p-2 hover:bg-blue-50 rounded-lg"><Plus size={16}/> Add Link</button></div></div>
            <button disabled={isSubmitting} onClick={() => handleSettingsSave('general', settings)} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg mb-12">{isSubmitting ? 'Saving...' : 'Save All Settings'}</button>
          </div>
        )}

        {/* MESSAGES */}
        {!isLoading && activeTab === 'messages' && (
            <div className="space-y-4">
                {data.messages.length === 0 ? <p className="text-center text-slate-500 py-10">No messages yet.</p> : data.messages.map(msg => (
                    <div key={msg.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2"><div><h4 className="font-bold text-slate-900">{msg.name}</h4><div className="text-xs text-slate-500">{msg.email}</div></div><span className="text-xs text-slate-400">{msg.createdAt ? new Date(msg.createdAt.toDate()).toLocaleDateString() : ''}</span></div>
                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl mb-3">{msg.message}</p>
                        <div className="flex gap-2 justify-between items-center"><div className="flex gap-2">{msg.phone && <a href={`tel:${msg.phone}`} className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold hover:bg-green-100"><Phone size={14}/> Call</a>}{msg.phone && <a href={`https://wa.me/${msg.phone}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100"><MessageSquare size={14}/> WhatsApp</a>}</div><button onClick={() => deleteItem('messages', msg.id)} className="text-red-500 text-xs font-bold hover:bg-red-50 px-2 py-1 rounded">Delete</button></div>
                    </div>
                ))}
            </div>
        )}

        {/* MEMBERS - FIXED VIEW DETAILS & EXPORT */}
        {!isLoading && activeTab === 'members' && (<div className="bg-white rounded-2xl border overflow-hidden"><div className="p-4 border-b flex justify-between bg-slate-50/50"><input placeholder="Search..." className="border p-2 rounded-lg w-full md:w-64" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} /><button onClick={handleExportMembers} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1"><Download size={16}/> CSV</button></div><div className="w-full overflow-x-auto"><table className="w-full text-left text-sm min-w-[800px]"><thead className="bg-slate-50 text-slate-500 uppercase"><tr><th className="p-4">Name</th><th className="p-4">Phone</th><th className="p-4">Ministry</th><th className="p-4">Joined</th><th className="p-4 text-right">Action</th></tr></thead><tbody>{filteredMembers.map(r => (<tr key={r.id} className="border-t hover:bg-slate-50"><td className="p-4 font-bold">{r.firstName} {r.lastName}</td><td className="p-4">{r.phone}</td><td className="p-4">{r.ministry}</td><td className="p-4 text-slate-500">{r.createdAt?.toDate().toLocaleDateString()}</td><td className="p-4 text-right flex justify-end gap-2"><button onClick={() => setSelectedMember(r)} className="p-2 bg-blue-50 text-blue-600 rounded"><Eye size={16}/></button><button onClick={() => deleteItem('registrations', r.id)} className="p-2 bg-red-50 text-red-600 rounded"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div></div>)}

        {/* OVERVIEW */}
        {!isLoading && activeTab === 'overview' && (<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{['registrations', 'events', 'songs', 'messages'].map(key => (<div key={key} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="text-xs font-bold uppercase mb-2 text-slate-500">{key}</h3><p className="text-3xl font-extrabold text-blue-900">{data[key].length}</p></div>))}</div>)}

        {/* FULL SCREEN MODAL */}
        {isModalOpen && (<div className="fixed inset-0 z-[400] bg-slate-900/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in zoom-in duration-200" onClick={closeModal}><div className="bg-white w-full h-full md:h-auto md:max-h-[85vh] md:max-w-lg md:rounded-3xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}><div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10"><h3 className="font-extrabold text-xl text-slate-900 capitalize">{editingId ? 'Edit' : 'New'} {activeTab.slice(0, -1)}</h3><button onClick={closeModal} className="p-2 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"><X size={24}/></button></div><div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">{renderFormContent()}</div><div className="p-4 md:p-6 border-t border-slate-100 bg-white sticky bottom-0 z-10 safe-area-pb"><button disabled={isSubmitting} onClick={() => handleSave(activeTab, activeTab === 'resources' ? 'link' : activeTab === 'gallery' ? 'src' : activeTab === 'songs' ? 'cover' : 'image', activeTab === 'resources' ? 'file' : 'image')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">{isSubmitting ? <><Loader2 className="animate-spin" size={24}/> Processing...</> : "Save Changes"}</button></div></div></div>)}

        {/* VIEW MEMBER DETAILS MODAL (HAPA NDIPO TAARIFA ZOTE ZINAPOONEKANA) */}
        {selectedMember && (
          <div className="fixed inset-0 z-[500] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setSelectedMember(null)}>
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="bg-blue-900 p-6 text-white flex justify-between items-center">
                <div><h3 className="text-xl font-bold">{selectedMember.firstName} {selectedMember.lastName}</h3><p className="text-blue-200 text-sm font-mono">{selectedMember.regNo}</p></div>
                <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-white/20 rounded-full"><X/></button>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4 bg-slate-50 max-h-[70vh] overflow-y-auto">
                <div className="bg-white p-3 rounded-xl border border-slate-100"><span className="text-xs text-slate-400 font-bold uppercase block mb-1">Phone</span>{selectedMember.phone}</div>
                <div className="bg-white p-3 rounded-xl border border-slate-100"><span className="text-xs text-slate-400 font-bold uppercase block mb-1">Gender</span>{selectedMember.gender}</div>
                <div className="bg-white p-3 rounded-xl border border-slate-100"><span className="text-xs text-slate-400 font-bold uppercase block mb-1">Course</span>{selectedMember.course}</div>
                <div className="bg-white p-3 rounded-xl border border-slate-100"><span className="text-xs text-slate-400 font-bold uppercase block mb-1">Year</span>{selectedMember.year}</div>
                <div className="bg-white p-3 rounded-xl border border-slate-100"><span className="text-xs text-slate-400 font-bold uppercase block mb-1">Email</span>{selectedMember.email}</div>
                <div className="bg-white p-3 rounded-xl border border-slate-100"><span className="text-xs text-slate-400 font-bold uppercase block mb-1">Ministry</span>{selectedMember.ministry}</div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 col-span-2"><span className="text-xs text-slate-400 font-bold uppercase block mb-1">Home Church</span>{selectedMember.homeChurch}</div>
                <div className="bg-white p-3 rounded-xl border border-slate-100"><span className="text-xs text-slate-400 font-bold uppercase block mb-1">Baptized</span>{selectedMember.baptismStatus}</div>
                <div className="bg-white p-3 rounded-xl border border-slate-100"><span className="text-xs text-slate-400 font-bold uppercase block mb-1">Date Joined</span>{selectedMember.createdAt?.toDate().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;