
import React, { useEffect, useState, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ScreeningInbox } from './pages/ScreeningInbox';
import { ContentManager } from './pages/ContentManager';
import { Login } from './pages/Login';
import { ScreeningForm } from './pages/ScreeningForm';
import { TrafficInfo } from './pages/TrafficInfo';
import { fetchData, getSystemStatus, toggleSystemStatus, logTraffic } from './services/api';
import { DashboardData } from './types';
import { TEMPLATE_DATA } from './data/templateData';
import { Menu, Lock } from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<DashboardData | null>(null);
  
  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Loading & Sync States
  const [isLoadingInitial, setIsLoadingInitial] = useState(true); 
  const [isSyncing, setIsSyncing] = useState(false); 
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // System Lock State
  const [isSystemActive, setIsSystemActive] = useState(true);
  
  // Guest Mode State
  const [isGuestMode, setIsGuestMode] = useState(false);
  
  const isFetchingRef = useRef(false);

  // --- 1. DETECT GUEST MODE ---
  useEffect(() => {
    const isGuest = new URLSearchParams(window.location.search).get('mode') === 'guest';
    setIsGuestMode(isGuest);

    // --- LOG TRAFFIC SAAT GUEST MODE DIBUKA ---
    if (isGuest) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => logTraffic(pos.coords.latitude, pos.coords.longitude),
          (err) => logTraffic() // Log tanpa koordinat jika ditolak
        );
      } else {
        logTraffic();
      }
    }
  }, []);

  // --- 2. NETWORK LISTENERS ---
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- 3. AUTH CHECK (ADMIN ONLY) ---
  useEffect(() => {
    const auth = localStorage.getItem('lovina_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('lovina_admin_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('lovina_admin_auth');
    setIsAuthenticated(false);
  };

  // --- 4. DATA FETCHING LOGIC ---
  const loadData = async (isBackground = false) => {
    if (isFetchingRef.current) return; 
    isFetchingRef.current = true;
    
    if (isBackground) setIsSyncing(true);
    else setIsLoadingInitial(true);
    
    try {
      // Cek status sistem dulu
      const status = await getSystemStatus();
      setIsSystemActive(status);

      if (isGuestMode) {
         // --- GUEST LOGIC ---
         if (status) {
           const result = await fetchData();
           if(result) setData(result);
         }
      } else {
         // --- ADMIN LOGIC ---
         const result = await fetchData();
         if (result) {
           setData(result);
           setFetchError(null);
           setLastSynced(new Date());
           setIsOnline(true); 
         }
      }
    } catch (e: any) {
      const msg = e.message || "Unknown error";
      if (msg.includes('Failed to fetch') || msg.includes('Network')) {
         setIsOnline(false); 
         setFetchError("Koneksi Server Terputus");
      } else {
         setFetchError(msg);
      }
    } finally {
      setIsLoadingInitial(false);
      setIsSyncing(false);
      isFetchingRef.current = false;
    }
  };

  // Toggle System Lock (Admin Only)
  const handleToggleSystem = async (newState: boolean) => {
    setIsSyncing(true);
    try {
      const success = await toggleSystemStatus(newState);
      setIsSystemActive(success);
    } catch (e) {
      alert("Gagal mengubah status sistem");
    } finally {
      setIsSyncing(false);
    }
  };

  // Load awal saat komponen mount atau mode berubah
  useEffect(() => {
    loadData(false);
  }, [isGuestMode]);

  // Background Sync untuk Admin
  useEffect(() => {
    if (!isAuthenticated || isGuestMode) return;
    const interval = setInterval(() => {
       if (activeTab !== 'cms' && navigator.onLine) loadData(true);
    }, 10000); 
    return () => clearInterval(interval);
  }, [isAuthenticated, activeTab, isGuestMode]);


  // --- VIEW: LOADING SCREEN ---
  if (isLoadingInitial && !data && !(!isSystemActive && isGuestMode)) {
     return (
       <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
         <div className="flex flex-col items-center gap-4 text-center p-6">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-white">{isGuestMode ? 'LovinaMom' : 'LovinaMom Admin'}</h2>
            <p className="text-cyan-400/70 text-sm animate-pulse">
               {isGuestMode ? 'Memuat Aplikasi...' : 'Menghubungkan ke sistem GIS Bali...'}
            </p>
         </div>
       </div>
     );
  }

  // --- VIEW: LOCKED SCREEN (GUEST) ---
  if (isGuestMode && !isSystemActive) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-red-950 via-gray-900 to-black flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center p-8 rounded-3xl bg-white/5 border border-red-500/20 backdrop-blur-xl shadow-2xl">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <Lock size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Pendaftaran Ditutup</h1>
          <p className="text-gray-400 mb-8">
            Mohon maaf, sistem screening saat ini sedang dinonaktifkan oleh administrator. Silakan hubungi petugas tour.
          </p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition text-sm font-bold text-white">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW: GUEST APP ---
  if (isGuestMode) {
     const questions = (data?.questions && data.questions.length > 0) 
        ? data.questions 
        : TEMPLATE_DATA.QUESTIONS;

     return <ScreeningForm questions={questions} />;
  }

  // --- VIEW: ADMIN AUTHENTICATION ---
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // --- VIEW: ADMIN DASHBOARD (MAIN) ---
  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-950 via-gray-900 to-slate-900 overflow-hidden text-white relative">
      
      {/* MOBILE HAMBURGER BUTTON */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-black/40 backdrop-blur border border-white/20 rounded-lg text-white shadow-lg active:scale-95 transition-all"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* SIDEBAR */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }} 
        onLogout={handleLogout} 
        isOnline={isOnline}
        isSyncing={isSyncing}
        fetchError={fetchError}
        lastSynced={lastSynced}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        systemStatus={isSystemActive}
        onToggleSystem={handleToggleSystem}
      />

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-[50] backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 h-full overflow-hidden relative flex flex-col pt-16 lg:pt-0">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex-1 overflow-auto relative z-10 p-1">
          {activeTab === 'dashboard' && data && <Dashboard data={data.screening} analyticsCount={data.analytics?.totalViews} />}
          {activeTab === 'screening' && data && <ScreeningInbox data={data.screening} />}
          {activeTab === 'traffic' && data && <TrafficInfo logs={data.traffic || []} />}
          {activeTab === 'cms' && data && (
            <ContentManager 
              questionsData={data.questions}
              refreshData={() => loadData(true)}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
