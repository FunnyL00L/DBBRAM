
import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { ScreeningResult } from '../types';
import { Search, Download, CheckCircle, AlertTriangle, AlertOctagon, Eye, X, Activity, MapPin, Calendar, User } from 'lucide-react';

interface ScreeningInboxProps {
  data: ScreeningResult[];
}

// --- DETAIL MODAL COMPONENT (Reused) ---
const ScreeningDetailModal = ({ data, onClose }: { data: ScreeningResult, onClose: () => void }) => {
  if (!data) return null;

  const reasons: string[] = [];
  if (data.pregnancyWeeks < 14) reasons.push(`Usia kehamilan **${data.pregnancyWeeks} minggu** (Terlalu Dini).`);
  else if (data.pregnancyWeeks > 26) reasons.push(`Usia kehamilan **${data.pregnancyWeeks} minggu** (Terlalu Tua).`);

  if (data.riskFactors && data.riskFactors.length > 2 && data.riskFactors !== 'None') {
    data.riskFactors.split(/,|;/).forEach(r => { if(r.trim()) reasons.push(r.trim()) });
  }

  const isSafe = data.status === 'ZONA HIJAU' || data.status === 'AMAN';
  const isWarning = data.status === 'ZONA KUNING';
  const isDanger = data.status === 'ZONA MERAH' || data.status === 'BAHAYA';

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border-t md:border border-white/20 rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]">
        
        {/* Modal Header */}
        <div className={`p-5 border-b border-white/10 flex justify-between items-start ${
          isDanger ? 'bg-red-900/30' : isWarning ? 'bg-amber-900/30' : 'bg-emerald-900/30'
        }`}>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
               {data.name}
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
               {isDanger && <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">TIDAK REKOMENDASI</span>}
               {isWarning && <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded">PENGAWASAN</span>}
               {isSafe && <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded">AMAN</span>}
               {data.lat && (
                 <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold rounded flex items-center gap-1">
                    <MapPin size={10}/> {data.lat.toFixed(4)}, {data.lng?.toFixed(4)}
                 </span>
               )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"><X size={18} className="text-white"/></button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4">
           {/* Grid Info */}
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                 <div className="text-[10px] text-gray-500 uppercase font-bold">Usia Ibu</div>
                 <div className="text-lg font-bold text-white">{data.age} Th</div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                 <div className="text-[10px] text-gray-500 uppercase font-bold">Kehamilan</div>
                 <div className={`text-lg font-bold ${data.pregnancyWeeks < 14 || data.pregnancyWeeks > 26 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {data.pregnancyWeeks} Mgg
                 </div>
              </div>
           </div>

           {/* Risk List */}
           {reasons.length > 0 ? (
             <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                <h3 className="text-red-300 text-sm font-bold flex items-center gap-2 mb-2">
                   <Activity size={16}/> Faktor Risiko:
                </h3>
                <ul className="space-y-2">
                   {reasons.map((r, i) => (
                     <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="mt-1 w-1 h-1 bg-red-400 rounded-full flex-shrink-0"></span>
                        <span dangerouslySetInnerHTML={{ __html: r.replace(/\*\*/g, '') }} />
                     </li>
                   ))}
                </ul>
             </div>
           ) : (
             <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
                <CheckCircle size={20} className="text-emerald-400" />
                <span className="text-sm text-emerald-200">Tidak ada masalah kesehatan terdeteksi.</span>
             </div>
           )}

           {/* Notes */}
           {data.notes && (
             <div className="pt-2">
                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Notes</div>
                <div className="bg-black/30 p-2 rounded text-xs text-gray-500 font-mono break-all">
                   {data.notes}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};


// --- MAIN INBOX COMPONENT ---
export const ScreeningInbox: React.FC<ScreeningInboxProps> = ({ data }) => {
  const [filter, setFilter] = useState<'ALL' | 'HIJAU' | 'KUNING' | 'MERAH'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<ScreeningResult | null>(null);

  const filteredData = data.filter(item => {
    const status = item.status;
    let matchesFilter = true;
    if (filter === 'HIJAU') matchesFilter = status === 'ZONA HIJAU' || status === 'AMAN';
    if (filter === 'KUNING') matchesFilter = status === 'ZONA KUNING';
    if (filter === 'MERAH') matchesFilter = status === 'ZONA MERAH' || status === 'BAHAYA';

    const itemName = item.name || '';
    const matchesSearch = itemName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderBadge = (status: string) => {
    const isGreen = status === 'ZONA HIJAU' || status === 'AMAN';
    const isYellow = status === 'ZONA KUNING';
    const colorClass = isGreen ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 
                       isYellow ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 
                       'bg-red-500/20 text-red-300 border-red-500/30';
    const Icon = isGreen ? CheckCircle : isYellow ? AlertTriangle : AlertOctagon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${colorClass}`}>
        <Icon size={10} /> {status.replace('ZONA ', '')}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col p-2 md:p-6 animate-in fade-in zoom-in-95 duration-300">
      {selectedItem && <ScreeningDetailModal data={selectedItem} onClose={() => setSelectedItem(null)} />}

      {/* HEADER & FILTER */}
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-3xl font-bold text-white">Inbox Data</h1>
          <div className="text-xs text-gray-500">{filteredData.length} Tamu</div>
        </div>
        
        <GlassCard noPadding className="flex flex-col md:flex-row gap-2 p-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {(['ALL', 'HIJAU', 'KUNING', 'MERAH'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                  filter === f ? 'bg-cyan-600 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* CONTENT: MOBILE CARDS & DESKTOP TABLE */}
      <div className="flex-1 overflow-y-auto min-h-0">
        
        {/* MOBILE VIEW (CARDS) - HIDDEN ON DESKTOP */}
        <div className="md:hidden space-y-3 pb-20">
           {filteredData.map((row, idx) => (
             <div 
                key={idx} 
                onClick={() => setSelectedItem(row)}
                className="bg-[#111827] border border-white/5 rounded-xl p-4 active:scale-[0.98] transition-transform shadow-lg relative overflow-hidden"
             >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  row.status === 'ZONA MERAH' ? 'bg-red-500' : 
                  row.status === 'ZONA KUNING' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}/>
                
                <div className="flex justify-between items-start mb-2 pl-2">
                   <div>
                      <h3 className="font-bold text-white text-base leading-none mb-1">{row.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                         <span className="flex items-center gap-1"><User size={10}/> {row.age}th</span>
                         <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                         <span className={row.pregnancyWeeks < 14 || row.pregnancyWeeks > 26 ? 'text-red-400 font-bold' : 'text-cyan-400'}>
                            Hamil {row.pregnancyWeeks} Mg
                         </span>
                      </div>
                   </div>
                   {renderBadge(row.status)}
                </div>

                <div className="flex justify-between items-end pl-2 mt-3 pt-3 border-t border-white/5">
                   <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-gray-600 font-bold uppercase">Lokasi Terpantau</span>
                      {row.lat ? (
                        <div className="flex items-center gap-1 text-xs text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 w-fit">
                           <MapPin size={10}/> {row.lat.toFixed(4)}, {row.lng?.toFixed(4)}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600 italic">No GPS Data</span>
                      )}
                   </div>
                   <span className="text-[10px] text-gray-600">
                      {new Date(row.timestamp).toLocaleDateString()}
                   </span>
                </div>
             </div>
           ))}
           {filteredData.length === 0 && (
             <div className="text-center text-gray-500 py-10 text-sm">Tidak ada data.</div>
           )}
        </div>

        {/* DESKTOP VIEW (TABLE) - HIDDEN ON MOBILE */}
        <div className="hidden md:block">
           <GlassCard noPadding>
              <table className="w-full text-left border-collapse">
                 <thead className="bg-white/5 text-gray-400 text-xs sticky top-0 backdrop-blur-md z-10">
                    <tr>
                       <th className="p-4 w-32">Lokasi (GPS)</th>
                       <th className="p-4">Nama Tamu</th>
                       <th className="p-4">Usia Hamil</th>
                       <th className="p-4">Status</th>
                       <th className="p-4">Tanggal</th>
                       <th className="p-4 text-center">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 text-sm">
                    {filteredData.map((row, idx) => (
                       <tr key={idx} className="hover:bg-white/5 transition-colors group">
                          <td className="p-4 text-xs font-mono text-gray-400">
                             {row.lat ? (
                                <div className="flex flex-col text-cyan-300">
                                   <span>{row.lat.toFixed(4)}</span>
                                   <span className="text-gray-500">{row.lng?.toFixed(4)}</span>
                                </div>
                             ) : '-'}
                          </td>
                          <td className="p-4 font-semibold text-white">
                             {row.name}
                             <div className="text-xs text-gray-500">{row.age} Tahun</div>
                          </td>
                          <td className="p-4 text-cyan-200">{row.pregnancyWeeks} Minggu</td>
                          <td className="p-4">{renderBadge(row.status)}</td>
                          <td className="p-4 text-gray-400 text-xs">{new Date(row.timestamp).toLocaleDateString()}</td>
                          <td className="p-4 text-center">
                             <button onClick={() => setSelectedItem(row)} className="p-2 rounded bg-white/5 hover:bg-cyan-500 hover:text-white transition">
                                <Eye size={16}/>
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </GlassCard>
        </div>
      </div>
    </div>
  );
};
