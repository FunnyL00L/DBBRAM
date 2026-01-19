import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Trash2, Plus, Save, Loader2, CheckCircle, XCircle, Edit2, Search, Image as ImageIcon, Video, FileImage, UploadCloud, AlertCircle, RefreshCw, Server, HardDrive, FileInput } from 'lucide-react';
import { SHEET_NAMES } from '../constants';
import { updateSheetData, uploadFile } from '../services/api';

// --- Toast Component ---
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
      {type === 'info' && <AlertCircle size={20} />}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
};

// --- Confirmation Modal Component ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, itemName: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Hapus Item Ini?</h3>
          <p className="text-gray-400 text-sm mb-6">
            Anda akan menghapus data: <br/>
            <span className="text-white font-semibold">"{itemName || 'Item Tanpa Judul'}"</span>. 
            <br/>Tindakan ini tidak dapat dibatalkan.
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition border border-transparent"
            >
              Batal
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-500 transition shadow-lg shadow-red-900/20"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Media Uploader Component ---
const MediaUploader = ({ currentUrl, pendingFile, onFileSelect, label }: any) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentUrl);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (pendingFile) {
      const url = URL.createObjectURL(pendingFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(currentUrl);
    }
  }, [pendingFile, currentUrl]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const isVideo = pendingFile ? pendingFile.type.startsWith('video/') : (currentUrl?.match(/\.(mp4|webm|ogg)$/i) ? true : false);

  return (
    <div className="flex flex-col gap-2 relative z-20">
      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold flex justify-between">
        <span>{label || "Media (Optional)"}</span>
        {pendingFile && <span className="text-amber-400 animate-pulse">● Belum Disimpan</span>}
      </label>
      
      <div 
        className={`relative flex gap-3 items-center p-2 rounded-lg border border-dashed transition-all duration-200 ${isDragging ? 'bg-cyan-500/20 border-cyan-400 scale-[1.02]' : 'bg-black/20 border-white/10 hover:border-white/30'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
         {preview ? (
            <div 
              className="w-20 h-20 bg-black/50 rounded-lg overflow-hidden border border-white/10 relative group cursor-pointer shadow-lg" 
              onClick={() => inputRef.current?.click()}
            >
               {isVideo ? (
                 <video src={preview} className="w-full h-full object-cover" /> 
               ) : (
                 <img src={preview} className="w-full h-full object-cover" onError={(e:any) => e.target.style.display='none'} />
               )}
               
               <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                  <Edit2 size={16} className="text-white mb-1"/>
                  <span className="text-[8px] font-bold text-white uppercase">Ganti</span>
               </div>
            </div>
         ) : (
            <button 
              type="button"
              onClick={() => inputRef.current?.click()} 
              className="w-20 h-20 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center justify-center text-gray-500 hover:bg-white/10 hover:text-cyan-300 transition cursor-pointer"
            >
               <ImageIcon size={20} className="mb-2 opacity-50"/>
               <span className="text-[8px] font-bold uppercase text-center leading-tight">Add<br/>Media</span>
            </button>
         )}

         <div className="flex-1 min-w-0">
             <input ref={inputRef} type="file" className="hidden" accept="image/*,video/*" onChange={e => e.target.files?.[0] && onFileSelect(e.target.files[0])} />
             
             {pendingFile ? (
               <div className="animate-pulse">
                 <p className="text-[10px] text-amber-300 font-bold truncate">{pendingFile.name}</p>
                 <div className="text-[9px] text-gray-500 mt-1 flex items-center gap-1"><UploadCloud size={10}/> Klik "Simpan" untuk upload.</div>
               </div>
             ) : (
               <div className="opacity-70">
                 <span className={`text-[10px] font-bold block mb-1 ${currentUrl ? 'text-emerald-400' : 'text-gray-500'}`}>
                    {currentUrl ? '✅ Saved' : '⚪ Kosong (Boleh)'}
                 </span>
                 <p className="text-[9px] text-gray-500 leading-tight">Media tidak wajib diisi.</p>
               </div>
             )}
         </div>
      </div>
    </div>
  );
};

// --- Per-Item Editor Card ---
const ContentEditorCard = ({ item, type, index, onChange, onDeleteClick, onFileStage, pendingFile, onSave, isSaving, isNew }: any) => {
  const [lang, setLang] = useState<'ID' | 'EN'>('ID');

  // Validasi sederhana untuk visual feedback
  const isTitleEmpty = (lang === 'ID' && !item.title_id) || (lang === 'EN' && !item.title_en);
  const isDescEmpty = (lang === 'ID' && !item.description_id && !item.action_id && !item.content_id) || 
                      (lang === 'EN' && !item.description_en && !item.action_en && !item.content_en);

  return (
    <GlassCard noPadding className={`mb-6 group border-l-4 relative z-10 transition-all duration-300 ${isNew ? 'border-l-amber-500 animate-in slide-in-from-top-4 bg-amber-500/5' : 'border-l-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]'}`}>
      <div className="p-4 relative">
        {/* Badge Status */}
        {isNew ? (
            <div className="absolute top-0 right-0 bg-amber-500 text-blue-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg z-20 shadow-md flex items-center gap-1">
                <HardDrive size={10} /> DRAFT LOKAL
            </div>
        ) : (
             <div className="absolute top-0 right-0 bg-cyan-900/40 text-cyan-400 text-[10px] font-bold px-2 py-1 rounded-bl-lg z-20 shadow-sm border-b border-l border-cyan-500/20 flex items-center gap-1">
                <Server size={10} /> TERDAFTAR (SERVER)
            </div>
        )}

        {/* HEADER */}
        <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-2">
            <div className="flex items-center gap-3">
               <span className="bg-white/10 text-xs font-mono px-2 py-1 rounded text-gray-400">#{index + 1}</span>
               
               <div className="flex bg-black/40 rounded p-0.5 border border-white/10 cursor-pointer">
                  <button type="button" onClick={() => setLang('ID')} className={`px-3 py-1 text-[10px] font-bold rounded transition ${lang === 'ID' ? 'bg-cyan-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>INDONESIA</button>
                  <button type="button" onClick={() => setLang('EN')} className={`px-3 py-1 text-[10px] font-bold rounded transition ${lang === 'EN' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>ENGLISH</button>
               </div>
            </div>
            
            <button type="button" onClick={() => onDeleteClick(item)} className="md:hidden p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded transition cursor-pointer">
                <Trash2 size={16}/>
            </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
           {/* LEFT COL: Media */}
           {type !== 'QUIZ' && (
             <div className="w-full md:w-56 shrink-0 flex flex-col gap-4 border-r border-white/5 pr-0 md:pr-4">
                <MediaUploader 
                   label={type === 'TIPS' ? 'Icon / Image' : 'Visual Media'}
                   currentUrl={item.image_url || item.media_url || item.icon}
                   pendingFile={pendingFile}
                   onFileSelect={(f: File) => onFileStage(item.id, type==='SOP'?'image_url':type==='MEDIS'?'media_url':'icon', f)}
                />

                {type === 'SOP' && (
                  <div className="space-y-2 relative z-20">
                     <label className="text-[10px] text-gray-400 uppercase font-bold">Category</label>
                     <select value={item.category || 'persiapan'} onChange={(e) => onChange(item.id, 'category', e.target.value)} className="w-full bg-black/30 text-xs text-white p-1.5 rounded border border-white/10 outline-none focus:border-cyan-500 cursor-pointer">
                        <option value="persiapan">Persiapan</option>
                        <option value="boat">Boat / Perahu</option>
                        <option value="snorkeling">Snorkeling / Renang</option>
                        <option value="kuliner">Kuliner</option>
                     </select>
                     
                     <label className="text-[10px] text-gray-400 uppercase font-bold mt-2 block">Safety Status</label>
                     <button type="button" onClick={() => onChange(item.id, 'safe', !item.safe)} className={`w-full py-1.5 text-[10px] font-bold rounded border cursor-pointer ${item.safe ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-red-500/20 border-red-500 text-red-300'}`}>
                        {item.safe ? 'AMAN / SAFE' : 'BAHAYA / DANGER'}
                     </button>
                  </div>
                )}
             </div>
           )}

           {/* RIGHT COL: Content */}
           <div className="flex-1 space-y-4">
              {type !== 'QUIZ' && (
                <>
                  <div className="space-y-1">
                     <label className="flex items-center gap-1 text-[10px] text-cyan-300 uppercase font-bold">
                        {type === 'MEDIS' ? 'Nama Gejala' : 'Judul'} ({lang}) 
                        <span className="text-red-400">*</span>
                        {isTitleEmpty && <span className="text-[9px] text-red-400 normal-case ml-2 animate-pulse">(Wajib diisi)</span>}
                     </label>
                     <input 
                       className={`w-full bg-transparent border-b py-2 text-white font-bold text-lg focus:outline-none ${isTitleEmpty ? 'border-red-500/50' : 'border-white/20 focus:border-cyan-400'}`}
                       placeholder={lang === 'ID' ? 'Contoh: Jalan Santai' : 'Ex: Relaxing Walk'}
                       value={lang === 'ID' ? (item.title_id || '') : (item.title_en || '')}
                       onChange={(e) => onChange(item.id, lang === 'ID' ? 'title_id' : 'title_en', e.target.value)}
                     />
                  </div>

                  <div className="space-y-1">
                     <label className="flex items-center gap-1 text-[10px] text-gray-400 uppercase font-bold">
                        {type === 'MEDIS' ? 'Tindakan / Action' : 'Deskripsi / Description'} ({lang}) 
                        <span className="text-red-400">*</span>
                        {isDescEmpty && <span className="text-[9px] text-red-400 normal-case ml-2 animate-pulse">(Wajib diisi)</span>}
                     </label>
                     {type === 'MEDIS' ? (
                        <input 
                           className={`w-full bg-black/20 rounded border p-2 text-sm text-white focus:outline-none ${isDescEmpty ? 'border-red-500/50' : 'border-white/10 focus:border-cyan-400'}`}
                           value={lang === 'ID' ? (item.action_id || '') : (item.action_en || '')}
                           onChange={(e) => onChange(item.id, lang === 'ID' ? 'action_id' : 'action_en', e.target.value)}
                        />
                     ) : (
                        <textarea 
                           className={`w-full bg-black/20 rounded border p-2 text-sm text-gray-300 focus:outline-none min-h-[80px] ${isDescEmpty ? 'border-red-500/50' : 'border-white/10 focus:border-cyan-400'}`}
                           value={lang === 'ID' ? (type==='TIPS'?(item.content_id||''):(item.description_id||'')) : (type==='TIPS'?(item.content_en||''):(item.description_en||''))}
                           onChange={(e) => onChange(item.id, lang === 'ID' ? (type==='TIPS'?'content_id':'description_id') : (type==='TIPS'?'content_en':'description_en'), e.target.value)}
                        />
                     )}
                  </div>
                </>
              )}

              {type === 'QUIZ' && (
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] text-cyan-300 uppercase font-bold">Pertanyaan / Question ({lang}) <span className="text-red-400">*</span></label>
                       <input 
                          className="w-full bg-transparent border-b border-white/20 py-2 text-white font-bold text-base focus:border-cyan-400 focus:outline-none"
                          value={lang === 'ID' ? (item.text_id || '') : (item.text_en || '')}
                          onChange={(e) => onChange(item.id, lang === 'ID' ? 'text_id' : 'text_en', e.target.value)}
                       />
                    </div>
                    {/* Quiz options kept same as before */}
                    <div className="bg-white/5 rounded-lg p-3 grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Tipe</label>
                          <div className="flex flex-col gap-1">
                             <button type="button" onClick={() => onChange(item.id, 'type', 'CORE')} className={`text-left px-2 py-1.5 rounded text-xs border cursor-pointer ${item.type === 'CORE' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'border-transparent text-gray-500'}`}>CORE (Syarat Wajib)</button>
                             <button type="button" onClick={() => onChange(item.id, 'type', 'RISK')} className={`text-left px-2 py-1.5 rounded text-xs border cursor-pointer ${item.type === 'RISK' ? 'bg-red-500/20 border-red-500 text-red-300' : 'border-transparent text-gray-500'}`}>RISK (Bahaya)</button>
                          </div>
                       </div>
                       <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Jawaban Aman</label>
                          <div className="flex gap-2">
                             <button type="button" onClick={() => onChange(item.id, 'safe_answer', 'YES')} className={`flex-1 py-2 rounded text-xs font-bold border cursor-pointer ${item.safe_answer === 'YES' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-black/20 border-transparent text-gray-500'}`}>YES</button>
                             <button type="button" onClick={() => onChange(item.id, 'safe_answer', 'NO')} className={`flex-1 py-2 rounded text-xs font-bold border cursor-pointer ${item.safe_answer === 'NO' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-black/20 border-transparent text-gray-500'}`}>NO</button>
                          </div>
                       </div>
                    </div>
                 </div>
              )}
           </div>
        </div>
        
        {/* FOOTER ACTIONS */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-3 items-stretch sm:items-center relative z-50">
            <button 
                type="button"
                onClick={() => onDeleteClick(item)} 
                disabled={isSaving}
                className="px-4 py-3 sm:py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center gap-2 text-sm sm:text-xs font-bold transition-all cursor-pointer hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Trash2 size={16}/> HAPUS
            </button>
            <button 
                type="button"
                onClick={() => onSave('single')}
                disabled={isSaving}
                className="px-6 py-3 sm:py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg flex items-center justify-center gap-2 text-sm sm:text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait hover:shadow-emerald-500/30"
            >
                {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} 
                SIMPAN PERUBAHAN
            </button>
        </div>
      </div>
    </GlassCard>
  );
};

