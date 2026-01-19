
import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Trash2, Plus, Save, Loader2, CheckCircle, XCircle, Search, ListPlus } from 'lucide-react';
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

// --- EDITOR CARD ---
const ContentEditorCard = ({ item, index, onChange, onDeleteClick, onSave, isSaving, isNew }: any) => {
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

        <div className="flex flex-col gap-6">
           {/* QUIZ LOGIC FIELDS */}
           <div className="space-y-2">
              <label className="text-[10px] text-cyan-300 uppercase font-bold">Pertanyaan Screening ({lang})</label>
              <input 
                className="w-full bg-transparent border-b border-white/20 py-2 font-bold text-white focus:outline-none focus:border-cyan-400" 
                value={lang==='ID' ? (item.text_id || '') : (item.text_en || '')} 
                onChange={e => onChange(item.id, lang==='ID' ? 'text_id' : 'text_en', e.target.value)} 
                placeholder="Masukkan pertanyaan..."
              />
              
              <div className="flex gap-4 pt-4">
                 <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 uppercase font-bold">Tipe Pertanyaan</label>
                    <button 
                      onClick={() => onChange(item.id, 'type', item.type === 'CORE' ? 'RISK' : 'CORE')} 
                      className={`px-4 py-2 text-xs font-bold rounded border transition-all ${item.type === 'CORE' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-red-500/20 text-red-300 border-red-500/50'}`}
                    >
                      {item.type === 'CORE' ? 'CORE (Inti)' : 'RISK (Risiko)'}
                    </button>
                 </div>

                 <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gray-400 uppercase font-bold">Jawaban Aman</label>
                    <button 
                      onClick={() => onChange(item.id, 'safe_answer', item.safe_answer === 'YES' ? 'NO' : 'YES')} 
                      className={`px-4 py-2 text-xs font-bold rounded border border-emerald-500/50 transition-all ${item.safe_answer === 'YES' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-700 text-gray-300'}`}
                    >
                      {item.safe_answer === 'YES' ? 'YES (Ya)' : 'NO (Tidak)'}
                    </button>
                 </div>
              </div>
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

export const ContentManager: React.FC<any> = ({ questionsData, refreshData }) => {
  // Only handling QUESTIONS now
  const [data, setData] = useState<any>(questionsData || []);
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<any>({ isOpen: false, itemId: null });
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());

  // Force sync props to state on mount/update
  useEffect(() => {
     setData(questionsData || []);
  }, [questionsData]);

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
    const newItem = { id: newId, text_id: '', text_en: '', type: 'CORE', safe_answer: 'YES' };
    
    setData((prev:any) => [newItem, ...prev]);
    setNewlyAddedIds(prev => new Set(prev).add(newId));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setToast({ msg: 'Menyimpan Logic...', type: 'loading' });
    try {
        await updateSheetData(SHEET_NAMES.QUESTIONS, data);
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
    const newList = data.filter((x:any) => x.id !== id);
    setData(newList);
    
    if (!newlyAddedIds.has(id)) {
        setIsSaving(true);
        try {
            await updateSheetData(SHEET_NAMES.QUESTIONS, newList);
            setToast({ msg: 'Terhapus', type: 'success' });
        } catch (e) {
            setToast({ msg: 'Gagal Hapus', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    }
  };

  const list = data.filter((x:any) => {
      const t = (x.text_id || '').toLowerCase();
      return t.includes(search.toLowerCase());
  });

  return (
    <div className="p-6 h-full flex flex-col">
       {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
       <DeleteConfirmationModal isOpen={deleteModal.isOpen} onClose={()=>setDeleteModal({isOpen:false})} onConfirm={handleDelete} itemName="Pertanyaan ini" />

       <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Logic Manager</h1>
            <p className="text-sm text-gray-400">Atur pertanyaan screening dan logika keselamatan.</p>
          </div>
          <div className="flex gap-2">
             <div className="relative"><Search size={14} className="absolute top-2.5 left-2 text-gray-500"/><input className="pl-8 bg-black/20 rounded-full border border-white/10 py-1.5 text-xs text-white w-40 focus:border-cyan-400 focus:outline-none" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
             <button onClick={handleAdd} className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Plus size={14}/> Add Question</button>
             <button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><Save size={14}/> Save All</button>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto pb-20">
          {list.map((item:any, idx:number) => (
             <ContentEditorCard 
                key={item.id} index={idx} item={item}
                onChange={handleFieldChange} onDeleteClick={(it:any)=>setDeleteModal({isOpen:true, itemId:it.id})} 
                onSave={handleSave} isSaving={isSaving} isNew={newlyAddedIds.has(item.id)}
             />
          ))}
          {list.length===0 && <div className="text-center text-gray-500 py-10">No questions found.</div>}
       </div>
    </div>
  );
};
