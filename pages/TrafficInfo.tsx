
import React, { useMemo } from 'react';
import { TrafficLog } from '../types';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { LatLngBoundsExpression } from 'leaflet';
import { GlassCard } from '../components/GlassCard';
import { Users, Globe, MapPinOff, Smartphone, Monitor, Clock, MapPin, AlertCircle } from 'lucide-react';

interface TrafficInfoProps {
  logs: TrafficLog[];
}

// KOORDINAT TENGAH BALI
const BALI_CENTER: [number, number] = [-8.409518, 115.188919];
const BALI_BOUNDS: LatLngBoundsExpression = [[-8.95, 114.3], [-7.90, 115.8]];

// Helper: Parse User Agent sederhana
const getDeviceIcon = (ua?: string) => {
  const s = (ua || '').toLowerCase();
  if (s.includes('mobile') || s.includes('android') || s.includes('iphone')) return <Smartphone size={14} className="text-cyan-400"/>;
  return <Monitor size={14} className="text-purple-400"/>;
};

const getDeviceName = (ua?: string) => {
  const s = (ua || '').toLowerCase();
  if (!s) return 'Unknown Device';
  if (s.includes('iphone')) return 'iPhone (iOS)';
  if (s.includes('android')) return 'Android Phone';
  if (s.includes('windows')) return 'Windows PC';
  if (s.includes('macintosh')) return 'MacBook / Mac';
  if (s.includes('linux')) return 'Linux System';
  return 'Web Browser';
};

