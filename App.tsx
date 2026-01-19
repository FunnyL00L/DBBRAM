import React, { useEffect, useState, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { ScreeningInbox } from './pages/ScreeningInbox';
import { ContentManager } from './pages/ContentManager';
import { Login } from './pages/Login';
import { fetchData } from './services/api';
import { DashboardData } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<DashboardData | null>(null);
  
  // State Status
  const [isLoadingInitial, setIsLoadingInitial] = useState(true); 
  const [isSyncing, setIsSyncing] = useState(false); 
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const isFetchingRef = useRef(false);

  // Monitor Network Browser
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

  useEffect(() => {
    const auth = localStorage.getItem('lovina_admin_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    localStorage.setItem('lovina_admin_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('lovina_admin_auth');
    setIsAuthenticated(false);
  };

  // --- CORE DATA FETCHING ---
  const loadData = async (isBackground = false) => {
    if (!isAuthenticated) return;
    if (isFetchingRef.current) return; 

    isFetchingRef.current = true;
    
    if (isBackground) {
        setIsSyncing(true);
    } else {
        setIsLoadingInitial(true);
    }
    
    try {
      const result = await fetchData();
      if (result) {
        setData(result);
        setFetchError(null);
        setLastSynced(new Date());
        setIsOnline(true); 
      }
    } catch (e: any) {
      console.error("Sync Error:", e);
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
    if (isAuthenticated) {
        loadData(false);
    }
  }, [isAuthenticated]);

  // Auto Refresh Interval (1 Detik)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
       // Hanya refresh otomatis jika TIDAK sedang mengedit konten (CMS)
       if (activeTab !== 'cms' && navigator.onLine) {
          loadData(true);
       }
    }, 1000); // 1000ms = 1 Detik

    return () => clearInterval(interval);
  }, [isAuthenticated, activeTab]);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (isLoadingInitial && !data) {
     return (
       <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="text-cyan-400 font-bold animate-pulse">Menghubungkan ke Database...</p>
         </div>
       </div>
     );
  }

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-950 via-gray-900 to-slate-900 overflow-hidden text-white">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        isOnline={isOnline}
        isSyncing={isSyncing}
        fetchError={fetchError}
        lastSynced={lastSynced}
      />

      <main className="flex-1 h-full overflow-hidden relative flex flex-col">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex-1 overflow-auto relative z-10 p-1">
          {activeTab === 'dashboard' && data && <Dashboard data={data.screening} analyticsCount={data.analytics?.totalViews} />}
          {activeTab === 'screening' && data && <ScreeningInbox data={data.screening} />}
          {activeTab === 'cms' && data && (
            <ContentManager 
              sopData={data.sop} 
              medisData={data.medis} 
              tipsData={data.tips}
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