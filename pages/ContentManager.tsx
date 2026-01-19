
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Trash2, Plus, Save, Loader2, CheckCircle, XCircle, Edit2, Search, Image as ImageIcon, Video, UploadCloud, Server, HardDrive, ListPlus, X, AlertTriangle, Droplets, Sun, Utensils, Pill, Users, Armchair, LifeBuoy, Clock, Phone, Shirt, Info } from 'lucide-react';
import { SHEET_NAMES } from '../constants';
import { updateSheetData, uploadFile } from '../services/api';

// --- ICONS CONFIGURATION ---
const ICON_MAP: Record<string, any> = {
  hydration: { label: 'Hidrasi (Air)', icon: Droplets, color: 'text-blue-400' },
  sun: { label: 'Matahari', icon: Sun, color: 'text-orange-400' },
  food: { label: 'Makanan', icon: Utensils, color: 'text-green-400' },
  medicine: { label: 'Obat', icon: Pill, color: 'text-red-400' },
  companion: { label: 'Pendamping', icon: Users, color: 'text-purple-400' },
  rest: { label: 'Istirahat', icon: Clock, color: 'text-indigo-400' },
  clothing: { label: 'Pakaian', icon: Shirt, color: 'text-pink-400' },
  float: { label: 'Pelampung', icon: LifeBuoy, color: 'text-orange-500' },
  seat: { label: 'Posisi Duduk', icon: Armchair, color: 'text-teal-400' },
  emergency: { label: 'Darurat', icon: Phone, color: 'text-red-500' },
  general: { label: 'Info Umum', icon: Info, color: 'text-gray-400' },
};

// --- COMPONENTS ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'loading' | 'info', onClose: () => void }) => {
  useEffect(() => { 
    if(type !== 'loading') {
      const t = setTimeout(onClose, 3000); 
      return () => clearTimeout(t); 
    }
  }, [onClose, type]);
  
  let bgColor = 'bg-blue-900/90 border-blue-500 text-blue-100';
  if (type === 'success') bgColor = 'bg-emerald-900/90 border-emerald-500 text-emerald-100';
  if (type === 'error') bgColor = 'bg-red-900/90 border-red-500 text-red-100';
  if (type === 'info') bgColor = 'bg-cyan-900/90 border-cyan-500 text-cyan-100';

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-right duration-300 ${bgColor}`}>
      {type === 'success' && <CheckCircle size={20} />}
      {type === 'error' && <XCircle size={20} />}
      {type === 'loading' && <Loader2 size={20} className="animate-spin" />}
      {type === 'info' && <ListPlus size={20} />}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, itemName: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Hapus Item?</h3>
        <p className="text-gray-400 text-sm mb-6">"{itemName}"</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 border border-transparent">Batal</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-500">Hapus</button>
        </div>
      </div>
    </div>
  );
};

// --- ICON SELECTOR (FOR TIPS) ---
const IconSelector = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Object.entries(ICON_MAP).map(([key, config]) => {
        const Icon = config.icon;
        const isSelected = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${isSelected ? 'bg-cyan-500/20 border-cyan-400' : 'bg-black/20 border-transparent hover:bg-white/5'}`}
            title={config.label}
          >
            <Icon size={20} className={isSelected ? 'text-cyan-300' : config.color} />
          </button>
        );
      })}
    </div>
  );
};

// --- LIST BUILDER (FOR MEDIS) ---
const ListBuilder = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) => {
  // Convert newline separated string to array
  const items = value ? value.split('\n') : [];

  const handleAddItem = () => {
    const newItems = [...items, ''];
    onChange(newItems.join('\n'));
  };

  const handleUpdateItem = (idx: number, text: string) => {
    const newItems = [...items];
    newItems[idx] = text;
    onChange(newItems.join('\n'));
  };

  const handleRemoveItem = (idx: number) => {
    const newItems = items.filter((_, i) => i !== idx);
    onChange(newItems.join('\n'));
  };

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-left duration-200">
           <span className="text-xs font-mono text-gray-500 w-4">{idx + 1}.</span>
           <input 
              value={item}
              onChange={(e) => handleUpdateItem(idx, e.target.value)}
              className="flex-1 bg-black/20 rounded border border-white/10 p-2 text-sm text-white focus:border-cyan-400 focus:outline-none"
              placeholder={placeholder}
           />
           <button 
             type="button"
             onClick={() => handleRemoveItem(idx)}
             className="p-2 text-gray-500 hover:text-red-400 transition"
           >
             <X size={14} />
           </button>
        </div>
      ))}
      <button 
        type="button"
        onClick={handleAddItem}
        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-1"
      >
        <Plus size={12} /> Tambah Point
      </button>
    </div>
  );
};

