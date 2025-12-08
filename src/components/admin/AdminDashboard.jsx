import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { uploadImage, uploadFile } from '../../lib/uploadService';

// ICONS
import { 
  Lock, LogOut, User, Calendar, Trash2, Edit2, Image as ImageIcon, Loader2, 
  Users, FileText, Music, FileAudio, HelpCircle, MessageCircle, BookOpen, 
  Scroll, Settings, Save, Instagram, Video, Youtube, DollarSign, Mail, 
  AlertTriangle, Layout, Link as LinkIcon, X, Clock, MapPin, Mic, 
  Star, Eye, CheckCircle, Search, Download, LayoutDashboard, TrendingUp, Plus 
} from 'lucide-react';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // DATA STATES
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [resources, setResources] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [songs, setSongs] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [verses, setVerses] = useState([]);
  const [messages, setMessages] = useState([]); 
  
  // UI STATES
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // SETTINGS STATE
  const [settings, setSettings] = useState({
    heroTitle: '', heroSubtitle: '', heroImage: '',
    scheduleDays: '', scheduleTime: '', scheduleVenue: '',
    email: '', phone: '', location: '', 
    whatsapp: '', instagram: '', tiktok: '', youtube: '', 
    customLinks: [], 
    paymentNumber: '', paymentName: ''
  });
  
  const [featuredSession, setFeaturedSession] = useState({ topic: '', speaker: '', date: '', description: '', image: '' });

  // AUTH
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // FORMS (DEFAULTS)
  const defaultEvent = { title: '', date: '', time: '', location: '', description: '', image: '' };
  const defaultLeader = { name: '', role: '', phone: '', whatsapp: '', image: '' };
  const defaultResource = { title: '', type: 'PDF', size: '2 MB', link: '' };
  const defaultPhoto = { alt: '', category: 'Worship', src: '' };
  const defaultSong = { title: '', url: '', cover: '' };
  const defaultProgram = { day: '', title: '', desc: '', icon: 'BookOpen' };
  const defaultTestimonial = { name: '', role: '', text: '', image: '' };
  const defaultFaq = { question: '', answer: '' };
  const defaultVerse = { text: '', ref: '', image: '' };

  const [newEvent, setNewEvent] = useState(defaultEvent);
  const [newLeader, setNewLeader] = useState(defaultLeader);
  const [newResource, setNewResource] = useState(defaultResource);
  const [newPhoto, setNewPhoto] = useState(defaultPhoto);
  const [newSong, setNewSong] = useState(defaultSong);
  const [newProgram, setNewProgram] = useState(defaultProgram);
  const [newTestimonial, setNewTestimonial] = useState(defaultTestimonial);
  const [newFaq, setNewFaq] = useState(defaultFaq);
  const [newVerse, setNewVerse] = useState(defaultVerse);

  // REAL-TIME LISTENER
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u) {
        const collections = [
          { name: "registrations", set: setRegistrations, order: "desc" },
          { name: "events", set: setEvents, order: "asc" },
          { name: "leaders", set: setLeaders, order: "desc" },
          { name: "resources", set: setResources, order: "desc" },
          { name: "gallery", set: setGallery, order: "desc" },
          { name: "songs", set: setSongs, order: "desc" },
          { name: "programs", set: setPrograms, order: "asc" },
          { name: "testimonials", set: setTestimonials, order: "desc" },
          { name: "faqs", set: setFaqs, order: "desc" },
          { name: "verses", set: setVerses, order: "desc" },
          { name: "messages", set: setMessages, order: "desc" },
        ];

        const subs = collections.map(col => 
          onSnapshot(query(collection(db, col.name), orderBy("createdAt", col.order)), s => col.set(s.docs.map(d => ({id: d.id, ...d.data()}))))
        );
        getDoc(doc(db, "settings", "general")).then(d => d.exists() && setSettings({ ...d.data(), customLinks: d.data().customLinks || [] }));
        getDoc(doc(db, "settings", "featuredSession")).then(d => d.exists() && setFeaturedSession(d.data()));
        return () => subs.forEach(unsub => unsub());
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (e) => { e.preventDefault(); setError(''); try { await signInWithEmailAndPassword(auth, email, password); } catch (err) { setError('Access Denied'); } };
  
  const handleAddItem = async (col, data, resetFn, setFormFn, fileField = 'image', fileType = 'image') => {
    setIsSubmitting(true);
    try {
      let finalData = { ...data };
      if (selectedFile) {
        setUploadStatus("Uploading File...");
        finalData[fileField] = fileType === 'image' ? await uploadImage(selectedFile) : await uploadFile(selectedFile);
      }
      if (col === 'songs' && audioFile) {
        setUploadStatus("Uploading MP3...");
        finalData.url = await uploadFile(audioFile);
      }

      if (editingId) {
        setUploadStatus("Updating...");
        await updateDoc(doc(db, col, editingId), finalData);
        alert("Imesasishwa!");
        setEditingId(null);
      } else {
        setUploadStatus("Saving...");
        await addDoc(collection(db, col), { ...finalData, createdAt: serverTimestamp() });
        alert("Imewekwa!");
      }
      resetFn(); setSelectedFile(null); setAudioFile(null);
    } catch (err) { alert("Error: " + err.message); }
    setIsSubmitting(false); setUploadStatus('');
  };

  const startEdit = (item, setFormFn) => { setFormFn(item); setEditingId(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const cancelEdit = (resetFn) => { resetFn(); setEditingId(null); setSelectedFile(null); setAudioFile(null); };
  const deleteItem = async (col, id) => { if(confirm("Futa kabisa?")) await deleteDoc(doc(db, col, id)); };
  
  const handleSaveSettings = async () => { setIsSubmitting(true); try { let d={...settings}; if(selectedFile) d.heroImage=await uploadImage(selectedFile); await setDoc(doc(db,"settings","general"),d); setSettings(d); setSelectedFile(null); alert("Saved!"); } catch(e){alert(e.message);} setIsSubmitting(false); };
  const handleSaveFeatured = async () => { setIsSubmitting(true); try { let d={...featuredSession}; if(selectedFile) d.image=await uploadImage(selectedFile); await setDoc(doc(db,"settings","featuredSession"),d); setFeaturedSession(d); setSelectedFile(null); alert("Updated!"); } catch(e){alert(e.message);} setIsSubmitting(false); };
  const addCustomLink = () => setSettings({ ...settings, customLinks: [...settings.customLinks, { name: '', url: '' }] });
  const updateCustomLink = (idx, field, val) => { const l = [...settings.customLinks]; l[idx][field] = val; setSettings({...settings, customLinks: l}); };
  const removeCustomLink = (idx) => setSettings({...settings, customLinks: settings.customLinks.filter((_, i) => i !== idx)});

  const handleExportMembers = () => {
    const h = ["Name,RegNo,Phone,Email,Course,Year,Ministry,Church,Baptized"];
    const r = registrations.map(r => [r.firstName+" "+r.lastName, r.regNo, r.phone, r.email, r.course, r.year, r.ministry, r.homeChurch, r.baptismStatus].map(e=>`"${e||''}"`).join(","));
    const l = document.createElement("a"); l.href = encodeURI("data:text/csv;charset=utf-8,"+ [h,...r].join("\n")); l.download="members.csv"; document.body.appendChild(l); l.click();
  };

  const filteredMembers = registrations.filter(r => JSON.stringify(r).toLowerCase().includes(memberSearch.toLowerCase()));
  
  const FileUploadBox = ({ label, accept, onChange, file }) => (
    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer relative group">
      <input type="file" accept={accept} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={onChange} />
      <span className="text-xs font-bold uppercase block text-slate-500">{label}</span>
      {file ? <span className="text-xs text-green-600 truncate">{file.name}</span> : <span className="text-xs text-slate-400">Click to upload</span>}
    </div>
  );

  if (!user) return (<div className="min-h-screen flex items-center justify-center bg-slate-100 p-4"><div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"><h2 className="text-2xl font-bold text-center text-slate-900 mb-6">Admin Portal</h2><form onSubmit={handleLogin} className="space-y-4"><input className="w-full p-3 border rounded-xl" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input className="w-full p-3 border rounded-xl" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/><button className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold">Login</button></form></div></div>);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div><h1 className="text-xl font-bold text-slate-900">TUCASA Control Panel</h1><p className="text-slate-500 text-xs">{user.email}</p></div>
          <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-red-600 font-bold px-4 py-2 rounded-lg hover:bg-red-50"><LogOut size={18} /> Logout</button>
        </div>

        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 scrollbar-hide">
          {[{id:'overview',icon:LayoutDashboard},{id:'messages',icon:Mail},{id:'settings',icon:Settings},{id:'programs',icon:BookOpen},{id:'members',icon:User},{id:'songs',icon:Music},{id:'events',icon:Calendar},{id:'verses',icon:Scroll},{id:'leaders',icon:Users},{id:'resources',icon:FileText},{id:'gallery',icon:ImageIcon},{id:'testimonials',icon:MessageCircle},{id:'faqs',icon:HelpCircle}].map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setSelectedFile(null); setEditingId(null); setAudioFile(null); setSelectedMember(null); }} className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100'}`}><t.icon size={18} /><span className="capitalize">{t.id}</span></button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100"><h3 className="font-bold text-slate-500 text-sm">MEMBERS</h3><p className="text-3xl font-extrabold text-blue-600">{registrations.length}</p></div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100"><h3 className="font-bold text-slate-500 text-sm">EVENTS</h3><p className="text-3xl font-extrabold text-blue-600">{events.length}</p></div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100"><h3 className="font-bold text-slate-500 text-sm">SONGS</h3><p className="text-3xl font-extrabold text-blue-600">{songs.length}</p></div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100"><h3 className="font-bold text-slate-500 text-sm">MESSAGES</h3><p className="text-3xl font-extrabold text-blue-600">{messages.length}</p></div>
          </div>
        )}

        {/* --- MEMBERS (HAPA NIMEBORESHA SCROLL) --- */}
        {activeTab === 'members' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b flex flex-wrap gap-2 justify-between items-center bg-slate-50/50">
              <div className="flex gap-2 items-center w-full md:w-auto">
                <input placeholder="Search..." className="border p-2 rounded-lg w-full md:w-64 text-sm" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
                <span className="text-xs font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full whitespace-nowrap">{registrations.length} Total</span>
              </div>
              <button onClick={handleExportMembers} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm"><Download size={16}/> CSV</button>
            </div>
            {/* OVERFLOW FIX: Hii inaruhusu table kusogea kwenye simu */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase"><tr><th className="p-4">Name</th><th className="p-4">Reg No</th><th className="p-4">Phone</th><th className="p-4">Ministry</th><th className="p-4 text-right">Actions</th></tr></thead>
                <tbody>
                  {filteredMembers.map(r => (
                    <tr key={r.id} className="border-t hover:bg-blue-50/30 transition-colors">
                      <td className="p-4 font-bold text-slate-700">{r.firstName} {r.lastName}</td>
                      <td className="p-4 font-mono text-slate-500">{r.regNo}</td>
                      <td className="p-4 text-slate-600">{r.phone}</td>
                      <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{r.ministry}</span></td>
                      <td className="p-4 text-right flex justify-end gap-2"><button onClick={() => setSelectedMember(r)} className="p-2 bg-slate-100 text-blue-600 rounded"><Eye size={16}/></button><button onClick={() => deleteItem("registrations", r.id)} className="p-2 bg-slate-100 text-red-500 rounded"><Trash2 size={16}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* MEMBER DETAILS MODAL */}
        {selectedMember && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={()=>setSelectedMember(null)}><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e=>e.stopPropagation()}><div className="bg-blue-600 p-6 text-white flex justify-between"><div><h2 className="text-xl font-bold">{selectedMember.firstName} {selectedMember.lastName}</h2><p className="text-blue-100 text-sm">{selectedMember.regNo}</p></div><button onClick={()=>setSelectedMember(null)}><X size={24}/></button></div><div className="p-6 space-y-4 bg-slate-50"><div className="grid grid-cols-2 gap-4"><div className="bg-white p-3 rounded border"><span className="text-xs text-slate-400 block">Phone</span><span className="font-bold">{selectedMember.phone}</span></div><div className="bg-white p-3 rounded border"><span className="text-xs text-slate-400 block">Course</span><span className="font-bold">{selectedMember.course}</span></div><div className="bg-white p-3 rounded border"><span className="text-xs text-slate-400 block">Year</span><span className="font-bold">{selectedMember.year}</span></div><div className="bg-white p-3 rounded border"><span className="text-xs text-slate-400 block">Gender</span><span className="font-bold">{selectedMember.gender}</span></div></div><div className="bg-white p-4 rounded border"><h4 className="font-bold text-blue-600 text-sm mb-2">Spiritual Info</h4><div className="grid grid-cols-2 gap-y-2 text-sm"><span className="text-slate-500">Ministry:</span> <span className="font-bold">{selectedMember.ministry}</span><span className="text-slate-500">Baptized:</span> <span className="font-bold">{selectedMember.baptismStatus}</span><span className="text-slate-500">Home Church:</span> <span className="font-bold">{selectedMember.homeChurch}</span></div></div><div className="bg-white p-3 rounded border"><span className="text-xs text-slate-400 block">Email</span><span className="text-sm">{selectedMember.email}</span></div></div></div></div>)}

        {/* SETTINGS */}
        {activeTab === 'settings' && (<div className="bg-white p-8 rounded-2xl border border-slate-100 max-w-3xl mx-auto"><h3 className="font-bold text-xl mb-6">Settings</h3><div className="space-y-6"><div className="p-4 bg-slate-50 rounded-xl border border-slate-200"><h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Brand</h4><input className="w-full p-2 border rounded mb-2" placeholder="Title" value={settings.heroTitle} onChange={e=>setSettings({...settings, heroTitle:e.target.value})} /><textarea className="w-full p-2 border rounded mb-2" placeholder="Subtitle" value={settings.heroSubtitle} onChange={e=>setSettings({...settings, heroSubtitle:e.target.value})} /><FileUploadBox label="Hero Image" accept="image/*" onChange={e=>setSelectedFile(e.target.files[0])} file={selectedFile} /></div><div className="p-4 bg-slate-50 rounded-xl border border-slate-200"><h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Links</h4><div className="grid grid-cols-2 gap-3"><input className="p-2 border rounded" placeholder="WhatsApp" value={settings.whatsapp} onChange={e=>setSettings({...settings, whatsapp:e.target.value})} /><input className="p-2 border rounded" placeholder="Instagram" value={settings.instagram} onChange={e=>setSettings({...settings, instagram:e.target.value})} /><input className="p-2 border rounded" placeholder="TikTok" value={settings.tiktok} onChange={e=>setSettings({...settings, tiktok:e.target.value})} /><input className="p-2 border rounded" placeholder="YouTube" value={settings.youtube} onChange={e=>setSettings({...settings, youtube:e.target.value})} /></div><div className="border-t pt-3 mt-3"><label className="text-xs font-bold text-blue-600 block mb-2">Custom Links</label>{settings.customLinks.map((link, i) => (<div key={i} className="flex gap-2 mb-2"><input className="w-1/3 p-2 border rounded text-xs" value={link.name} onChange={e=>updateCustomLink(i,'name',e.target.value)}/><input className="w-2/3 p-2 border rounded text-xs" value={link.url} onChange={e=>updateCustomLink(i,'url',e.target.value)}/><button onClick={()=>removeCustomLink(i)} className="text-red-500"><X size={16}/></button></div>))}<button onClick={addCustomLink} className="text-xs flex items-center gap-1 text-blue-600 font-bold hover:underline"><Plus size={14}/> Add Link</button></div></div><div className="p-4 bg-slate-50 rounded-xl border border-slate-200"><h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Finance</h4><div className="grid grid-cols-2 gap-3"><input className="p-2 border rounded" placeholder="Number" value={settings.paymentNumber} onChange={e=>setSettings({...settings, paymentNumber:e.target.value})} /><input className="p-2 border rounded" placeholder="Name" value={settings.paymentName} onChange={e=>setSettings({...settings, paymentName:e.target.value})} /></div></div><button disabled={isSubmitting} onClick={handleSaveSettings} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold">Save Settings</button></div></div>)}
        
        {/* MESSAGES */}
        {activeTab === 'messages' && <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">{messages.map(m=><div key={m.id} className="p-4 border-b hover:bg-slate-50 flex justify-between"><div><h4 className="font-bold">{m.firstName} {m.lastName}</h4><p className="text-sm text-slate-600">{m.message}</p></div><button onClick={()=>deleteItem("messages", m.id)} className="text-red-500"><Trash2 size={16}/></button></div>)}</div>}
        
        {/* PROGRAMS */}
        {activeTab === 'programs' && <div className="grid md:grid-cols-3 gap-8"><div className="bg-blue-50 p-6 rounded-2xl border border-blue-100"><h3 className="font-bold text-blue-800 mb-4">Somo la Leo</h3><div className="space-y-3"><input className="w-full p-2 border rounded bg-white" placeholder="Topic" value={featuredSession.topic} onChange={e=>setFeaturedSession({...featuredSession, topic:e.target.value})} /><input className="w-full p-2 border rounded bg-white" placeholder="Speaker" value={featuredSession.speaker} onChange={e=>setFeaturedSession({...featuredSession, speaker:e.target.value})} /><input className="w-full p-2 border rounded bg-white" placeholder="Time" value={featuredSession.date} onChange={e=>setFeaturedSession({...featuredSession, date:e.target.value})} /><FileUploadBox label="Poster" accept="image/*" onChange={e=>setSelectedFile(e.target.files[0])} file={selectedFile} /><button disabled={isSubmitting} onClick={handleSaveFeatured} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Update</button></div></div><div className="md:col-span-2 space-y-4"><div className={`bg-white p-6 rounded-2xl border ${editingId?'border-yellow-400':''}`}><h3 className="font-bold mb-3">{editingId?'Edit':'Add'} Program</h3><div className="grid grid-cols-2 gap-3 mb-3"><input className="p-2 border rounded" placeholder="Day" value={newProgram.day} onChange={e=>setNewProgram({...newProgram, day:e.target.value})}/><input className="p-2 border rounded" placeholder="Title" value={newProgram.title} onChange={e=>setNewProgram({...newProgram, title:e.target.value})}/></div><textarea className="w-full p-2 border rounded mb-3" placeholder="Desc" value={newProgram.desc} onChange={e=>setNewProgram({...newProgram, desc:e.target.value})}/><div className="flex gap-2"><button onClick={()=>handleAddItem("programs", newProgram, ()=>setNewProgram(defaultProgram), null)} className="flex-1 bg-slate-900 text-white py-2 rounded font-bold">{editingId?'Update':'Add'}</button>{editingId&&<button onClick={()=>cancelEdit(()=>setNewProgram(defaultProgram))} className="text-red-500 px-2">X</button>}</div></div><div className="space-y-2">{programs.map(p=><div key={p.id} className="flex justify-between p-4 bg-white border rounded-xl"><div><span className="font-bold">{p.day}:</span> {p.title}</div><div className="flex gap-2"><button onClick={()=>startEdit(p, setNewProgram)} className="text-blue-600"><Edit2 size={16}/></button><button onClick={()=>deleteItem("programs", p.id)} className="text-red-600"><Trash2 size={16}/></button></div></div>)}</div></div></div>}
        {activeTab === 'songs' && <div className="grid md:grid-cols-3 gap-6"><div className={`bg-white p-6 rounded-xl border h-fit space-y-4 ${editingId ? 'border-yellow-400' : ''}`}><h3 className="font-bold">{editingId?'Edit':'Add'} Song</h3><input className="w-full p-2 border rounded" placeholder="Title" value={newSong.title} onChange={e=>setNewSong({...newSong, title:e.target.value})}/><FileUploadBox label="MP3" accept="audio/*" onChange={e=>setAudioFile(e.target.files[0])} file={audioFile}/><FileUploadBox label="Cover" accept="image/*" onChange={e=>setSelectedFile(e.target.files[0])} file={selectedFile}/><div className="flex gap-2"><button disabled={isSubmitting} onClick={()=>handleAddItem("songs", newSong, ()=>setNewSong(defaultSong), null, 'cover', 'image')} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">{editingId?'Update':'Add'}</button>{editingId&&<button onClick={()=>cancelEdit(()=>setNewSong(defaultSong))} className="text-red-500 px-2">X</button>}</div></div><div className="md:col-span-2 space-y-2">{songs.map(s=><div key={s.id} className="bg-white p-4 border rounded flex justify-between items-center"><div className="flex gap-3 items-center"><img src={s.cover||"https://via.placeholder.com/40"} className="w-10 h-10 rounded object-cover"/><span className="font-bold">{s.title}</span></div><div className="flex gap-2"><button onClick={()=>startEdit(s, setNewSong)} className="text-blue-600"><Edit2 size={16}/></button><button onClick={()=>deleteItem("songs", s.id)} className="text-red-600"><Trash2 size={16}/></button></div></div>)}</div></div>}
        {activeTab === 'leaders' && <div className="grid md:grid-cols-3 gap-6"><div className={`bg-white p-6 rounded-xl border h-fit space-y-4 ${editingId ? 'border-yellow-400' : ''}`}><h3 className="font-bold">{editingId?'Edit':'Add'} Leader</h3><input className="w-full p-2 border rounded" placeholder="Name" value={newLeader.name} onChange={e=>setNewLeader({...newLeader, name:e.target.value})}/><input className="w-full p-2 border rounded" placeholder="Role" value={newLeader.role} onChange={e=>setNewLeader({...newLeader, role:e.target.value})}/><input className="w-full p-2 border rounded" placeholder="Phone" value={newLeader.phone} onChange={e=>setNewLeader({...newLeader, phone:e.target.value})}/><input className="w-full p-2 border rounded" placeholder="WhatsApp" value={newLeader.whatsapp} onChange={e=>setNewLeader({...newLeader, whatsapp:e.target.value})}/><FileUploadBox label="Photo" accept="image/*" onChange={e=>setSelectedFile(e.target.files[0])} file={selectedFile}/><div className="flex gap-2"><button disabled={isSubmitting} onClick={()=>handleAddItem("leaders", newLeader, ()=>setNewLeader(defaultLeader), null, 'image', 'image')} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">{editingId?'Update':'Add'}</button>{editingId&&<button onClick={()=>cancelEdit(()=>setNewLeader(defaultLeader))} className="text-red-500 px-2">X</button>}</div></div><div className="md:col-span-2 grid grid-cols-2 gap-2">{leaders.map(l=><div key={l.id} className="bg-white p-4 border rounded flex justify-between items-center"><div className="flex gap-2 items-center"><img src={l.image} className="w-8 h-8 rounded-full bg-slate-100 object-cover"/><div><p className="text-sm font-bold">{l.name}</p><p className="text-xs text-slate-500">{l.role}</p></div></div><div className="flex gap-2"><button onClick={()=>startEdit(l, setNewLeader)} className="text-blue-600"><Edit2 size={16}/></button><button onClick={()=>deleteItem("leaders", l.id)} className="text-red-600"><Trash2 size={16}/></button></div></div>)}</div></div>}
        {activeTab === 'resources' && <div className="grid md:grid-cols-3 gap-6"><div className={`bg-white p-6 rounded-xl border h-fit space-y-4 ${editingId ? 'border-yellow-400' : ''}`}><h3 className="font-bold">{editingId?'Edit':'Add'} Resource</h3><input className="w-full p-2 border rounded" placeholder="Title" value={newResource.title} onChange={e=>setNewResource({...newResource, title:e.target.value})}/><FileUploadBox label="PDF File" accept=".pdf,.doc" onChange={e=>setSelectedFile(e.target.files[0])} file={selectedFile}/><div className="flex gap-2"><button disabled={isSubmitting} onClick={()=>handleAddItem("resources", newResource, ()=>setNewResource(defaultResource), null, 'link', 'file')} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">{editingId?'Update':'Add'}</button>{editingId&&<button onClick={()=>cancelEdit(()=>setNewResource(defaultResource))} className="text-red-500 px-2">X</button>}</div></div><div className="md:col-span-2 space-y-2">{resources.map(r=><div key={r.id} className="bg-white p-4 border rounded flex justify-between"><span>{r.title}</span><div className="flex gap-2"><button onClick={()=>startEdit(r, setNewResource)} className="text-blue-600"><Edit2 size={16}/></button><button onClick={()=>deleteItem("resources", r.id)} className="text-red-600"><Trash2 size={16}/></button></div></div>)}</div></div>}
        {activeTab === 'gallery' && <div className="grid md:grid-cols-3 gap-6"><div className={`bg-white p-6 rounded-xl border h-fit space-y-4 ${editingId ? 'border-yellow-400' : ''}`}><h3 className="font-bold">{editingId?'Edit':'Add'} Photo</h3><input className="w-full p-2 border rounded" placeholder="Caption" value={newPhoto.alt} onChange={e=>setNewPhoto({...newPhoto, alt:e.target.value})}/><FileUploadBox label="Image" accept="image/*" onChange={e=>setSelectedFile(e.target.files[0])} file={selectedFile}/><div className="flex gap-2"><button disabled={isSubmitting} onClick={()=>handleAddItem("gallery", newPhoto, ()=>setNewPhoto(defaultPhoto), null, 'src', 'image')} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">{editingId?'Update':'Add'}</button>{editingId&&<button onClick={()=>cancelEdit(()=>setNewPhoto(defaultPhoto))} className="text-red-500 px-2">X</button>}</div></div><div className="md:col-span-2 grid grid-cols-3 gap-2">{gallery.map(g=><div key={g.id} className="bg-white p-2 border rounded relative"><img src={g.src} className="h-16 w-full object-cover"/><div className="absolute top-1 right-1 flex gap-1"><button onClick={()=>deleteItem("gallery", g.id)} className="bg-red-500 text-white p-1 rounded"><Trash2 size={12}/></button></div></div>)}</div></div>}
        {activeTab === 'testimonials' && <div className="grid md:grid-cols-3 gap-6"><div className={`bg-white p-6 rounded-xl border h-fit space-y-4 ${editingId ? 'border-yellow-400' : ''}`}><h3 className="font-bold">{editingId?'Edit':'Add'} Story</h3><input className="w-full p-2 border rounded" placeholder="Name" value={newTestimonial.name} onChange={e=>setNewTestimonial({...newTestimonial, name:e.target.value})}/><input className="w-full p-2 border rounded" placeholder="Role" value={newTestimonial.role} onChange={e=>setNewTestimonial({...newTestimonial, role:e.target.value})}/><textarea className="w-full p-2 border rounded" rows="3" placeholder="Story" value={newTestimonial.text} onChange={e=>setNewTestimonial({...newTestimonial, text:e.target.value})}/><FileUploadBox label="Photo" accept="image/*" onChange={e=>setSelectedFile(e.target.files[0])} file={selectedFile}/><div className="flex gap-2"><button disabled={isSubmitting} onClick={()=>handleAddItem("testimonials", newTestimonial, ()=>setNewTestimonial(defaultTestimonial), null, 'image', 'image')} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">{editingId?'Update':'Add'}</button>{editingId&&<button onClick={()=>cancelEdit(()=>setNewTestimonial(defaultTestimonial))} className="text-red-500 px-2">X</button>}</div></div><div className="md:col-span-2 space-y-2">{testimonials.map(t=><div key={t.id} className="bg-white p-4 border rounded flex justify-between"><div><p className="font-bold">{t.name}</p><p className="text-xs truncate w-64">{t.text}</p></div><div className="flex gap-2"><button onClick={()=>startEdit(t, setNewTestimonial)} className="text-blue-600"><Edit2 size={16}/></button><button onClick={()=>deleteItem("testimonials", t.id)} className="text-red-600"><Trash2 size={16}/></button></div></div>)}</div></div>}
        {activeTab === 'faqs' && <div className="grid md:grid-cols-3 gap-6"><div className={`bg-white p-6 rounded-xl border h-fit space-y-4 ${editingId ? 'border-yellow-400' : ''}`}><h3 className="font-bold">{editingId?'Edit':'Add'} FAQ</h3><input className="w-full p-2 border rounded" placeholder="Question" value={newFaq.question} onChange={e=>setNewFaq({...newFaq, question:e.target.value})}/><textarea className="w-full p-2 border rounded" rows="3" placeholder="Answer" value={newFaq.answer} onChange={e=>setNewFaq({...newFaq, answer:e.target.value})}/><div className="flex gap-2"><button disabled={isSubmitting} onClick={()=>handleAddItem("faqs", newFaq, ()=>setNewFaq(defaultFaq), null)} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">{editingId?'Update':'Add'}</button>{editingId&&<button onClick={()=>cancelEdit(()=>setNewFaq(defaultFaq))} className="text-red-500 px-2">X</button>}</div></div><div className="md:col-span-2 space-y-2">{faqs.map(f=><div key={f.id} className="bg-white p-4 border rounded flex justify-between"><div><p className="font-bold">{f.question}</p></div><div className="flex gap-2"><button onClick={()=>startEdit(f, setNewFaq)} className="text-blue-600"><Edit2 size={16}/></button><button onClick={()=>deleteItem("faqs", f.id)} className="text-red-600"><Trash2 size={16}/></button></div></div>)}</div></div>}
        {activeTab === 'verses' && <div className="grid md:grid-cols-3 gap-6"><div className={`bg-white p-6 rounded-xl border h-fit space-y-4 ${editingId ? 'border-yellow-400' : ''}`}><h3 className="font-bold">{editingId?'Edit':'Add'} Verse</h3><textarea className="w-full p-2 border rounded" rows="3" placeholder="Text" value={newVerse.text} onChange={e=>setNewVerse({...newVerse, text:e.target.value})}/><input className="w-full p-2 border rounded" placeholder="Reference" value={newVerse.ref} onChange={e=>setNewVerse({...newVerse, ref:e.target.value})}/><FileUploadBox label="Background" accept="image/*" onChange={e=>setSelectedFile(e.target.files[0])} file={selectedFile}/><div className="flex gap-2"><button disabled={isSubmitting} onClick={()=>handleAddItem("verses", newVerse, ()=>setNewVerse(defaultVerse), null, 'image', 'image')} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">{editingId?'Update':'Add'}</button>{editingId&&<button onClick={()=>cancelEdit(()=>setNewVerse(defaultVerse))} className="text-red-500 px-2">X</button>}</div></div><div className="md:col-span-2 space-y-2">{verses.map(v=><div key={v.id} className="bg-white p-4 border rounded flex justify-between"><div><p className="font-bold italic">"{v.text}"</p><p className="text-xs font-bold">{v.ref}</p></div><div className="flex gap-2"><button onClick={()=>startEdit(v, setNewVerse)} className="text-blue-600"><Edit2 size={16}/></button><button onClick={()=>deleteItem("verses", v.id)} className="text-red-600"><Trash2 size={16}/></button></div></div>)}</div></div>}
        {activeTab === 'events' && <div className="grid md:grid-cols-3 gap-6"><div className={`bg-white p-6 rounded-xl border h-fit space-y-4 ${editingId ? 'border-yellow-400' : ''}`}><h3 className="font-bold">{editingId?'Edit':'Add'} Event</h3><input className="w-full p-2 border rounded" placeholder="Title" value={newEvent.title} onChange={e=>setNewEvent({...newEvent, title:e.target.value})}/><div className="grid grid-cols-2 gap-2"><input type="date" className="w-full p-2 border rounded" value={newEvent.date} onChange={e=>setNewEvent({...newEvent, date:e.target.value})}/><input type="time" className="w-full p-2 border rounded" value={newEvent.time} onChange={e=>setNewEvent({...newEvent, time:e.target.value})}/></div><input className="w-full p-2 border rounded" placeholder="Location" value={newEvent.location} onChange={e=>setNewEvent({...newEvent, location:e.target.value})}/><div className="flex gap-2"><button disabled={isSubmitting} onClick={()=>handleAddItem("events", newEvent, ()=>setNewEvent(defaultEvent), null)} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">{editingId?'Update':'Add'}</button>{editingId&&<button onClick={()=>cancelEdit(()=>setNewEvent(defaultEvent))} className="text-red-500 px-2">X</button>}</div></div><div className="md:col-span-2 space-y-2">{events.map(e=><div key={e.id} className="bg-white p-4 border rounded flex justify-between"><div><p className="font-bold">{e.title}</p><p className="text-xs">{e.date}</p></div><div className="flex gap-2"><button onClick={()=>startEdit(e, setNewEvent)} className="text-blue-600"><Edit2 size={16}/></button><button onClick={()=>deleteItem("events", e.id)} className="text-red-600"><Trash2 size={16}/></button></div></div>)}</div></div>}

      </div>
    </div>
  );
};

export default AdminDashboard;