export const ContentManager: React.FC<any> = ({ sopData, medisData, tipsData, questionsData = [], refreshData }) => {
  const [activeTab, setActiveTab] = useState<'SOP' | 'MEDIS' | 'TIPS' | 'QUIZ'>('SOP');
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [dirtyTabs, setDirtyTabs] = useState<Record<string, boolean>>({});

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, itemId: string | null, itemName: string }>({ 
    isOpen: false, itemId: null, itemName: '' 
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<any>({ 
    SOP: sopData || [], 
    MEDIS: medisData || [], 
    TIPS: tipsData || [], 
    QUIZ: [...(questionsData || [])].sort((a:any,b:any) => a.index - b.index) 
  });
  
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());

  // SYNC PROPS TO STATE (Robust)
  useEffect(() => {
    setData((prev: any) => ({
      SOP: dirtyTabs['SOP'] ? prev.SOP : (sopData || []),
      MEDIS: dirtyTabs['MEDIS'] ? prev.MEDIS : (medisData || []),
      TIPS: dirtyTabs['TIPS'] ? prev.TIPS : (tipsData || []),
      QUIZ: dirtyTabs['QUIZ'] ? prev.QUIZ : ([...(questionsData || [])].sort((a:any,b:any) => a.index - b.index))
    }));
  }, [sopData, medisData, tipsData, questionsData, dirtyTabs]);

  const handleManualRefresh = () => {
    if(Object.values(dirtyTabs).some(v => v)) {
        if(!window.confirm("Ada perubahan yang belum disimpan (draft). Refresh data akan me-reset perubahan Anda. Lanjutkan?")) return;
    }
    setDirtyTabs({});
    setNewlyAddedIds(new Set());
    setToast({ msg: 'Memanggil data terbaru dari server...', type: 'loading' });
    
    if (refreshData) {
        refreshData(true); 
    }
  };

  const handleFieldChange = useCallback((id: string, field: string, val: any) => {
    setDirtyTabs(prev => ({ ...prev, [activeTab]: true }));
    setData((prev:any) => {
        const newData = { ...prev };
        const items = [...newData[activeTab]];
        const realIndex = items.findIndex((item:any) => item.id === id);
        
        if (realIndex !== -1) {
            items[realIndex] = { ...items[realIndex], [field]: val };
            newData[activeTab] = items;
        }
        return newData;
    });
  }, [activeTab]);

  const handleFileStage = useCallback((itemId: string, field: string, file: File) => {
    setDirtyTabs(prev => ({ ...prev, [activeTab]: true }));
    setPendingFiles(prev => ({ ...prev, [`${activeTab}-${itemId}-${field}`]: file }));
  }, [activeTab]);

  const handleAdd = () => {
    const newId = "id_" + Date.now(); 
    const defaults: any = {
      SOP: { id: newId, category: 'persiapan', safe: true, title_id: '', title_en: '', image_url: '', description_id: '', description_en: '' },
      MEDIS: { id: newId, title_id: '', title_en: '', action_id: '', action_en: '', media_url: '', type: 'image' },
      TIPS: { id: newId, title_id: '', title_en: '', content_id: '', content_en: '', icon: '' },
      QUIZ: { id: newId, index: data.QUIZ.length + 1, text_id: '', text_en: '', type: 'CORE', safe_answer: 'YES' }
    };

    const newItem = defaults[activeTab];
    const currentList = [newItem, ...data[activeTab]];
    setData((prev: any) => ({ ...prev, [activeTab]: currentList }));
    setDirtyTabs((prev: any) => ({ ...prev, [activeTab]: true }));
    setNewlyAddedIds(prev => new Set(prev).add(newId));

    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setToast({ msg: 'Item baru ditambahkan. Jangan lupa Simpan!', type: 'info' });
  };

  // --- VALIDATION LOGIC ---
  const validateData = (list: any[]) => {
    for (const item of list) {
        if (activeTab === 'QUIZ') {
            if (!item.text_id || !item.text_en) return "Pertanyaan (Question) ID dan EN wajib diisi!";
        } else {
            if (!item.title_id || !item.title_en) return `Item tanpa judul ditemukan. Judul (Title) ID dan EN wajib diisi!`;
            const descId = item.description_id || item.action_id || item.content_id;
            const descEn = item.description_en || item.action_en || item.content_en;
            if (!descId || !descEn) return `Item "${item.title_id || 'Baru'}" belum lengkap. Deskripsi/Konten ID dan EN wajib diisi!`;
        }
    }
    return null; // Valid
  };

  const handleSave = async (mode: 'single' | 'all' = 'all') => {
    // 1. Validate Fields
    const currentList = [...data[activeTab]];
    const validationError = validateData(currentList);
    if (validationError) {
        window.alert(`GAGAL SIMPAN!\n\n${validationError}`);
        return;
    }

    const pendingCount = Object.keys(pendingFiles).filter(k => k.startsWith(activeTab)).length;
    
    // 2. Confirm Save (Hanya jika mode 'all')
    if (mode === 'all') {
        const confirmation = window.confirm(
            `KONFIRMASI GLOBAL (${activeTab}):\n\n` +
            `Simpan seluruh data ${activeTab} ke Database?\n` +
            (pendingCount > 0 ? `- Ada ${pendingCount} file media baru akan diupload.\n` : '')
        );
        if(!confirmation) return;
    }
    
    setIsSaving(true);
    setToast({ msg: 'Menyimpan ke Google Sheet...', type: 'loading' });

    try {
      let finalData = JSON.parse(JSON.stringify(currentList));
      
      const uploads = Object.keys(pendingFiles).filter(k => k.startsWith(activeTab));
      let uploadedCount = 0;

      for (const key of uploads) {
        const parts = key.split('-');
        const field = parts.pop();
        const type = parts.shift();
        const itemId = parts.join('-');
        
        if (!itemId || !field) continue;
        const fileToUpload = pendingFiles[key];

        setToast({ msg: `Uploading File (${uploadedCount + 1}/${uploads.length})...`, type: 'loading' });
        const url = await uploadFile(fileToUpload);
        
        if (url) {
           finalData = finalData.map((item:any) => 
             item.id === itemId 
             ? { 
                 ...item, 
                 [field]: url, 
                 ...(activeTab === 'MEDIS' ? { type: fileToUpload.type.startsWith('video') ? 'video' : 'image' } : {}) 
               } 
             : item
           );
           uploadedCount++;
        }
      }

      setToast({ msg: 'Finalizing Update...', type: 'loading' });
      const sheetKey = (activeTab === 'QUIZ' ? 'QUESTIONS' : activeTab) as keyof typeof SHEET_NAMES;
      
      // CALL API
      // Walaupun 'single', kita tetap kirim full list karena backend me-replace sheet
      await updateSheetData(SHEET_NAMES[sheetKey], finalData);
      
      // SUCCESS STATE
      setData((prev: any) => ({ ...prev, [activeTab]: finalData }));
      setPendingFiles(prev => {
        const next = {...prev};
        uploads.forEach(k => delete next[k]); 
        return next;
      });
      setDirtyTabs(prev => ({ ...prev, [activeTab]: false }));
      setNewlyAddedIds(new Set()); 
      setToast({ msg: 'Data Berhasil Disimpan!', type: 'success' });
      
      // EXPLICIT ALERT SUCCESS
      window.alert(`SUKSES!\n\nData ${activeTab} berhasil disimpan ke server.`);

    } catch(e: any) {
      console.error(e);
      setToast({ msg: 'GAGAL MENYIMPAN!', type: 'error' });
      window.alert(`GAGAL MENYIMPAN!\n\nPenyebab Error:\n${e.message}\n\nTips: Cek koneksi internet atau coba refresh halaman.`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- DELETE LOGIC ---
  const initiateDelete = (item: any) => {
    const name = item.title_id || item.text_id || "Item Baru";
    setDeleteModal({ isOpen: true, itemId: item.id, itemName: name });
  };

  const confirmDelete = async () => {
    const id = deleteModal.itemId;
    if (!id) return;
    setDeleteModal(prev => ({ ...prev, isOpen: false })); // Close modal first

    // CHECK IF LOCAL ONLY (Fix: "Gak mau ke hapus padahal belum masuk server")
    const isLocalOnly = newlyAddedIds.has(id);

    setIsSaving(true); // Block UI
    setToast({ msg: isLocalOnly ? 'Menghapus (Lokal)...' : 'Menghapus dari Server...', type: 'loading' });

    const prevList = [...data[activeTab]];
    const newList = prevList.filter((item:any) => item.id !== id);
    if(activeTab === 'QUIZ') {
         newList.forEach((q:any, i:number) => q.index = i + 1);
    }
    
    // Update UI immediately
    setData((prev: any) => ({ ...prev, [activeTab]: newList }));

    // IF LOCAL ONLY: STOP HERE (Success)
    if (isLocalOnly) {
        setNewlyAddedIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
        setIsSaving(false);
        setToast({ msg: 'Item Dibatalkan (Lokal)', type: 'info' });
        return;
    }

    // IF SERVER: SYNC
    try {
        const sheetKey = (activeTab === 'QUIZ' ? 'QUESTIONS' : activeTab) as keyof typeof SHEET_NAMES;
        await updateSheetData(SHEET_NAMES[sheetKey], newList);

        setDirtyTabs((prev: any) => ({ ...prev, [activeTab]: false }));
        setToast({ msg: 'Item Terhapus', type: 'success' });
        window.alert("BERHASIL! Item telah dihapus permanen dari Database.");

    } catch (e: any) {
        // REVERT IF FAIL
        setData((prev: any) => ({ ...prev, [activeTab]: prevList })); 
        setToast({ msg: 'Gagal hapus', type: 'error' });
        window.alert(`GAGAL MENGHAPUS!\n\nPenyebab Error:\n${e.message}`);
    } finally {
        setIsSaving(false);
    }
  };

  const filteredList = data[activeTab].filter((item: any) => {
    if(!search) return true;
    const term = search.toLowerCase();
    const txt = (item.title_id || item.text_id || '') + (item.title_en || item.text_en || '');
    return txt.toLowerCase().includes(term);
  });

  return (
    <div className="p-6 h-full flex flex-col animate-in fade-in">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <DeleteConfirmationModal 
         isOpen={deleteModal.isOpen} 
         onClose={() => setDeleteModal(prev => ({...prev, isOpen: false}))} 
         onConfirm={confirmDelete}
         itemName={deleteModal.itemName}
      />
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 relative z-50">
        <div>
           <h1 className="text-2xl font-bold text-white tracking-tight">Content Manager</h1>
           <p className="text-xs text-gray-400">Kelola Data: {activeTab}</p>
        </div>
        <div className="flex gap-3 items-center w-full md:w-auto">
           <div className="relative flex-1 md:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari..." className="w-full md:w-48 bg-black/20 border border-white/10 rounded-full pl-8 pr-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"/>
           </div>

           {/* REFRESH DATA BUTTON (Explicit Call Data) */}
           <button 
             type="button"
             onClick={handleManualRefresh}
             title="Reload Data dari Google Sheet"
             className="bg-white/5 hover:bg-white/10 p-2 rounded-lg text-gray-300 hover:text-white transition shadow-sm border border-white/10"
           >
              <RefreshCw size={16} className={isSaving ? "animate-spin" : ""}/>
           </button>
           
           <button type="button" onClick={handleAdd} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg text-white font-bold text-xs flex items-center gap-2 transition shadow-lg cursor-pointer transform active:scale-95">
              <Plus size={16}/> New Item
           </button>
           
           {/* GLOBAL SAVE BUTTON - Always visible */}
           <button 
                type="button" 
                onClick={() => handleSave('all')} 
                disabled={isSaving} 
                className={`flex px-4 py-2 rounded-lg text-white font-bold text-xs items-center gap-2 transition shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer active:scale-95 ${dirtyTabs[activeTab] ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-gray-700 hover:bg-gray-600'}`}
           >
             {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} 
             <span className="hidden md:inline">Save All (Global)</span>
           </button>
        </div>
      </div>

      <div className="flex border-b border-white/10 mb-6 gap-1 overflow-x-auto relative z-40">
        {['SOP','MEDIS','TIPS','QUIZ'].map((t:any) => (
          <button key={t} onClick={()=>setActiveTab(t)} className={`px-6 py-3 text-xs font-bold transition rounded-t-lg tracking-wider relative cursor-pointer ${activeTab===t ? 'bg-gradient-to-t from-cyan-900/40 to-transparent text-cyan-300 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-white'}`}>
            {t === 'QUIZ' ? 'LOGIC' : t}
            {dirtyTabs[t] && (
               <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_orange]" title="Unsaved Changes"></span>
            )}
          </button>
        ))}
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pr-2 pb-20 relative z-0 scroll-smooth">
         {filteredList.length === 0 ? (
            <div className="text-center text-gray-500 py-10 italic border border-dashed border-white/10 rounded-xl">Belum ada data. Klik "New Item".</div>
         ) : (
            filteredList.map((item: any, idx: number) => (
               <ContentEditorCard 
                  key={item.id || idx}
                  index={idx}
                  type={activeTab}
                  item={item}
                  onChange={handleFieldChange}
                  onDeleteClick={initiateDelete} // Use new initiateDelete
                  onFileStage={handleFileStage}
                  onSave={() => handleSave('single')} // Single Item Save
                  isSaving={isSaving}
                  isNew={newlyAddedIds.has(item.id)}
                  pendingFile={pendingFiles[`${activeTab}-${item.id}-${activeTab==='SOP'?'image_url':activeTab==='MEDIS'?'media_url':'icon'}`]}
               />
            ))
         )}
      </div>
    </div>
  );
};