
import React, { useState, useMemo } from 'react';
import { GlassCard } from '../components/GlassCard';
import { ScreeningResult } from '../types';
import { Search, Download, Filter, AlertCircle, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

interface ScreeningInboxProps {
  data: ScreeningResult[];
}

export const ScreeningInbox: React.FC<ScreeningInboxProps> = ({ data }) => {
  const [filter, setFilter] = useState<'ALL' | 'HIJAU' | 'KUNING' | 'MERAH'>('ALL');
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    // First sort by timestamp descending (newest first)
    const sorted = [...data].sort((a, b) => {
      const dateA = new Date(a.timestamp || 0).getTime();
      const dateB = new Date(b.timestamp || 0).getTime();
      return dateB - dateA;
    });

    return sorted.filter(item => {
      const status = String(item.status || '').toUpperCase();
      let matchesFilter = false;
      
      if (filter === 'ALL') matchesFilter = true;
      else if (filter === 'HIJAU') matchesFilter = status === 'ZONA HIJAU' || status === 'AMAN' || status.includes('HIJAU');
      else if (filter === 'KUNING') matchesFilter = status === 'ZONA KUNING' || status.includes('KUNING');
      else if (filter === 'MERAH') matchesFilter = status === 'ZONA MERAH' || status === 'BAHAYA' || status.includes('MERAH');

      const itemName = String(item.name || '');
      const matchesSearch = itemName.toLowerCase().includes(search.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [data, filter, search]);

  const handleExport = () => {
    const headers = ['Timestamp', 'Name', 'Age', 'Weeks', 'Status', 'Risk Factors/Criteria', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        new Date(row.timestamp).toLocaleString(),
        `"${row.name || ''}"`,
        row.age,
        row.pregnancyWeeks,
        row.status,
        `"${row.riskFactors || ''}"`,
        `"${row.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `screening_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const renderStatusBadge = (status: string) => {
    const s = String(status || '').toUpperCase();
    if (s.includes('HIJAU') || s === 'AMAN') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <CheckCircle size={12} /> {status}
        </span>
      );
    } else if (s.includes('KUNING')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <AlertTriangle size={12} /> {status}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
          <AlertOctagon size={12} /> {status}
        </span>
      );
    }
  };

  return (
    <div className="p-6 h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Screening Inbox</h1>
          <p className="text-gray-400 text-sm">Total: {filteredData.length} records found</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleExport}
            disabled={filteredData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-emerald-500/30"
          >
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <GlassCard className="flex-1 flex flex-col min-h-0" noPadding>
        {/* Toolbar */}
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search guest name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
          <div className="flex gap-2">
            {(['ALL', 'HIJAU', 'KUNING', 'MERAH'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                  filter === f 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-gray-400 text-sm sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Guest Name</th>
                <th className="p-4 font-medium">Weeks</th>
                <th className="p-4 font-medium">Status (Zona)</th>
                <th className="p-4 font-medium">Criteria / Risk Factors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredData.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-gray-300 whitespace-nowrap">
                    {row.timestamp ? new Date(row.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                  </td>
                  <td className="p-4 font-semibold text-white">
                    {row.name || 'Unknown'}
                    <div className="text-xs text-gray-500 mt-1">{row.age || 0} years old</div>
                  </td>
                  <td className="p-4 text-cyan-200">{row.pregnancyWeeks || 0} wks</td>
                  <td className="p-4">
                    {renderStatusBadge(row.status)}
                  </td>
                  <td className="p-4 text-gray-400 max-w-xs truncate" title={row.riskFactors}>{row.riskFactors || '-'}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                    No records to display. Make sure the database is connected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};
