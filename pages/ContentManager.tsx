
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Trash2, Plus, Save, Loader2, CheckCircle, XCircle, Search, ListPlus, Globe } from 'lucide-react';
import { SHEET_NAMES } from '../constants';
import { updateSheetData } from '../services/api';

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

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-full shadow-2xl backdrop-blur-md border animate-in slide-in-from-bottom duration-300 ${bgColor} min-w-[200px] justify-center`}>
      {type === 'loading' ? <Loader2 size={16} className="animate-spin" /> : type === 'success' ? <CheckCircle size={16}/> : <XCircle size={16}/>}
      <span className="font-bold text-xs">{message}</span>
    </div>
  );
};

// --- EDITOR CARD (MOBILE OPTIMIZED) ---
const ContentEditorCard = ({ item, index, onChange, onDeleteClick }: any) => {
  const [lang, setLang] = useState<'ID' | 'EN'>('ID');

  return (
    <div className="bg-[#111827] border border-white/10 rounded-xl mb-4 overflow-hidden shadow-lg">
      {/* Card Header */}
      <div className="bg-white/5 p-3 flex justify-between items-center border-b border-white/5">
         <div className="flex items-center gap-2">
            <span className="bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold px-2 py-0.5 rounded">Q{index + 1}</span>
            <div className="flex bg-black/40 rounded p-0.5 border border-white/10">
                <button onClick={() => setLang('ID')} className={`px-2 py-0.5 text-[10px] font-bold rounded ${lang === 'ID' ? 'bg-cyan-600 text-white' : 'text-gray-500'}`}>ID</button>
                <button onClick={() => setLang('EN')} className={`px-2 py-0.5 text-[10px] font-bold rounded ${lang === 'EN' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>EN</button>
            </div>
         </div>
         <button onClick={() => onDeleteClick(item)} className="p-1.5 text-gray-500 hover:text-red-400 transition"><Trash2 size={16}/></button>
      </div>

      <div className="p-4 space-y-4">
         {/* Question Text */}
         <div>
            <label className="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase font-bold mb-1.5">
               <Globe size={10} /> Pertanyaan ({lang})
            </label>
            <textarea 
               rows={2}
               className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:bg-white/5 transition-all"
               value={lang==='ID' ? (item.text_id || '') : (item.text_en || '')} 
               onChange={e => onChange(item.id, lang==='ID' ? 'text_id' : 'text_en', e.target.value)} 
               placeholder={lang === 'ID' ? "Tulis pertanyaan disini..." : "Type question here..."}
            />
         </div>

         {/* Logic Controls */}
         <div className="grid grid-cols-2 gap-3">
             <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Tipe</label>
                <button 
                  onClick={() => onChange(item.id, 'type', item.type === 'CORE' ? 'RISK' : 'CORE')} 
                  className={`w-full py-2 text-xs font-bold rounded border transition-all ${item.type === 'CORE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}
                >
                  {item.type === 'CORE' ? 'INTI' : 'RISIKO'}
                </button>
             </div>
             <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                <label className="text-[9px] text-gray-500 uppercase font-bold block mb-1">Jawaban Aman</label>
                <button 
                  onClick={() => onChange(item.id, 'safe_answer', item.safe_answer === 'YES' ? 'NO' : 'YES')} 
                  className={`w-full py-2 text-xs font-bold rounded border transition-all ${item.safe_answer === 'YES' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-gray-700/50 text-gray-400 border-gray-600'}`}
                >
                  {item.safe_answer === 'YES' ? 'YA (YES)' : 'TIDAK (NO)'}
                </button>
             </div>
         </div>
      </div>
    </div>
  );
};

export const ContentManager: React.FC<any> = ({ questionsData, refreshData }) => {
  const [data, setData] = useState<any>(questionsData || []);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<any>(null);

  useEffect(() => { setData(questionsData || []); }, [questionsData]);

  const handleFieldChange = (id: string, field: string, val: any) => {
    setData((prev:any) => {
        const list = [...prev];
        const idx = list.findIndex((x:any) => x.id === id);
        if (idx !== -1) list[idx] = { ...list[idx], [field]: val };
        return list;
    });
  };

  const handleAdd = () => {
    const newId = "new_" + Date.now();
    setData((prev:any) => [{ id: newId, text_id: '', text_en: '', type: 'CORE', safe_answer: 'YES' }, ...prev]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setToast({ msg: 'Menyimpan...', type: 'loading' });
    try {
        await updateSheetData(SHEET_NAMES.QUESTIONS, data);
        setToast({ msg: 'Tersimpan!', type: 'success' });
        refreshData();
    } catch (e: any) {
        setToast({ msg: 'Gagal', type: 'error' });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if(confirm("Hapus pertanyaan ini?")) {
        setData((prev:any) => prev.filter((x:any) => x.id !== id));
    }
  };

  const list = data.filter((x:any) => (x.text_id || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-full flex flex-col bg-[#0a1120] relative">
       {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}

       {/* Sticky Header */}
       <div className="sticky top-0 z-20 bg-[#0a1120]/80 backdrop-blur-md p-4 border-b border-white/10 flex justify-between items-center shadow-md">
          <h1 className="text-lg font-bold text-white">Logic Manager</h1>
          <div className="flex gap-2">
             <button onClick={handleAdd} className="p-2 bg-cyan-600 rounded-lg text-white hover:bg-cyan-500 shadow-lg shadow-cyan-500/20 active:scale-95 transition">
                <Plus size={20}/>
             </button>
             <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-emerald-600 rounded-lg text-white font-bold text-xs flex items-center gap-2 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 active:scale-95 transition disabled:opacity-50">
                {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                <span>SIMPAN</span>
             </button>
          </div>
       </div>

       {/* Content Scrollable */}
       <div className="flex-1 overflow-y-auto p-4 pb-20">
          <div className="mb-4 relative">
             <Search className="absolute left-3 top-2.5 text-gray-500" size={16}/>
             <input 
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                placeholder="Cari pertanyaan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
             />
          </div>

          <div className="space-y-4">
             {list.map((item:any, idx:number) => (
                <ContentEditorCard 
                   key={item.id} index={idx} item={item}
                   onChange={handleFieldChange} onDeleteClick={() => handleDelete(item.id)}
                />
             ))}
             {list.length === 0 && <div className="text-center text-gray-500 text-sm mt-10">Belum ada data pertanyaan.</div>}
          </div>
       </div>
    </div>
  );
};
