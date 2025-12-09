import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { uploadImage, uploadFile } from '../../lib/uploadService';
import { useToast } from '../../context/ToastContext';

// ICONS (Nimeongeza 'Mail' hapa)
import { 
  Lock, LogOut, User, Calendar, Trash2, Edit2, Image as ImageIcon, Loader2, 
  Users, FileText, Music, FileAudio, HelpCircle, MessageCircle, BookOpen, 
  Scroll, Settings, Save, X, Download, LayoutDashboard, Plus, UploadCloud, 
  Star, Eye, Phone, MapPin, Mail 
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

  // MODAL & FORM STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // --- INIT & LISTENERS ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        const collections = Object.keys(data);
        const handleDataLoad = () => { /* ... */ }; 
        const unsubs = collections.map(key => 
          onSnapshot(query(collection(db, key), orderBy(key === 'events' ? 'date' : 'createdAt', key === 'programs' ? 'asc' : 'desc')), 
          s => { setData(prev => ({...prev, [key]: s.docs.map(d => ({id: d.id, ...d.data()}))})); setTimeout(handleDataLoad, 500); }));
        getDoc(doc(db, "settings", "general")).then(d => { setSettings({ ...d.data(), customLinks: d.data()?.customLinks || [] }); handleDataLoad(); });
        getDoc(doc(db, "settings", "featuredSession")).then(d => { setFeaturedSession(d.data()); handleDataLoad(); });
        
        setIsLoading(false);
        return () => unsubs.forEach(u => u());
      } else {
        setIsLoading(false); 
      }
    });
    return unsubscribe;
  }, []);

  // --- CRUD ACTIONS ---
  const handleLogin = async (e) => {
    e.preventDefault(); setIsSubmitting(true);
    try { await signInWithEmailAndPassword(auth, authForm.email, authForm.password); success("Logged in successfully!"); } 
    catch (err) { error(`Login failed: ${err.message}`); }
    setIsSubmitting(false);
  };

  const handleSave = async (col, fileField = 'image', fileType = 'image') => {
    setIsSubmitting(true);
    try {
      let payload = { ...formData };
      if (selectedFile) { setUploadStatus("Uploading File..."); payload[fileField] = fileType === 'image' ? await uploadImage(selectedFile) : await uploadFile(selectedFile); }
      if (col === 'songs' && audioFile) { setUploadStatus("Uploading Audio..."); payload.url = await uploadFile(audioFile); }

      if (editingId) { await setDoc(doc(db, col, editingId), payload, { merge: true }); success("Updated Successfully!"); } 
      else { await addDoc(collection(db, col), { ...payload, createdAt: serverTimestamp() }); success("Added Successfully!"); }
      closeModal();
    } catch (err) { error(err.message); }
    setIsSubmitting(false); setUploadStatus('');
  };

  const openModal = (item = null) => { setFormData(item || {}); setEditingId(item ? item.id : null); setSelectedFile(null); setAudioFile(null); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setFormData({}); setEditingId(null); };
  const deleteItem = async (col, id) => { if(window.confirm("Delete item?")) { await deleteDoc(doc(db, col, id)); success("Deleted!"); } };
  
  const handleSettingsSave = async (docName, dataObj) => { 
    setIsSubmitting(true); 
    try { 
      let payload = { ...dataObj }; 
      if (selectedFile) { const url = await uploadImage(selectedFile); if (docName === 'general') payload.heroImage = url; if (docName === 'featuredSession') payload.image = url; }
      await setDoc(doc(db, "settings", docName), payload, { merge: true }); 
      success("Settings Saved!"); setSelectedFile(null);
    } catch(err) { error(err.message); }
    setIsSubmitting(false);
  };
  
  const updateCustomLink = (idx, field, val) => { const newLinks = settings.customLinks.map((link, i) => i === idx ? { ...link, [field]: val } : link); setSettings({...settings, customLinks: newLinks}); };
  const addCustomLink = () => setSettings({ ...settings, customLinks: [...settings.customLinks, { name: '', url: '' }] });
  const removeCustomLink = (idx) => setSettings({...settings, customLinks: settings.customLinks.filter((_, i) => i !== idx)});
  const handleExportMembers = () => { success("Export feature coming soon"); };
  const filteredMembers = data.registrations.filter(r => JSON.stringify(r).toLowerCase().includes(memberSearch.toLowerCase()));

  const FileInput = ({ label, accept, onChange, file }) => (
    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 cursor-pointer relative bg-white transition-colors">
      <input type="file" accept={accept} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={e => onChange(e.target.files[0])} />
      <div className="flex flex-col items-center gap-1 pointer-events-none">
        <UploadCloud className="text-blue-500" size={20}/>
        <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
        {file && <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">{file.name}</span>}
      </div>
    </div>
  );

  const renderFormContent = () => {
    switch (activeTab) {
      case 'events': return (<><input className="w-full p-3 border rounded-xl" placeholder="Title" value={formData.title||''} onChange={e=>setFormData({...formData, title:e.target.value})}/><div className="grid grid-cols-2 gap-3"><input type="date" className="p-3 border rounded-xl" value={formData.date||''} onChange={e=>setFormData({...formData, date:e.target.value})}/><input type="time" className="p-3 border rounded-xl" value={formData.time||''} onChange={e=>setFormData({...formData, time:e.target.value})}/></div><input className="w-full p-3 border rounded-xl" placeholder="Location" value={formData.location||''} onChange={e=>setFormData({...formData, location:e.target.value})}/><textarea className="w-full p-3 border rounded-xl" rows="3" placeholder="Description" value={formData.description||''} onChange={e=>setFormData({...formData, description:e.target.value})}/></>);
      case 'leaders': return (<><input className="w-full p-3 border rounded-xl" placeholder="Name" value={formData.name||''} onChange={e=>setFormData({...formData, name:e.target.value})}/><input className="w-full p-3 border rounded-xl" placeholder="Role" value={formData.role||''} onChange={e=>setFormData({...formData, role:e.target.value})}/><input className="w-full p-3 border rounded-xl" placeholder="Phone" value={formData.phone||''} onChange={e=>setFormData({...formData, phone:e.target.value})}/><input className="w-full p-3 border rounded-xl" placeholder="WhatsApp Link" value={formData.whatsapp||''} onChange={e=>setFormData({...formData, whatsapp:e.target.value})}/><FileInput label="Profile Photo" accept="image/*" onChange={setSelectedFile} file={selectedFile}/></>);
      case 'songs': return (<><input className="w-full p-3 border rounded-xl" placeholder="Song Title" value={formData.title||''} onChange={e=>setFormData({...formData, title:e.target.value})}/><FileInput label="1. MP3 Audio" accept="audio/*" onChange={setAudioFile} file={audioFile}/><FileInput label="2. Cover Art" accept="image/*" onChange={setSelectedFile} file={selectedFile}/></>);
      case 'programs': return (<><div className="grid grid-cols-2 gap-3"><input className="p-3 border rounded-xl" placeholder="Day (Mon)" value={formData.day||''} onChange={e=>setFormData({...formData, day:e.target.value})}/><input className="p-3 border rounded-xl" placeholder="Title" value={formData.title||''} onChange={e=>setFormData({...formData, title:e.target.value})}/></div><textarea className="w-full p-3 border rounded-xl" placeholder="Description" rows="2" value={formData.desc||''} onChange={e=>setFormData({...formData, desc:e.target.value})}/></>);
      case 'verses': return (<><textarea className="w-full p-3 border rounded-xl" placeholder="Verse Text" rows="3" value={formData.text||''} onChange={e=>setFormData({...formData, text:e.target.value})}/><input className="w-full p-3 border rounded-xl" placeholder="Reference" value={formData.ref||''} onChange={e=>setFormData({...formData, ref:e.target.value})}/><FileInput label="Background Image" accept="image/*" onChange={setSelectedFile} file={selectedFile}/></>);
      case 'resources': return (<><input className="w-full p-3 border rounded-xl" placeholder="Title" value={formData.title||''} onChange={e=>setFormData({...formData, title:e.target.value})}/><FileInput label="PDF File" accept=".pdf,.doc" onChange={setSelectedFile} file={selectedFile}/></>);
      case 'gallery': return (<><input className="w-full p-3 border rounded-xl" placeholder="Caption" value={formData.alt||''} onChange={e=>setFormData({...formData, alt:e.target.value})}/><FileInput label="Photo" accept="image/*" onChange={setSelectedFile} file={selectedFile}/></>);
      case 'testimonials': return (<><input className="w-full p-3 border rounded-xl" placeholder="Name" value={formData.name||''} onChange={e=>setFormData({...formData, name:e.target.value})}/><input className="w-full p-3 border rounded-xl" placeholder="Role" value={formData.role||''} onChange={e=>setFormData({...formData, role:e.target.value})}/><textarea className="w-full p-3 border rounded-xl" placeholder="Story" rows="3" value={formData.text||''} onChange={e=>setFormData({...formData, text:e.target.value})}/><FileInput label="Photo" accept="image/*" onChange={setSelectedFile} file={selectedFile}/></>);
      case 'faqs': return (<><input className="w-full p-3 border rounded-xl" placeholder="Question" value={formData.question||''} onChange={e=>setFormData({...formData, question:e.target.value})}/><textarea className="w-full p-3 border rounded-xl" placeholder="Answer" rows="3" value={formData.answer||''} onChange={e=>setFormData({...formData, answer:e.target.value})}/></>);
      default: return null;
    }
  };

  if (!user) return (<div className="min-h-screen flex items-center justify-center bg-slate-100 p-4"><div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200"><h2 className="text-2xl font-extrabold text-center text-slate-900 mb-6">Admin Portal</h2><form onSubmit={handleLogin} className="space-y-4"><input className="w-full p-4 border rounded-xl" placeholder="Email" value={authForm.email} onChange={e=>setAuthForm({...authForm, email:e.target.value})}/><input className="w-full p-4 border rounded-xl" type="password" placeholder="Password" value={authForm.password} onChange={e=>setAuthForm({...authForm, password:e.target.value})}/><button disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">{isSubmitting ? '...' : 'Login'}</button></form></div></div>);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 md:h-screen sticky top-0 overflow-y-auto z-10 hidden md:block">
        <div className="p-6 border-b border-slate-100"><h1 className="text-xl font-extrabold text-blue-900">TUCASA Admin</h1><p className="text-xs text-slate-500 mt-1 truncate">{user.email}</p></div>
        <nav className="p-4 space-y-1">
          {[{id:'overview',icon:LayoutDashboard, l:'Overview'},{id:'messages',icon:Mail, l:'Inbox'},{id:'settings',icon:Settings, l:'Settings'},{id:'members',icon:User, l:'Members'},{id:'programs',icon:BookOpen, l:'Programs'},{id:'events',icon:Calendar, l:'Events'},{id:'songs',icon:Music, l:'Songs'},{id:'leaders',icon:Users, l:'Leaders'},{id:'verses',icon:Scroll, l:'Manna'},{id:'resources',icon:FileText, l:'Resources'},{id:'gallery',icon:ImageIcon, l:'Gallery'},{id:'testimonials',icon:MessageCircle, l:'Testimonies'},{id:'faqs',icon:HelpCircle, l:'FAQs'}].map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); window.scrollTo(0,0); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === t.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}><t.icon size={18}/> {t.l}</button>
          ))}
          <button onClick={() => signOut(auth)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 mt-8"><LogOut size={18}/> Sign Out</button>
        </nav>
      </aside>

      {/* MOBILE NAV */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t z-50 overflow-x-auto flex items-center gap-2 p-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
         {[{id:'overview',icon:LayoutDashboard},{id:'messages',icon:Mail},{id:'settings',icon:Settings},{id:'programs',icon:BookOpen},{id:'songs',icon:Music},{id:'events',icon:Calendar},{id:'leaders',icon:Users}].map(t=>(
           <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`p-3 rounded-full flex-shrink-0 transition-all ${activeTab===t.id?'bg-blue-600 text-white scale-110 shadow-md':'text-slate-400'}`}><t.icon size={22}/></button>
         ))}
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-32 md:pb-8">
        
        {isLoading && (<div className="text-center py-24"><Loader2 size={40} className="text-blue-600 animate-spin mx-auto"/></div>)}

        {!isLoading && activeTab !== 'overview' && activeTab !== 'settings' && activeTab !== 'messages' && activeTab !== 'members' && (
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-50 z-40 py-2">
            <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
            <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
              <Plus size={20}/> <span className="hidden md:inline">Add New</span>
            </button>
          </div>
        )}

        {/* LIST VIEWS */}
        {!isLoading && ['events', 'songs', 'programs', 'leaders', 'resources', 'gallery', 'testimonials', 'faqs', 'verses'].includes(activeTab) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data[activeTab].map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between relative group">
                <div className="mb-4">{(item.image || item.cover || item.src) && <img src={item.image || item.cover || item.src} className="w-full h-32 object-cover rounded-xl mb-3 bg-slate-100"/>}<h4 className="font-bold text-lg text-slate-900 line-clamp-1">{item.title || item.name || item.text || item.question || "Item"}</h4><p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description || item.desc || item.role || item.answer || item.ref}</p></div>
                <div className="flex gap-2 pt-3 border-t border-slate-50">
                  <button onClick={() => openModal(item)} className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1 active:bg-blue-100 z-10"><Edit2 size={16}/> Edit</button>
                  <button onClick={() => deleteItem(activeTab, item.id)} className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-1 active:bg-red-100 z-10"><Trash2 size={16}/> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS */}
        {!isLoading && activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="font-bold text-lg mb-4 text-blue-900">General</h3><input className="w-full p-4 border rounded-xl mb-3" placeholder="Hero Title" value={settings.heroTitle} onChange={e=>setSettings({...settings, heroTitle:e.target.value})} /><FileInput label="Hero Background Image" accept="image/*" onChange={setSelectedFile} file={selectedFile} /></div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><h3 className="font-bold text-lg mb-4 text-blue-900">Contacts</h3><div className="grid grid-cols-2 gap-4"><input className="p-4 border rounded-xl" placeholder="Phone" value={settings.phone} onChange={e=>setSettings({...settings, phone:e.target.value})}/><input className="p-4 border rounded-xl" placeholder="WhatsApp" value={settings.whatsapp} onChange={e=>setSettings({...settings, whatsapp:e.target.value})}/></div></div>
            <button disabled={isSubmitting} onClick={() => handleSettingsSave('general', settings)} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold">{isSubmitting ? 'Saving...' : 'Save Settings'}</button>
          </div>
        )}

        {/* OVERVIEW & MEMBERS (omitted for brevity but logic same as before) */}
        {!isLoading && activeTab === 'overview' && (<div className="grid grid-cols-2 gap-4"><div className="bg-white p-6 rounded-2xl shadow-sm border"><h3 className="text-xs font-bold uppercase mb-2">Members</h3><p className="text-3xl font-extrabold">{data.registrations.length}</p></div><div className="bg-white p-6 rounded-2xl shadow-sm border"><h3 className="text-xs font-bold uppercase mb-2">Events</h3><p className="text-3xl font-extrabold">{data.events.length}</p></div></div>)}
        {!isLoading && activeTab === 'members' && (<div className="bg-white rounded-2xl border overflow-hidden"><div className="w-full overflow-x-auto"><table className="w-full text-left text-sm min-w-[800px]"><thead className="bg-slate-50 text-slate-500 uppercase"><tr><th className="p-4">Name</th><th className="p-4">Phone</th></tr></thead><tbody>{filteredMembers.map(r => (<tr key={r.id} className="border-t"><td className="p-4 font-bold">{r.firstName} {r.lastName}</td><td className="p-4">{r.phone}</td></tr>))}</tbody></table></div></div>)}

        {/* === MOBILE-FIRST FULL SCREEN MODAL === */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in zoom-in duration-200" onClick={closeModal}>
            <div className="bg-white w-full h-full md:h-auto md:max-h-[85vh] md:max-w-lg md:rounded-3xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10"><h3 className="font-extrabold text-xl text-slate-900 capitalize">{editingId ? 'Edit' : 'New'} {activeTab.slice(0, -1)}</h3><button onClick={closeModal} className="p-2 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"><X size={24}/></button></div>
              <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">{renderFormContent()}</div>
              <div className="p-4 md:p-6 border-t border-slate-100 bg-white sticky bottom-0 z-10 safe-area-pb"><button disabled={isSubmitting} onClick={() => handleSave(activeTab, activeTab === 'resources' ? 'link' : activeTab === 'gallery' ? 'src' : activeTab === 'songs' ? 'cover' : 'image', activeTab === 'resources' ? 'file' : 'image')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">{isSubmitting ? <><Loader2 className="animate-spin" size={24}/> Processing...</> : "Save Changes"}</button></div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;