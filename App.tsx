
import React, { useEffect, useState, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ScreeningInbox } from './pages/ScreeningInbox';
import { ContentManager } from './pages/ContentManager';
import { Login } from './pages/Login';
import { fetchData } from './services/api';
import { DashboardData } from './types';
import { Menu } from 'lucide-react'; // Icon Hamburger

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
  
  const isFetchingRef = useRef(false);

  // --- 1. HANDLE GUEST REDIRECT ---
  useEffect(() => {
    const isGuestMode = new URLSearchParams(window.location.search).get('mode') === 'guest';
    if (isGuestMode) {
      window.location.href = 'https://e-lovinamomtour.vercel.app/';
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

  // --- 4. DATA FETCHING ---
  const loadData = async (isBackground = false) => {
    if (isFetchingRef.current) return; 
    isFetchingRef.current = true;
    
    if (isBackground) setIsSyncing(true);
    else setIsLoadingInitial(true);
    
    try {
      const result = await fetchData();
      if (result) {
        setData(result);
        setFetchError(null);
        setLastSynced(new Date());
        setIsOnline(true); 
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

  // Initial Load
  useEffect(() => {
    loadData(false);
  }, []);

  // Background Sync (Admin Only)
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
       if (activeTab !== 'cms' && navigator.onLine) loadData(true);
    }, 10000); // Sync every 10s
    return () => clearInterval(interval);
  }, [isAuthenticated, activeTab]);


  // --- VIEW: ADMIN AUTHENTICATION ---
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // --- VIEW: LOADING STATE (ADMIN) ---
  if (isLoadingInitial && !data) {
     return (
       <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
         <div className="flex flex-col items-center gap-4 text-center p-6">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-white">LovinaMom Admin</h2>
            <p className="text-cyan-400/70 text-sm animate-pulse">Menghubungkan ke sistem GIS Bali...</p>
         </div>
       </div>
     );
  }

  // --- VIEW: ADMIN DASHBOARD (MAIN) ---
  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-950 via-gray-900 to-slate-900 overflow-hidden text-white relative">
      
      {/* MOBILE HAMBURGER BUTTON (Floating) */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 bg-black/40 backdrop-blur border border-white/20 rounded-lg text-white shadow-lg active:scale-95 transition-all"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* SIDEBAR (Responsive) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false); // Close sidebar on mobile after selection
        }} 
        onLogout={handleLogout} 
        isOnline={isOnline}
        isSyncing={isSyncing}
        fetchError={fetchError}
        lastSynced={lastSynced}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
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
