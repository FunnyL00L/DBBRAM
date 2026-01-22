
import React, { useState, useEffect, useMemo } from 'react';
import { GlassCard } from '../components/GlassCard';
import { ScreeningResult } from '../types';
import { Search, CheckCircle, AlertTriangle, AlertOctagon, Eye, X, Activity, MapPin, User, Globe, ChevronLeft, ChevronRight, Download, Info } from 'lucide-react';

interface ScreeningInboxProps {
  data: ScreeningResult[];
}

// --- DETAIL MODAL COMPONENT ---
const ScreeningDetailModal = ({ data, onClose }: { data: ScreeningResult, onClose: () => void }) => {
  if (!data) return null;

  const reasons: string[] = [];
  
  // Ambil data faktor risiko dari DB
  if (data.riskFactors && data.riskFactors.trim() !== '' && data.riskFactors.toLowerCase() !== 'none') {
    // Split berdasarkan koma atau titik koma
    const rawFactors = data.riskFactors.split(/[,;]/);
    rawFactors.forEach(r => {
      if (r.trim()) reasons.push(r.trim());
    });
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
               {data.locationName || data.name}
            </h2>
            <div className="text-xs text-white/70 mt-1">{data.name} ({data.age} Th)</div>
            <div className="flex flex-wrap gap-2 mt-3">
               {isDanger && <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">TIDAK REKOMENDASI</span>}
               {isWarning && <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-bold rounded">PENGAWASAN</span>}
               {isSafe && <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded">AMAN</span>}
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

           {/* Risk List (Data dari DB) */}
           <div className="space-y-2">
              <h3 className="text-white text-sm font-bold flex items-center gap-2">
                 <Activity size={16} className="text-cyan-400"/> Faktor Risiko (Database):
              </h3>
              {reasons.length > 0 ? (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                   <ul className="space-y-2">
                      {reasons.map((r, i) => (
                        <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                           <span className="mt-1 w-1 h-1 bg-red-400 rounded-full flex-shrink-0"></span>
                           <span>{r}</span>
                        </li>
                      ))}
                   </ul>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3">
                   <CheckCircle size={20} className="text-emerald-400" />
                   <span className="text-sm text-emerald-200">Tidak ada faktor risiko spesifik yang tercatat.</span>
                </div>
              )}
           </div>

           {/* Notes */}
           {data.notes && (
             <div className="pt-2">
                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Catatan Tambahan</div>
                <div className="bg-black/30 p-3 rounded-xl text-xs text-gray-400 border border-white/5 italic">
                   "{data.notes}"
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
  
  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemsPerPage = isMobile ? 5 : 10;

  const filteredData = useMemo(() => {
    return data.filter(item => {
        const status = item.status;
        let matchesFilter = true;
        if (filter === 'HIJAU') matchesFilter = status === 'ZONA HIJAU' || status === 'AMAN';
        if (filter === 'KUNING') matchesFilter = status === 'ZONA KUNING';
        if (filter === 'MERAH') matchesFilter = status === 'ZONA MERAH' || status === 'BAHAYA';

        const searchTerm = search.toLowerCase();
        const itemName = (item.name || '').toLowerCase();
        const itemLoc = (item.locationName || '').toLowerCase();
        const itemRisk = (item.riskFactors || '').toLowerCase();
        return matchesFilter && (itemName.includes(searchTerm) || itemLoc.includes(searchTerm) || itemRisk.includes(searchTerm));
    });
  }, [data, filter, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExport = () => {
    const headers = ['Timestamp', 'Nama', 'Usia', 'Minggu Hamil', 'Lokasi', 'Status', 'Faktor Risiko', 'Catatan'];
    const csvContent = [
        headers.join(','),
        ...filteredData.map(r => [
            `"${r.timestamp}"`,
            `"${r.name}"`,
            r.age,
            r.pregnancyWeeks,
            `"${r.locationName}"`,
            r.status,
            `"${r.riskFactors?.replace(/"/g, '""') || ''}"`,
            `"${r.notes?.replace(/"/g, '""') || ''}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `LovinaMom_Data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <div>
              <h1 className="text-xl md:text-3xl font-bold text-white">Inbox Data</h1>
              <div className="text-xs text-gray-500 mt-1">Total: {filteredData.length} Tamu Terdaftar</div>
          </div>
          <button 
             onClick={handleExport}
             className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-2 text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition"
          >
             <Download size={16}/> <span className="hidden md:inline">Export Excel</span>
          </button>
        </div>
        
        <GlassCard noPadding className="flex flex-col md:flex-row gap-2 p-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Cari lokasi, nama, atau risiko..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {(['ALL', 'HIJAU', 'KUNING', 'MERAH'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setCurrentPage(1); }}
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
        
        {/* MOBILE VIEW (CARDS) */}
        <div className="md:hidden space-y-3 pb-4">
           {currentData.map((row, idx) => (
             <div 
                key={idx} 
                onClick={() => setSelectedItem(row)}
                className="bg-[#111827] border border-white/5 rounded-xl p-4 active:scale-[0.98] transition-transform shadow-lg relative overflow-hidden"
             >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  (row.status === 'ZONA MERAH' || row.status === 'BAHAYA') ? 'bg-red-500' : 
                  row.status === 'ZONA KUNING' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}/>
                
                <div className="flex justify-between items-start mb-2 pl-2">
                   <div className="flex-1 mr-2">
                      <h3 className="font-bold text-white text-base leading-snug mb-1">
                         {row.locationName || 'Lokasi Terdeteksi'}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                         <span className="text-cyan-200 font-medium">{row.name}</span>
                         <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                         <span className="flex items-center gap-1"><User size={10}/> {row.age}th</span>
                      </div>
                      {row.riskFactors && row.riskFactors.toLowerCase() !== 'none' && (
                        <div className="text-[9px] mt-2 flex items-center gap-1 text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-full w-fit">
                           <Activity size={10}/> Risiko Terdeteksi
                        </div>
                      )}
                   </div>
                   {renderBadge(row.status)}
                </div>

                <div className="flex justify-between items-end pl-2 mt-3 pt-3 border-t border-white/5">
                   <div className="flex items-center gap-1 text-[10px] text-blue-300/70 font-mono">
                      <Globe size={10} />
                      {row.lat ? `${row.lat.toFixed(4)}, ${row.lng?.toFixed(4)}` : 'No GPS'}
                   </div>
                   <span className="text-[10px] text-gray-600">
                      {new Date(row.timestamp).toLocaleDateString()}
                   </span>
                </div>
             </div>
           ))}
           {currentData.length === 0 && (
             <div className="text-center text-gray-500 py-10 text-sm">Tidak ada data ditemukan.</div>
           )}
        </div>

        {/* DESKTOP VIEW (TABLE) */}
        <div className="hidden md:block">
           <GlassCard noPadding>
              <table className="w-full text-left border-collapse">
                 <thead className="bg-white/5 text-gray-400 text-xs sticky top-0 backdrop-blur-md z-10">
                    <tr>
                       <th className="p-4">Lokasi & Tamu</th>
                       <th className="p-4">Usia Hamil</th>
                       <th className="p-4">Faktor Risiko</th>
                       <th className="p-4">Status</th>
                       <th className="p-4">Tanggal</th>
                       <th className="p-4 text-center">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 text-sm">
                    {currentData.map((row, idx) => (
                       <tr key={idx} className="hover:bg-white/5 transition-colors group">
                          <td className="p-4">
                             <div className="font-bold text-white text-base mb-0.5">
                                {row.locationName || 'Lokasi Terdeteksi'}
                             </div>
                             <div className="text-xs text-gray-400 flex items-center gap-2">
                                <User size={12}/> {row.name} ({row.age} Th)
                             </div>
                          </td>
                          <td className="p-4 text-cyan-200 font-bold">{row.pregnancyWeeks} Minggu</td>
                          <td className="p-4">
                             <div className="max-w-[200px] truncate text-xs text-gray-400 italic">
                                {row.riskFactors || 'Tidak Ada'}
                             </div>
                          </td>
                          <td className="p-4">{renderBadge(row.status)}</td>
                          <td className="p-4 text-gray-400 text-xs">{new Date(row.timestamp).toLocaleDateString()}</td>
                          <td className="p-4 text-center">
                             <button onClick={() => setSelectedItem(row)} className="p-2 rounded bg-white/5 hover:bg-cyan-500 hover:text-white transition shadow-sm">
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

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
         <div className="flex justify-center items-center gap-4 mt-4 py-2">
            <button 
               onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
               disabled={currentPage === 1}
               className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white transition"
            >
               <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
               {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                     key={i}
                     onClick={() => setCurrentPage(i + 1)}
                     className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                        currentPage === i + 1 
                        ? 'bg-cyan-600 text-white' 
                        : 'bg-white/5 text-gray-500 hover:bg-white/10'
                     }`}
                  >
                     {i + 1}
                  </button>
               ))}
            </div>
            <button 
               onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
               disabled={currentPage === totalPages}
               className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-white transition"
            >
               <ChevronRight size={20} />
            </button>
         </div>
      )}

    </div>
  );
};
