import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { uploadImage, uploadFile } from '../../lib/uploadService';
import { useToast } from '../../context/ToastContext'; // Feedback System

// ICONS
import { 
  Lock, LogOut, User, Calendar, Trash2, Edit2, Image as ImageIcon, Loader2, 
  Users, FileText, Music, FileAudio, HelpCircle, MessageCircle, BookOpen, 
  Scroll, Settings, Save, Instagram, Video, Youtube, DollarSign, Mail, 
  Layout, Link as LinkIcon, X, Clock, MapPin, Mic, 
  Star, Eye, Search, Download, LayoutDashboard, Plus, UploadCloud
} from 'lucide-react';

const AdminDashboard = () => {
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  // DATA STATES
  const [data, setData] = useState({
    registrations: [], events: [], leaders: [], resources: [], gallery: [], 
    songs: [], programs: [], testimonials: [], faqs: [], verses: [], messages: []
  });

  // FORM STATES
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  // SETTINGS STATE
  const [settings, setSettings] = useState({
    heroTitle: '', heroSubtitle: '', heroImage: '',
    scheduleDays: '', scheduleTime: '', scheduleVenue: '',
    email: '', phone: '', location: '', 
    whatsapp: '', instagram: '', tiktok: '', youtube: '', 
    customLinks: [], paymentNumber: '', paymentName: ''
  });
  
  const [featuredSession, setFeaturedSession] = useState({ topic: '', speaker: '', date: '', description: '', image: '' });

  // AUTH STATE
  const [authForm, setAuthForm] = useState({ email: '', password: '' });

  // GENERIC FORM STATE (Hii inabeba data za fomu yoyote unayojaza)
  const [formData, setFormData] = useState({});

  // --- INITIALIZATION ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        // Load all collections
        const collections = Object.keys(data);
        const unsubs = collections.map(key => 
          onSnapshot(query(collection(db, key === 'programs' ? 'programs' : key === 'events' ? 'events' : key), orderBy(key === 'events' ? 'date' : 'createdAt', key === 'programs' ? 'asc' : key === 'events' ? 'asc' : 'desc')), 
          s => setData(prev => ({...prev, [key]: s.docs.map(d => ({id: d.id, ...d.data()}))})))
        );
        // Load Settings
        getDoc(doc(db, "settings", "general")).then(d => d.exists() && setSettings({ ...d.data(), customLinks: d.data().customLinks || [] }));
        getDoc(doc(db, "settings", "featuredSession")).then(d => d.exists() && setFeaturedSession(d.data()));
        return () => unsubs.forEach(u => u());
      }
    });
    return unsubscribe;
  }, []);

  // --- ACTIONS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      success("Karibu Admin!");
    } catch (err) {
      error("Imeshindikana. Angalia email na password.");
    }
    setIsSubmitting(false);
  };

  const handleSave = async (collectionName, explicitData = null, fileField = 'image', fileType = 'image') => {
    setIsSubmitting(true);
    try {
      let payload = explicitData || formData;
      
      // Upload Logic
      if (selectedFile) {
        setUploadStatus(`Uploading ${fileType}...`);
        const url = fileType === 'image' ? await uploadImage(selectedFile) : await uploadFile(selectedFile);
        payload[fileField] = url;
      }
      if (collectionName === 'songs' && audioFile) {
        setUploadStatus("Uploading Audio...");
        payload.url = await uploadFile(audioFile);
      }

      if (editingId) {
        await updateDoc(doc(db, collectionName, editingId), payload);
        success("Imesasishwa kikamilifu!");
      } else {
        await addDoc(collection(db, collectionName), { ...payload, createdAt: serverTimestamp() });
        success("Imeongezwa kikamilifu!");
      }
      
      // Reset
      setFormData({}); setSelectedFile(null); setAudioFile(null); setEditingId(null); setUploadStatus('');
    } catch (err) {
      error("Tatizo: " + err.message);
    }
    setIsSubmitting(false);
  };

  const deleteItem = async (col, id) => {
    if(!confirm("Una uhakika unataka kufuta hii?")) return;
    try {
      await deleteDoc(doc(db, col, id));
      success("Imefutwa.");
    } catch(err) { error("Imeshindikana kufuta."); }
  };

  const handleSettingsSave = async (docName, dataObj) => {
    setIsSubmitting(true);
    try {
      let payload = { ...dataObj };
      if (selectedFile) {
        const url = await uploadImage(selectedFile);
        if (docName === 'general') payload.heroImage = url;
        if (docName === 'featuredSession') payload.image = url;
      }
      await setDoc(doc(db, "settings", docName), payload, { merge: true });
      success("Mipangilio imehifadhiwa!");
      setSelectedFile(null);
    } catch(err) { error("Kosa: " + err.message); }
    setIsSubmitting(false);
  };

  // --- HELPERS ---
  const handleEdit = (item) => { setFormData(item); setEditingId(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const filteredMembers = data.registrations.filter(r => JSON.stringify(r).toLowerCase().includes(memberSearch.toLowerCase()));
  
  const FileInput = ({ label, accept, onChange, file }) => (
    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 cursor-pointer relative transition-colors">
      <input type="file" accept={accept} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={e => onChange(e.target.files[0])} />
      <div className="flex flex-col items-center gap-2 pointer-events-none">
        <UploadCloud className="text-blue-500" size={24}/>
        <span className="text-xs font-bold text-slate-500 uppercase">{label}</span>
        {file ? <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">{file.name}</span> : <span className="text-xs text-slate-400">Click to browse</span>}
      </div>
    </div>
  );

  const SubmitButton = ({ label }) => (
    <button disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
      {isSubmitting ? <><Loader2 className="animate-spin" size={20}/> {uploadStatus || "Processing..."}</> : label}
    </button>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600"><Lock size={32}/></div>
          <h2 className="text-2xl font-extrabold text-slate-900">Admin Access</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input className="w-full p-4 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email" value={authForm.email} onChange={e=>setAuthForm({...authForm, email:e.target.value})}/>
          <input className="w-full p-4 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Password" value={authForm.password} onChange={e=>setAuthForm({...authForm, password:e.target.value})}/>
          <SubmitButton label="Login to Dashboard" />
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 md:h-screen sticky top-0 overflow-y-auto z-10">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-extrabold text-blue-900">TUCASA Admin</h1>
          <p className="text-xs text-slate-500 mt-1 truncate">{user.email}</p>
        </div>
        <nav className="p-4 space-y-1">
          {[{id:'overview',icon:LayoutDashboard, l:'Overview'},{id:'messages',icon:Mail, l:'Inbox'},{id:'settings',icon:Settings, l:'Settings'},{id:'members',icon:User, l:'Members'},{id:'programs',icon:BookOpen, l:'Programs'},{id:'events',icon:Calendar, l:'Events'},{id:'songs',icon:Music, l:'Songs'},{id:'leaders',icon:Users, l:'Leaders'},{id:'verses',icon:Scroll, l:'Manna'},{id:'resources',icon:FileText, l:'Resources'},{id:'gallery',icon:ImageIcon, l:'Gallery'},{id:'testimonials',icon:MessageCircle, l:'Testimonies'},{id:'faqs',icon:HelpCircle, l:'FAQs'}].map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setFormData({}); setEditingId(null); setSelectedFile(null); setAudioFile(null); window.scrollTo(0,0); }} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === t.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
              <t.icon size={18}/> {t.l}
            </button>
          ))}
          <button onClick={() => signOut(auth)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 mt-8">
            <LogOut size={18}/> Sign Out
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Members</h3><p className="text-3xl font-extrabold text-blue-900">{data.registrations.length}</p></div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Inbox</h3><p className="text-3xl font-extrabold text-blue-900">{data.messages.length}</p></div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Events</h3><p className="text-3xl font-extrabold text-blue-900">{data.events.length}</p></div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Songs</h3><p className="text-3xl font-extrabold text-blue-900">{data.songs.length}</p></div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-blue-900">General Information</h3>
              <div className="grid gap-4">
                <input className="p-3 border rounded-xl" placeholder="Website Title (Hero Title)" value={settings.heroTitle} onChange={e=>setSettings({...settings, heroTitle:e.target.value})} />
                <textarea className="p-3 border rounded-xl" placeholder="Subtitle" value={settings.heroSubtitle} onChange={e=>setSettings({...settings, heroSubtitle:e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input className="p-3 border rounded-xl" placeholder="Email" value={settings.email} onChange={e=>setSettings({...settings, email:e.target.value})} />
                  <input className="p-3 border rounded-xl" placeholder="Phone" value={settings.phone} onChange={e=>setSettings({...settings, phone:e.target.value})} />
                </div>
                <input className="p-3 border rounded-xl" placeholder="Location" value={settings.location} onChange={e=>setSettings({...settings, location:e.target.value})} />
                <FileInput label="Update Hero Background Image" accept="image/*" onChange={setSelectedFile} file={selectedFile} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-blue-900">Social Links</h3>
              <div className="grid grid-cols-2 gap-4">
                <input className="p-3 border rounded-xl" placeholder="WhatsApp Link" value={settings.whatsapp} onChange={e=>setSettings({...settings, whatsapp:e.target.value})} />
                <input className="p-3 border rounded-xl" placeholder="Instagram Link" value={settings.instagram} onChange={e=>setSettings({...settings, instagram:e.target.value})} />
                <input className="p-3 border rounded-xl" placeholder="YouTube Link" value={settings.youtube} onChange={e=>setSettings({...settings, youtube:e.target.value})} />
                <input className="p-3 border rounded-xl" placeholder="TikTok Link" value={settings.tiktok} onChange={e=>setSettings({...settings, tiktok:e.target.value})} />
              </div>
            </div>
            <button disabled={isSubmitting} onClick={() => handleSettingsSave('general', settings)} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
              {isSubmitting ? 'Saving Changes...' : 'Save All Settings'}
            </button>
          </div>
        )}

        {/* PROGRAMS & SOMO LA LEO */}
        {activeTab === 'programs' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-blue-900 text-white p-6 rounded-2xl h-fit">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Star className="text-yellow-400 fill-current"/> Somo la Leo</h3>
              <div className="space-y-3">
                <input className="w-full p-3 rounded-lg bg-blue-800 border-none text-white placeholder-blue-300" placeholder="Topic" value={featuredSession.topic} onChange={e=>setFeaturedSession({...featuredSession, topic:e.target.value})} />
                <input className="w-full p-3 rounded-lg bg-blue-800 border-none text-white placeholder-blue-300" placeholder="Speaker" value={featuredSession.speaker} onChange={e=>setFeaturedSession({...featuredSession, speaker:e.target.value})} />
                <input className="w-full p-3 rounded-lg bg-blue-800 border-none text-white placeholder-blue-300" placeholder="Date/Time" value={featuredSession.date} onChange={e=>setFeaturedSession({...featuredSession, date:e.target.value})} />
                <textarea className="w-full p-3 rounded-lg bg-blue-800 border-none text-white placeholder-blue-300" rows="3" placeholder="Description" value={featuredSession.description} onChange={e=>setFeaturedSession({...featuredSession, description:e.target.value})} />
                <div className="bg-blue-800 p-4 rounded-lg text-center cursor-pointer relative">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e=>setSelectedFile(e.target.files[0])} />
                  <span className="text-xs font-bold text-blue-200 uppercase">{selectedFile ? selectedFile.name : "Change Poster"}</span>
                </div>
                <button onClick={() => handleSettingsSave('featuredSession', featuredSession)} className="w-full bg-yellow-500 hover:bg-yellow-400 text-blue-900 py-3 rounded-lg font-bold mt-2">Update Featured</button>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-bold mb-4">{editingId ? 'Edit Program' : 'Add New Program'}</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input className="p-3 border rounded-xl" placeholder="Day (e.g. Mon)" value={formData.day || ''} onChange={e=>setFormData({...formData, day:e.target.value})} />
                  <input className="p-3 border rounded-xl" placeholder="Title" value={formData.title || ''} onChange={e=>setFormData({...formData, title:e.target.value})} />
                </div>
                <textarea className="w-full p-3 border rounded-xl mb-4" placeholder="Description" value={formData.desc || ''} onChange={e=>setFormData({...formData, desc:e.target.value})} />
                <div className="flex gap-2">
                  <SubmitButton label={editingId ? "Update Program" : "Add Program"} onClick={() => handleSave('programs')} />
                  <button onClick={() => handleSave('programs')} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Save</button>
                  {editingId && <button onClick={()=>{setEditingId(null); setFormData({})}} className="px-6 border rounded-xl font-bold text-slate-500">Cancel</button>}
                </div>
              </div>
              <div className="space-y-3">
                {data.programs.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
                    <div><span className="font-bold text-blue-600 mr-2">{p.day}</span> <span className="font-medium text-slate-700">{p.title}</span></div>
                    <div className="flex gap-2"><button onClick={()=>handleEdit(p)} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Edit2 size={16}/></button><button onClick={()=>deleteItem('programs', p.id)} className="p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 size={16}/></button></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MEMBERS (SCROLLABLE TABLE FIX) */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b flex flex-wrap gap-4 justify-between items-center bg-slate-50/50">
              <input placeholder="Search members..." className="border p-2 rounded-lg w-full md:w-64 bg-white" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">{data.registrations.length} Total</span>
              </div>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-sm min-w-[900px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase"><tr><th className="p-4">Name</th><th className="p-4">Reg No</th><th className="p-4">Phone</th><th className="p-4">Ministry</th><th className="p-4 text-right">Action</th></tr></thead>
                <tbody>
                  {filteredMembers.map(r => (
                    <tr key={r.id} className="border-t hover:bg-blue-50/30">
                      <td className="p-4 font-bold text-slate-700">{r.firstName} {r.lastName}</td>
                      <td className="p-4 font-mono text-slate-500">{r.regNo}</td>
                      <td className="p-4">{r.phone}</td>
                      <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{r.ministry}</span></td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => setSelectedMember(r)} className="p-2 bg-slate-100 text-blue-600 rounded"><Eye size={16}/></button>
                        <button onClick={() => deleteItem("registrations", r.id)} className="p-2 bg-slate-100 text-red-500 rounded"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* VIEW MEMBER MODAL */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={()=>setSelectedMember(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e=>e.stopPropagation()}>
              <div className="bg-blue-900 p-6 text-white flex justify-between"><div><h2 className="text-xl font-bold">{selectedMember.firstName} {selectedMember.lastName}</h2><p className="text-blue-200 text-sm font-mono">{selectedMember.regNo}</p></div><button onClick={()=>setSelectedMember(null)}><X/></button></div>
              <div className="p-6 grid grid-cols-2 gap-4 bg-slate-50">
                <div className="bg-white p-3 rounded border"><span className="text-xs text-slate-400 block">Phone</span>{selectedMember.phone}</div>
                <div className="bg-white p-3 rounded border"><span className="text-xs text-slate-400 block">Gender</span>{selectedMember.gender}</div>
                <div className="bg-white p-3 rounded border"><span className="text-xs text-slate-400 block">Course</span>{selectedMember.course}</div>
                <div className="bg-white p-3 rounded border"><span className="text-xs text-slate-400 block">Year</span>{selectedMember.year}</div>
                <div className="bg-white p-3 rounded border col-span-2"><span className="text-xs text-slate-400 block">Home Church</span>{selectedMember.homeChurch}</div>
              </div>
            </div>
          </div>
        )}

        {/* LEADERS (FULL FORM) */}
        {activeTab === 'leaders' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 h-fit">
              <h3 className="font-bold mb-4">{editingId ? 'Edit Leader' : 'Add Leader'}</h3>
              <div className="space-y-4">
                <input className="w-full p-3 border rounded-xl" placeholder="Name" value={formData.name || ''} onChange={e=>setFormData({...formData, name:e.target.value})} />
                <input className="w-full p-3 border rounded-xl" placeholder="Role" value={formData.role || ''} onChange={e=>setFormData({...formData, role:e.target.value})} />
                <input className="w-full p-3 border rounded-xl" placeholder="Phone" value={formData.phone || ''} onChange={e=>setFormData({...formData, phone:e.target.value})} />
                <input className="w-full p-3 border rounded-xl" placeholder="WhatsApp" value={formData.whatsapp || ''} onChange={e=>setFormData({...formData, whatsapp:e.target.value})} />
                <FileInput label="Profile Photo" accept="image/*" onChange={setSelectedFile} file={selectedFile} />
                <div className="flex gap-2">
                  <button onClick={() => handleSave('leaders')} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Save</button>
                  {editingId && <button onClick={()=>{setEditingId(null); setFormData({})}} className="px-4 border rounded-xl text-red-500">X</button>}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.leaders.map(l => (
                <div key={l.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100">
                  <img src={l.image} className="w-12 h-12 rounded-full object-cover bg-slate-100"/>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{l.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{l.role}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={()=>handleEdit(l)} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                    <button onClick={()=>deleteItem('leaders', l.id)} className="p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SONGS (WITH AUDIO & COVER) */}
        {activeTab === 'songs' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 h-fit">
              <h3 className="font-bold mb-4">{editingId ? 'Edit Song' : 'Add Song'}</h3>
              <div className="space-y-4">
                <input className="w-full p-3 border rounded-xl" placeholder="Song Title" value={formData.title || ''} onChange={e=>setFormData({...formData, title:e.target.value})} />
                <FileInput label="1. Upload MP3 Audio" accept="audio/*" onChange={setAudioFile} file={audioFile} />
                <FileInput label="2. Upload Cover Art" accept="image/*" onChange={setSelectedFile} file={selectedFile} />
                <div className="flex gap-2">
                  <button onClick={() => handleSave('songs', null, 'cover', 'image')} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Save Song</button>
                  {editingId && <button onClick={()=>{setEditingId(null); setFormData({})}} className="px-4 border rounded-xl text-red-500">X</button>}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-2">
              {data.songs.map(s => (
                <div key={s.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <img src={s.cover || "https://via.placeholder.com/40"} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                    <span className="font-bold text-slate-700">{s.title}</span>
                  </div>
                  <button onClick={()=>deleteItem('songs', s.id)} className="p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EVENTS */}
        {activeTab === 'events' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 h-fit space-y-4">
              <h3 className="font-bold">{editingId ? 'Edit Event' : 'Add Event'}</h3>
              <input className="w-full p-3 border rounded-xl" placeholder="Title" value={formData.title || ''} onChange={e=>setFormData({...formData, title:e.target.value})} />
              <div className="grid grid-cols-2 gap-2">
                <input className="p-3 border rounded-xl" type="date" value={formData.date || ''} onChange={e=>setFormData({...formData, date:e.target.value})} />
                <input className="p-3 border rounded-xl" type="time" value={formData.time || ''} onChange={e=>setFormData({...formData, time:e.target.value})} />
              </div>
              <input className="w-full p-3 border rounded-xl" placeholder="Location" value={formData.location || ''} onChange={e=>setFormData({...formData, location:e.target.value})} />
              <div className="flex gap-2">
                <button onClick={() => handleSave('events')} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Save</button>
                {editingId && <button onClick={()=>{setEditingId(null); setFormData({})}} className="px-4 border rounded-xl text-red-500">X</button>}
              </div>
            </div>
            <div className="lg:col-span-2 space-y-2">
              {data.events.map(e => (
                <div key={e.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100">
                  <div><p className="font-bold">{e.title}</p><p className="text-xs text-slate-500">{e.date} • {e.location}</p></div>
                  <div className="flex gap-2"><button onClick={()=>handleEdit(e)} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Edit2 size={16}/></button><button onClick={()=>deleteItem('events', e.id)} className="p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 size={16}/></button></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GENERIC: VERSES, FAQS, TESTIMONIALS (Simplified UI for brevity, but functional) */}
        {['verses', 'faqs', 'testimonials', 'gallery', 'resources'].includes(activeTab) && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 h-fit space-y-4">
              <h3 className="font-bold capitalize">{editingId ? 'Edit' : 'Add'} {activeTab}</h3>
              {/* Dynamic Inputs based on tab */}
              {activeTab === 'verses' && <><textarea className="w-full p-3 border rounded-xl" placeholder="Verse Text" rows="3" value={formData.text||''} onChange={e=>setFormData({...formData, text:e.target.value})}/><input className="w-full p-3 border rounded-xl" placeholder="Reference (e.g. John 3:16)" value={formData.ref||''} onChange={e=>setFormData({...formData, ref:e.target.value})}/><FileInput label="Background Image" accept="image/*" onChange={setSelectedFile} file={selectedFile}/></>}
              {activeTab === 'faqs' && <><input className="w-full p-3 border rounded-xl" placeholder="Question" value={formData.question||''} onChange={e=>setFormData({...formData, question:e.target.value})}/><textarea className="w-full p-3 border rounded-xl" placeholder="Answer" rows="3" value={formData.answer||''} onChange={e=>setFormData({...formData, answer:e.target.value})}/></>}
              {activeTab === 'testimonials' && <><input className="w-full p-3 border rounded-xl" placeholder="Name" value={formData.name||''} onChange={e=>setFormData({...formData, name:e.target.value})}/><input className="w-full p-3 border rounded-xl" placeholder="Role" value={formData.role||''} onChange={e=>setFormData({...formData, role:e.target.value})}/><textarea className="w-full p-3 border rounded-xl" placeholder="Message" value={formData.text||''} onChange={e=>setFormData({...formData, text:e.target.value})}/><FileInput label="Photo" accept="image/*" onChange={setSelectedFile} file={selectedFile}/></>}
              {activeTab === 'gallery' && <><input className="w-full p-3 border rounded-xl" placeholder="Caption" value={formData.alt||''} onChange={e=>setFormData({...formData, alt:e.target.value})}/><FileInput label="Photo" accept="image/*" onChange={setSelectedFile} file={selectedFile} /></>}
              {activeTab === 'resources' && <><input className="w-full p-3 border rounded-xl" placeholder="Title" value={formData.title||''} onChange={e=>setFormData({...formData, title:e.target.value})}/><FileInput label="PDF File" accept=".pdf,.doc" onChange={setSelectedFile} file={selectedFile} /></>}
              
              <div className="flex gap-2">
                <button onClick={() => handleSave(activeTab, null, activeTab === 'resources' ? 'link' : activeTab === 'gallery' ? 'src' : 'image', activeTab === 'resources' ? 'file' : 'image')} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Save</button>
                {editingId && <button onClick={()=>{setEditingId(null); setFormData({})}} className="px-4 border rounded-xl text-red-500">X</button>}
              </div>
            </div>
            <div className="lg:col-span-2 space-y-2">
              {data[activeTab].map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div className="truncate pr-4 font-medium">{item.title || item.question || item.text || item.name || item.alt || "Item"}</div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={()=>handleEdit(item)} className="p-2 text-blue-600 bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                    <button onClick={()=>deleteItem(activeTab, item.id)} className="p-2 text-red-600 bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;