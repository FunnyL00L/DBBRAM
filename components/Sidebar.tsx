
import React from 'react';
import { LayoutDashboard, FileText, Database, LogOut, Wifi, WifiOff, AlertTriangle, CheckCircle2, X, ExternalLink, Lock, Unlock, Power } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOnline: boolean;
  isSyncing: boolean;
  fetchError: string | null;
  lastSynced: Date | null;
  isOpen?: boolean;
  onClose?: () => void;
  // System Lock Props
  systemStatus: boolean;
  onToggleSystem: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, setActiveTab, onLogout,
  isOnline, isSyncing, fetchError, isOpen = false, onClose,
  systemStatus, onToggleSystem
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'screening', label: 'Screening Inbox', icon: FileText },
    { id: 'cms', label: 'Content Manager', icon: Database },
  ];

  const openGuestMode = () => {
    const url = `${window.location.origin}?mode=guest`;
    window.open(url, '_blank');
  };

  return (
    <>
      <div className={`
        fixed inset-y-0 left-0 z-[70] w-64 bg-[#0b1426] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 shadow-2xl
        lg:static lg:translate-x-0 lg:shadow-none lg:bg-black/20 lg:backdrop-blur-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Section */}
        <div>
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 bg-white/5">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center font-bold text-blue-900 mr-3 shadow-[0_0_10px_rgba(34,211,238,0.5)]">L</div>
              <span className="font-bold text-xl text-white tracking-wider">LovinaMom</span>
            </div>
            <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white"><X size={24} /></button>
          </div>

          <nav className="mt-8 flex flex-col gap-2 px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center p-3 rounded-xl transition-all duration-200 group relative overflow-hidden text-left ${
                    isActive ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 rounded-r-full"></div>}
                  <Icon size={22} className={isActive ? 'text-cyan-300' : 'text-gray-400 group-hover:text-white'} />
                  <span className="ml-4 font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Status & Power Control */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex flex-col gap-4">
          
          {/* SYSTEM LOCK TOGGLE */}
          <div className="bg-black/40 rounded-xl p-3 border border-white/5">
             <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Status Web Tamu</span>
                {systemStatus ? 
                   <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1"><Unlock size={10}/> DIBUKA</span> : 
                   <span className="text-[10px] font-bold text-red-400 flex items-center gap-1"><Lock size={10}/> DITUTUP</span>
                }
             </div>
             <button
                onClick={() => onToggleSystem(!systemStatus)}
                className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-lg ${
                   systemStatus 
                   ? 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500 hover:text-white' 
                   : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white'
                }`}
             >
                <Power size={14} />
                {systemStatus ? 'Kunci Sistem' : 'Buka Sistem'}
             </button>
          </div>

          <button 
              onClick={openGuestMode}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition group"
          >
              <span className="text-xs font-bold">Buka Web Tamu</span>
              <ExternalLink size={14} className="group-hover:scale-110 transition"/>
          </button>

          {/* Status Indicator Card */}
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-black/20 border border-white/5 shadow-inner">
              <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-500">Network</span>
                  {isOnline ? (
                      <div className="flex items-center gap-1.5 text-emerald-400">
                          <Wifi size={12} />
                          <span className="text-[10px] font-bold">ONLINE</span>
                      </div>
                  ) : (
                      <div className="flex items-center gap-1.5 text-red-400 animate-pulse">
                          <WifiOff size={12} />
                          <span className="text-[10px] font-bold">OFFLINE</span>
                      </div>
                  )}
              </div>
              <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-500">Sync</span>
                  <div className="flex items-center gap-1.5">
                     {fetchError ? <AlertTriangle size={12} className="text-amber-500" /> : <CheckCircle2 size={12} className="text-emerald-500" />}
                     <span className={`text-[10px] font-bold ${fetchError ? 'text-amber-500' : 'text-gray-300'}`}>
                        {fetchError ? 'ERROR' : (isSyncing ? 'SYNCING' : 'READY')}
                     </span>
                  </div>
              </div>
          </div>

          <button onClick={onLogout} className="w-full flex items-center justify-start p-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/20">
            <LogOut size={20} />
            <span className="ml-4 font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};