// --- MEDIA UPLOADER ---
const MediaUploader = ({ currentUrl, pendingFile, onFileSelect, label }: any) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentUrl);

  useEffect(() => {
    if (pendingFile) {
      const url = URL.createObjectURL(pendingFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(currentUrl);
    }
  }, [pendingFile, currentUrl]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold flex justify-between">
        <span>{label || "Media"}</span>
        {pendingFile && <span className="text-amber-400 animate-pulse">● Unsaved</span>}
      </label>
      <div className="flex gap-3 items-center">
         <div onClick={() => inputRef.current?.click()} className="w-20 h-20 bg-black/50 rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:border-cyan-400 transition relative">
             {preview ? <img src={preview} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500"><ImageIcon size={20}/></div>}
             <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center text-[9px] text-white font-bold uppercase">Change</div>
         </div>
         <input ref={inputRef} type="file" className="hidden" accept="image/*,video/*" onChange={e => e.target.files?.[0] && onFileSelect(e.target.files[0])} />
      </div>
    </div>
  );
};

// --- EDITOR CARD ---
const ContentEditorCard = ({ item, type, index, onChange, onDeleteClick, onFileStage, pendingFile, onSave, isSaving, isNew }: any) => {
  const [lang, setLang] = useState<'ID' | 'EN'>('ID');

  return (
    <GlassCard noPadding className={`mb-6 border-l-4 relative z-10 ${isNew ? 'border-l-amber-500 bg-amber-500/5' : 'border-l-cyan-500/50'}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-2">
            <div className="flex items-center gap-3">
               <span className="bg-white/10 text-xs font-mono px-2 py-1 rounded text-gray-400">#{index + 1}</span>
               <div className="flex bg-black/40 rounded p-0.5 border border-white/10">
                  <button type="button" onClick={() => setLang('ID')} className={`px-3 py-1 text-[10px] font-bold rounded ${lang === 'ID' ? 'bg-cyan-600 text-white' : 'text-gray-500'}`}>INDONESIA</button>
                  <button type="button" onClick={() => setLang('EN')} className={`px-3 py-1 text-[10px] font-bold rounded ${lang === 'EN' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>ENGLISH</button>
               </div>
            </div>
            <button type="button" onClick={() => onDeleteClick(item)} className="p-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500 hover:text-white transition"><Trash2 size={16}/></button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
           {/* LEFT COLUMN: Media / Icon / Config */}
           <div className="w-full md:w-56 shrink-0 flex flex-col gap-4 border-r border-white/5 pr-0 md:pr-4">
              {type === 'TIPS' ? (
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 uppercase font-bold">Pilih Icon</label>
                    <IconSelector value={item.icon} onChange={(val) => onChange(item.id, 'icon', val)} />
                 </div>
              ) : type !== 'QUIZ' ? (
                 <MediaUploader 
                   currentUrl={item.image_url || item.media_url} 
                   pendingFile={pendingFile} 
                   onFileSelect={(f: File) => onFileStage(item.id, type==='SOP'?'image_url':'media_url', f)} 
                 />
              ) : null}

              {type === 'SOP' && (
                  <div className="space-y-2">
                     <label className="text-[10px] text-gray-400 uppercase font-bold">Category</label>
                     <select value={item.category} onChange={(e) => onChange(item.id, 'category', e.target.value)} className="w-full bg-black/30 text-xs text-white p-2 rounded border border-white/10 outline-none">
                        <option value="persiapan">Persiapan</option>
                        <option value="boat">Boat / Perahu</option>
                        <option value="snorkeling">Snorkeling</option>
                        <option value="kuliner">Kuliner</option>
                     </select>
                     <button type="button" onClick={() => onChange(item.id, 'safe', !item.safe)} className={`w-full mt-2 py-2 text-[10px] font-bold rounded border ${item.safe ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-red-500/20 border-red-500 text-red-300'}`}>
                        {item.safe ? 'ZONA AMAN' : 'ZONA BAHAYA'}
                     </button>
                  </div>
              )}
           </div>

           {/* RIGHT COLUMN: Content Fields */}
           <div className="flex-1 space-y-4">
              {type !== 'QUIZ' ? (
                <>
                  {/* JUDUL */}
                  <div className="space-y-1">
                     <label className="text-[10px] text-cyan-300 uppercase font-bold">Judul / Title ({lang})</label>
                     <input 
                       className="w-full bg-transparent border-b border-white/20 py-2 text-white font-bold text-lg focus:outline-none focus:border-cyan-400"
                       value={lang === 'ID' ? (item.title_id || '') : (item.title_en || '')}
                       onChange={(e) => onChange(item.id, lang === 'ID' ? 'title_id' : 'title_en', e.target.value)}
                       placeholder="Judul Utama..."
                     />
                  </div>

                  {/* KETERANGAN (SOP ONLY) */}
                  {type === 'SOP' && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-yellow-300 uppercase font-bold">Keterangan / Subtitle ({lang})</label>
                      <input 
                        className="w-full bg-black/10 rounded border border-white/10 p-2 text-sm text-yellow-100 focus:outline-none focus:border-yellow-400"
                        value={lang === 'ID' ? (item.subtitle_id || '') : (item.subtitle_en || '')}
                        onChange={(e) => onChange(item.id, lang === 'ID' ? 'subtitle_id' : 'subtitle_en', e.target.value)}
                        placeholder="Contoh: Tujuan & Batasan..."
                      />
                    </div>
                  )}

                  {/* DESKRIPSI / LIST */}
                  <div className="space-y-1">
                     <label className="text-[10px] text-gray-400 uppercase font-bold">
                        {type === 'MEDIS' ? 'Daftar Gejala (List)' : (type === 'TIPS' ? 'Isi Tips' : 'Deskripsi')} ({lang})
                     </label>
                     
                     {type === 'MEDIS' ? (
                        <ListBuilder 
                           value={lang === 'ID' ? (item.action_id || '') : (item.action_en || '')}
                           onChange={(val) => onChange(item.id, lang === 'ID' ? 'action_id' : 'action_en', val)}
                           placeholder={lang === 'ID' ? "Tambah gejala..." : "Add symptom..."}
                        />
                     ) : (
                        <textarea 
                           className="w-full bg-black/20 rounded border border-white/10 p-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-400 min-h-[80px]"
                           value={lang === 'ID' ? (type==='TIPS' ? item.content_id : item.description_id) : (type==='TIPS' ? item.content_en : item.description_en)}
                           onChange={(e) => onChange(item.id, lang === 'ID' ? (type==='TIPS'?'content_id':'description_id') : (type==='TIPS'?'content_en':'description_en'), e.target.value)}
                        />
                     )}
                  </div>
                </>
              ) : (
                 /* QUIZ LOGIC (Simplified for Brevity) */
                 <div className="space-y-2">
                    <label className="text-[10px] text-cyan-300 uppercase font-bold">Pertanyaan ({lang})</label>
                    <input className="w-full bg-transparent border-b border-white/20 py-2 font-bold" value={lang==='ID'?item.text_id:item.text_en} onChange={e=>onChange(item.id,lang==='ID'?'text_id':'text_en',e.target.value)} />
                    <div className="flex gap-4 pt-2">
                       <button onClick={()=>onChange(item.id,'type', item.type==='CORE'?'RISK':'CORE')} className={`px-3 py-1 text-xs border rounded ${item.type==='CORE'?'bg-amber-500/20 text-amber-300':'bg-red-500/20 text-red-300'}`}>{item.type}</button>
                       <button onClick={()=>onChange(item.id,'safe_answer', item.safe_answer==='YES'?'NO':'YES')} className="px-3 py-1 text-xs border rounded border-emerald-500 text-emerald-300">Aman: {item.safe_answer}</button>
                    </div>
                 </div>
              )}
           </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
             <button onClick={()=>onSave('single')} disabled={isSaving} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2">
                {isSaving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Simpan
             </button>
        </div>
      </div>
    </GlassCard>
  );
};

export const ContentManager: React.FC<any> = ({ sopData, medisData, tipsData, questionsData, refreshData }) => {
  const [activeTab, setActiveTab] = useState<'SOP' | 'MEDIS' | 'TIPS' | 'QUIZ'>('SOP');
  const [data, setData] = useState<any>({ SOP: sopData||[], MEDIS: medisData||[], TIPS: tipsData||[], QUIZ: questionsData||[] });
  const [search, setSearch] = useState('');
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<any>({ isOpen: false, itemId: null });
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());

  // Force sync props to state on mount/update
  useEffect(() => {
     setData({ SOP: sopData||[], MEDIS: medisData||[], TIPS: tipsData||[], QUIZ: questionsData||[] });
  }, [sopData, medisData, tipsData, questionsData]);

  const handleFieldChange = (id: string, field: string, val: any) => {
    setData((prev:any) => {
        const list = [...prev[activeTab]];
        const idx = list.findIndex((x:any) => x.id === id);
        if (idx !== -1) list[idx] = { ...list[idx], [field]: val };
        return { ...prev, [activeTab]: list };
    });
  };

  const handleFileStage = (itemId: string, field: string, file: File) => {
    setPendingFiles(prev => ({ ...prev, [`${activeTab}-${itemId}-${field}`]: file }));
  };

  const handleAdd = () => {
    const newId = "new_" + Date.now();
    const defaults: any = {
      SOP: { id: newId, category: 'persiapan', safe: true, title_id: '', title_en: '', subtitle_id: '', subtitle_en: '', description_id: '', description_en: '' },
      MEDIS: { id: newId, title_id: '', title_en: '', action_id: '', action_en: '', type: 'image' }, // List empty by default
      TIPS: { id: newId, title_id: '', title_en: '', content_id: '', content_en: '', icon: 'general' },
      QUIZ: { id: newId, text_id: '', type: 'CORE', safe_answer: 'YES' }
    };
    setData((prev:any) => ({ ...prev, [activeTab]: [defaults[activeTab], ...prev[activeTab]] }));
    setNewlyAddedIds(prev => new Set(prev).add(newId));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setToast({ msg: 'Menyimpan...', type: 'loading' });
    try {
        let finalList = [...data[activeTab]];
        
        // Upload Files
        const uploads = Object.keys(pendingFiles).filter(k => k.startsWith(activeTab));
        for (const k of uploads) {
            const [_, id, field] = k.split('-');
            const url = await uploadFile(pendingFiles[k]);
            if (url) finalList = finalList.map(x => x.id === id ? { ...x, [field]: url } : x);
        }

        const sheetKey = activeTab === 'QUIZ' ? 'QUESTIONS' : activeTab;
        await updateSheetData(SHEET_NAMES[sheetKey as keyof typeof SHEET_NAMES], finalList);
        
        setPendingFiles({});
        setNewlyAddedIds(new Set());
        setToast({ msg: 'Berhasil Disimpan!', type: 'success' });
        refreshData();
    } catch (e: any) {
        setToast({ msg: 'Gagal: ' + e.message, type: 'error' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const id = deleteModal.itemId;
    setDeleteModal({ isOpen: false });
    const newList = data[activeTab].filter((x:any) => x.id !== id);
    setData((prev:any) => ({ ...prev, [activeTab]: newList }));
    
    if (!newlyAddedIds.has(id)) {
        setIsSaving(true);
        try {
            const sheetKey = activeTab === 'QUIZ' ? 'QUESTIONS' : activeTab;
            await updateSheetData(SHEET_NAMES[sheetKey as keyof typeof SHEET_NAMES], newList);
            setToast({ msg: 'Terhapus', type: 'success' });
        } catch (e) {
            setToast({ msg: 'Gagal Hapus', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    }
  };

  const list = data[activeTab].filter((x:any) => {
      const t = (x.title_id || x.text_id || '').toLowerCase();
      return t.includes(search.toLowerCase());
  });

  return (
    <div className="p-6 h-full flex flex-col">
       {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
       <DeleteConfirmationModal isOpen={deleteModal.isOpen} onClose={()=>setDeleteModal({isOpen:false})} onConfirm={handleDelete} itemName="Item ini" />

       <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Content Manager</h1>
          <div className="flex gap-2">
             <div className="relative"><Search size={14} className="absolute top-2.5 left-2 text-gray-500"/><input className="pl-8 bg-black/20 rounded-full border border-white/10 py-1.5 text-xs text-white w-40 focus:border-cyan-400 focus:outline-none" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
             <button onClick={handleAdd} className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Plus size={14}/> Add New</button>
             <button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Save size={14}/> Save All</button>
          </div>
       </div>

       <div className="flex gap-1 mb-6 border-b border-white/10">
          {['SOP','MEDIS','TIPS','QUIZ'].map(t => (
             <button key={t} onClick={()=>setActiveTab(t as any)} className={`px-6 py-2 text-xs font-bold rounded-t-lg transition ${activeTab===t ? 'bg-cyan-900/30 text-cyan-300 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-white'}`}>{t==='QUIZ'?'LOGIC':t}</button>
          ))}
       </div>

       <div className="flex-1 overflow-y-auto pb-20">
          {list.map((item:any, idx:number) => (
             <ContentEditorCard 
                key={item.id} index={idx} item={item} type={activeTab} 
                onChange={handleFieldChange} onDeleteClick={(it:any)=>setDeleteModal({isOpen:true, itemId:it.id})} 
                onFileStage={handleFileStage} pendingFile={pendingFiles[`${activeTab}-${item.id}-${activeTab==='SOP'?'image_url':'media_url'}`]}
                onSave={handleSave} isSaving={isSaving} isNew={newlyAddedIds.has(item.id)}
             />
          ))}
          {list.length===0 && <div className="text-center text-gray-500 py-10">No data found.</div>}
       </div>
    </div>
  );
};
