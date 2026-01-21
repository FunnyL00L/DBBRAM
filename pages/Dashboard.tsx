
import React, { useMemo, useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { ScreeningResult } from '../types';
import { 
  AlertTriangle, ShieldCheck, AlertOctagon, Baby, 
  CalendarClock, MapPin, Maximize2, Minimize2, RotateCw
} from 'lucide-react';
import { ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, useMap } from 'react-leaflet';
import { LatLngBoundsExpression } from 'leaflet';

interface DashboardProps {
  data: ScreeningResult[];
  analyticsCount?: number;
}

// KOORDINAT TENGAH BALI
const BALI_CENTER: [number, number] = [-8.409518, 115.188919];

// BATAS WILAYAH MAP
const BALI_BOUNDS: LatLngBoundsExpression = [
  [-8.95, 114.3], 
  [-7.90, 115.8]  
];

// Component: Marker Lokasi Admin
const MyLocationMarker = () => {
  const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on("locationfound", function (e) {
      if (e.latlng.lat > -8.95 && e.latlng.lat < -7.90 && e.latlng.lng > 114.3 && e.latlng.lng < 115.8) {
        setPosition(e.latlng);
      }
    });
  }, [map]);

  if (!position) return null;

  return (
    <CircleMarker 
      center={position} 
      radius={8} 
      pathOptions={{ color: 'white', fillColor: '#3b82f6', fillOpacity: 1, weight: 3 }}
    >
      <Popup>Lokasi Anda</Popup>
    </CircleMarker>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ data, analyticsCount = 0 }) => {
  const [liveCount, setLiveCount] = useState(analyticsCount);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [activeStatIndex, setActiveStatIndex] = useState<number | null>(null);

  useEffect(() => {
    setLiveCount(analyticsCount);
  }, [analyticsCount]);

  // Statistik Utama
  const stats = useMemo(() => {
    const total = data.length;
    const red = data.filter(r => r.status === 'ZONA MERAH' || r.status === 'BAHAYA').length;
    const yellow = data.filter(r => r.status === 'ZONA KUNING').length;
    const green = data.filter(r => r.status === 'ZONA HIJAU' || r.status === 'AMAN').length;
    
    const t1 = data.filter(r => r.pregnancyWeeks <= 13).length;
    const t2 = data.filter(r => r.pregnancyWeeks > 13 && r.pregnancyWeeks <= 26).length;
    const t3 = data.filter(r => r.pregnancyWeeks > 26).length;
    
    const totalWeeks = data.reduce((acc, curr) => acc + (curr.pregnancyWeeks || 0), 0);
    const avgWeeks = total > 0 ? Math.round(totalWeeks / total) : 0;

    return { total, red, yellow, green, t1, t2, t3, avgWeeks };
  }, [data]);

  // Logika Clustering Hotspot Map
  const hotspots = useMemo(() => {
    const clusters: Record<string, { lat: number, lng: number, name: string, count: number, riskScore: number, items: ScreeningResult[] }> = {};

    data.forEach(item => {
      if (!item.lat || !item.lng) return;
      
      const key = item.locationName && item.locationName !== 'Lokasi Terdeteksi' 
        ? item.locationName 
        : `${item.lat.toFixed(3)}_${item.lng.toFixed(3)}`;
      
      if (!clusters[key]) {
        clusters[key] = { 
          lat: item.lat, 
          lng: item.lng, 
          name: item.locationName || 'Unknown Location', 
          count: 0, 
          riskScore: 0, 
          items: [] 
        };
      }
      
      clusters[key].count += 1;
      clusters[key].items.push(item);

      if (item.status === 'ZONA MERAH' || item.status === 'BAHAYA') clusters[key].riskScore += 5;
      else if (item.status === 'ZONA KUNING') clusters[key].riskScore += 2;
      else clusters[key].riskScore += 1;
    });

    return Object.values(clusters).sort((a,b) => b.riskScore - a.riskScore); 
  }, [data]);

  const trimesterData = [
    { name: 'T1 (0-13)', value: stats.t1, color: '#818cf8' },
    { name: 'T2 (14-26)', value: stats.t2, color: '#c084fc' },
    { name: 'T3 (27+)', value: stats.t3, color: '#f472b6' },
  ];

  const safetyRate = stats.total > 0 ? Math.round((stats.green / stats.total) * 100) : 0;

  const statCards = [
    { 
      label: 'Total Ibu', value: stats.total, unit: 'Orang',
      icon: Baby, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30'
    },
    { 
      label: 'Rata-rata', value: stats.avgWeeks, unit: 'Minggu',
      icon: CalendarClock, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30'
    },
    { 
      label: 'Zona Kuning', value: stats.yellow, unit: 'Kasus',
      icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30'
    },
    { 
      label: 'Zona Merah', value: stats.red, unit: 'Bahaya',
      icon: AlertOctagon, color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500/30'
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      
      {/* HEADER & CONTROL PANEL */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-xs md:text-sm">Real-time Data dari Google Sheets</p>
        </div>
      </div>

      {/* --- STATS SECTION --- */}
      <div className="flex gap-3 h-20 md:grid md:grid-cols-4 md:h-auto md:gap-4 overflow-hidden">
        {statCards.map((stat, idx) => {
          const isActive = activeStatIndex === idx;
          return (
            <div 
              key={idx}
              onClick={() => setActiveStatIndex(isActive ? null : idx)}
              className={`
                relative rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer overflow-hidden flex items-center
                md:w-auto md:p-5 md:justify-between md:items-center md:cursor-default md:bg-white/5 md:border-white/10 md:hover:bg-white/10
                ${isActive 
                  ? `flex-[4] bg-[#1e293b] ${stat.border} shadow-lg px-4 justify-between` 
                  : `flex-[1] bg-white/5 border-white/10 justify-center` 
                }
              `}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${stat.bg} md:order-2`}>
                <stat.icon className={`${stat.color}`} size={20} />
              </div>

              <div className={`flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300 pl-3 md:pl-0 ${isActive ? 'opacity-100 w-auto' : 'opacity-0 w-0 md:opacity-100 md:w-auto'} md:order-1`}>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold text-white`}>{stat.value}</span>
                  <span className="text-[10px] text-gray-500 font-medium inline-block">{stat.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MAP SECTION --- */}
      <div className={`transition-all duration-500 ease-in-out flex flex-col ${isMapExpanded ? 'fixed inset-0 z-[100] bg-slate-900' : 'h-[400px] md:h-[500px] relative'}`}>
        <div className={`relative w-full h-full overflow-hidden ${!isMapExpanded && 'rounded-2xl border border-white/20 shadow-2xl'}`}>
          <div className="absolute top-4 left-4 z-[500] flex items-start gap-2 max-w-[70%]">
            <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <div>
                <span className="text-[10px] font-bold text-white block leading-tight">Live Tracking</span>
                <span className="text-[8px] text-gray-400 block leading-tight">Bali Region</span>
              </div>
            </div>
          </div>

          <button onClick={() => setIsMapExpanded(!isMapExpanded)} className="absolute top-4 right-4 z-[500] p-2.5 bg-black/60 backdrop-blur hover:bg-black/80 text-white rounded-lg border border-white/20 shadow-lg transition-all active:scale-95">
            {isMapExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>

          {isMapExpanded && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[500] pointer-events-none opacity-50 flex flex-col items-center animate-pulse">
              <RotateCw size={32} className="text-white mb-2" />
              <span className="text-[10px] text-white bg-black/50 px-2 py-1 rounded">Putar HP untuk layar penuh</span>
            </div>
          )}

          <div className="w-full h-full bg-slate-900">
            <MapContainer 
              center={BALI_CENTER} 
              zoom={isMapExpanded ? 10 : 9} 
              minZoom={9}
              maxBounds={BALI_BOUNDS}
              maxBoundsViscosity={1.0}
              scrollWheelZoom={true} 
              className="w-full h-full z-0"
            >
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <MyLocationMarker />
              
              {hotspots.map((spot, idx) => {
                let color = '#10b981'; 
                if (spot.riskScore > spot.count * 1.5) color = '#f59e0b'; 
                if (spot.riskScore > spot.count * 3) color = '#ef4444'; 
                const baseRadius = 5 + (spot.riskScore * 1.5); 
                const isHighDanger = spot.riskScore > 10;
                const geographicRadius = isHighDanger ? Math.min(1500, spot.riskScore * 100) : 0;

                return (
                  <React.Fragment key={idx}>
                    {isHighDanger && (
                      <Circle center={[spot.lat, spot.lng]} radius={geographicRadius || 1000} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.15, weight: 1, dashArray: '5, 5' }} />
                    )}
                    <CircleMarker center={[spot.lat, spot.lng]} radius={baseRadius} pathOptions={{ fillColor: color, fillOpacity: 0.7, weight: 1, color: '#fff' }}>
                      <Popup>
                        <div className="p-1 min-w-[150px]">
                          <h3 className="font-bold text-gray-900 border-b pb-1 mb-1">{spot.name}</h3>
                          <div className="text-xs text-gray-700 space-y-1">
                            <div className="flex justify-between"><span>Risk Score:</span> <b className="text-red-600">{spot.riskScore}</b></div>
                            <div className="text-[10px] text-gray-500 mt-1">{spot.items.length} Data Sheets</div>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* LOWER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RISK ANALYSIS */}
        <GlassCard className="flex flex-col h-[300px] lg:h-auto lg:col-span-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
            <MapPin className="text-red-400" size={16} />
            Analisis Zona Bahaya
          </h3>
          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {hotspots.filter(h => h.riskScore >= 1).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center p-4">
                <ShieldCheck size={32} className="mb-2 text-emerald-500/30"/>
                <p className="text-xs">Tidak ada data risiko tinggi.</p>
              </div>
            ) : (
              hotspots.map((spot, idx) => (
                <div key={idx} className={`bg-white/5 p-3 rounded-lg border-l-2 flex justify-between items-center ${spot.riskScore >= 5 ? 'border-red-500 bg-red-500/5' : 'border-amber-500 bg-amber-500/5'}`}>
                  <div>
                    <div className="font-bold text-xs text-white mb-0.5">{spot.name}</div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <span>Score: {spot.riskScore}</span>
                      <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                      <span>{spot.count} Orang</span>
                    </div>
                  </div>
                  {spot.riskScore >= 5 ? <AlertOctagon size={16} className="text-red-500"/> : <AlertTriangle size={16} className="text-amber-500"/>}
                </div>
              ))
            )}
          </div>
        </GlassCard>

        {/* DEMOGRAFI & SAFETY */}
        <GlassCard className="lg:col-span-2 flex flex-col md:flex-row gap-4 p-4 h-auto md:h-[200px]">
          <div className="flex-1 min-h-[150px] relative">
            <h4 className="absolute top-0 left-0 text-[10px] font-bold text-gray-400 uppercase">Demografi Trimester</h4>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={trimesterData} cx="50%" cy="55%" innerRadius={40} outerRadius={55} paddingAngle={5} dataKey="value">
                  {trimesterData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} wrapperStyle={{ fontSize: '10px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-4 flex flex-col items-center justify-center">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" r="36" fill="transparent" stroke="#1f2937" strokeWidth="6" />
                <circle cx="50%" cy="50%" r="36" fill="transparent" stroke={safetyRate > 80 ? "#10b981" : safetyRate > 50 ? "#f59e0b" : "#ef4444"} strokeWidth="6" strokeDasharray={226} strokeDashoffset={226 - (226 * (safetyRate / 100))} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                {safetyRate}%
              </div>
            </div>
            <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Safety Score</span>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};