export const TrafficInfo: React.FC<TrafficInfoProps> = ({ logs }) => {
  
  // 1. FILTER DATA VALID (Hanya yang punya Lat/Lng bukan 0 dan valid angka)
  const validLogs = useMemo(() => logs.filter(l => 
    l.lat !== 0 && l.lng !== 0 && !isNaN(l.lat) && !isNaN(l.lng)
  ), [logs]);
  
  // 2. HITUNG STATISTIK
  const totalHits = logs.length;
  const gpsDenied = logs.length - validLogs.length;

  // 3. LOGIKA CLUSTERING (Hanya untuk Valid Logs)
  const clusteredTraffic = useMemo(() => {
    const clusters: Record<string, { lat: number, lng: number, count: number, lastSeen: string }> = {};

    validLogs.forEach(log => {
      // Rounding 3 desimal untuk grouping area (~110m)
      const key = `${log.lat.toFixed(3)}_${log.lng.toFixed(3)}`;
      
      if (!clusters[key]) {
        clusters[key] = {
           lat: log.lat,
           lng: log.lng,
           count: 0,
           lastSeen: log.timestamp
        };
      }
      clusters[key].count += 1;
      // Update last seen to most recent
      if (new Date(log.timestamp) > new Date(clusters[key].lastSeen)) {
         clusters[key].lastSeen = log.timestamp;
      }
    });

    return Object.values(clusters);
  }, [validLogs]);

  // 4. SORT HISTORY (Terbaru paling atas)
  const historyLogs = useMemo(() => {
    return [...logs].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 100); // Ambil 100 terakhir
  }, [logs]);

  return (
    <div className="h-full flex flex-col p-4 md:p-6 space-y-6 animate-in fade-in zoom-in-95 duration-300 overflow-y-auto">
       
       <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
               <Globe className="text-cyan-400"/> Info Trafik Web Tamu
            </h1>
            <p className="text-gray-400 text-sm mt-1">Memantau sebaran lokasi dan riwayat akses pengguna.</p>
          </div>
          
          <div className="flex gap-3">
             <div className="bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-xl text-center">
                <div className="text-[10px] uppercase font-bold text-cyan-400">Total Hits</div>
                <div className="text-xl font-bold text-white">{totalHits}</div>
             </div>
             <div className="bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-xl text-center">
                <div className="text-[10px] uppercase font-bold text-purple-400">GPS Aktif</div>
                <div className="text-xl font-bold text-white">{validLogs.length}</div>
             </div>
             {gpsDenied > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-center">
                   <div className="text-[10px] uppercase font-bold text-red-400">GPS Mati</div>
                   <div className="text-xl font-bold text-white">{gpsDenied}</div>
                </div>
             )}
          </div>
       </div>

       {/* MAP VISUALIZATION */}
       <div className="h-[400px] shrink-0 bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
          <MapContainer 
              center={BALI_CENTER} 
              zoom={10} 
              minZoom={9}
              maxBounds={BALI_BOUNDS}
              maxBoundsViscosity={1.0}
              className="w-full h-full z-0"
            >
              <TileLayer 
                 attribution='&copy; OpenStreetMap' 
                 url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
              />
              
              {clusteredTraffic.map((spot, idx) => {
                 const size = Math.min(30, 5 + (spot.count * 2));
                 const opacity = Math.min(0.8, 0.3 + (spot.count * 0.1));
                 
                 return (
                    <CircleMarker 
                       key={idx}
                       center={[spot.lat, spot.lng]}
                       radius={size}
                       pathOptions={{ 
                          fillColor: '#06b6d4',
                          color: '#fff',
                          weight: 1,
                          fillOpacity: opacity 
                       }}
                    >
                       <Popup>
                          <div className="p-2 text-center">
                             <div className="text-lg font-bold text-cyan-600">{spot.count} User/Hits</div>
                             <div className="text-xs text-gray-500">di area radius ~100m ini</div>
                             <div className="text-[10px] text-gray-400 mt-2">
                                Terakhir akses: {new Date(spot.lastSeen).toLocaleTimeString()}
                             </div>
                          </div>
                       </Popup>
                    </CircleMarker>
                 )
              })}
          </MapContainer>
          
          <div className="absolute bottom-4 left-4 z-[500] flex flex-col gap-2">
             <div className="bg-black/70 backdrop-blur p-3 rounded-xl border border-white/10 max-w-xs">
                <div className="flex items-start gap-2">
                   <Users size={16} className="text-cyan-400 mt-0.5"/>
                   <div>
                      <div className="text-xs font-bold text-white">Peta Sebaran</div>
                      <p className="text-[10px] text-gray-400 leading-tight mt-1">
                         Lokasi real-time saat user membuka web tamu.
                      </p>
                   </div>
                </div>
             </div>
          </div>
          
          {totalHits === 0 && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] bg-black/80 p-6 rounded-2xl border border-white/20 text-center backdrop-blur-md">
                <AlertCircle size={32} className="mx-auto text-gray-500 mb-3"/>
                <p className="text-white font-bold mb-1">Belum Ada Data</p>
                <p className="text-xs text-gray-400">Pastikan API Google Sheet terhubung dan memiliki data trafik.</p>
             </div>
          )}
       </div>

       {/* HISTORY TABLE */}
       <div className="flex-1 min-h-[300px]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
             <Clock size={16} className="text-gray-400"/> Riwayat Pengunjung (100 Terakhir)
          </h3>
          <GlassCard noPadding className="overflow-hidden flex flex-col max-h-[500px]">
             <div className="overflow-y-auto">
                <table className="w-full text-left border-collapse">
                   <thead className="bg-white/5 text-gray-400 text-[10px] uppercase tracking-wider sticky top-0 backdrop-blur-md z-10">
                      <tr>
                         <th className="p-4 font-bold">Waktu Akses</th>
                         <th className="p-4 font-bold">Perangkat</th>
                         <th className="p-4 font-bold">Lokasi</th>
                         <th className="p-4 font-bold text-right">Koordinat</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5 text-xs">
                      {historyLogs.map((log, idx) => {
                         const hasGPS = log.lat !== 0 && log.lng !== 0 && !isNaN(log.lat) && !isNaN(log.lng);
                         return (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                               <td className="p-4 text-gray-300">
                                  <div className="font-bold text-white">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                  <div className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleDateString()}</div>
                               </td>
                               <td className="p-4">
                                  <div className="flex items-center gap-2 text-gray-300">
                                     {getDeviceIcon(log.userAgent)}
                                     <span>{getDeviceName(log.userAgent)}</span>
                                  </div>
                               </td>
                               <td className="p-4">
                                  {hasGPS ? (
                                     <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                                        <MapPin size={10}/> GPS AKTIF
                                     </span>
                                  ) : (
                                     <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-[10px]">
                                        <MapPinOff size={10}/> DITOLAK
                                     </span>
                                  )}
                               </td>
                               <td className="p-4 text-right font-mono text-gray-500">
                                  {hasGPS ? (
                                     <>
                                        <div>{log.lat.toFixed(5)}</div>
                                        <div>{log.lng.toFixed(5)}</div>
                                     </>
                                  ) : '-'}
                               </td>
                            </tr>
                         )
                      })}
                      {historyLogs.length === 0 && (
                         <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                               Belum ada data pengunjung hari ini.
                            </td>
                         </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </GlassCard>
       </div>

    </div>
  );
};
