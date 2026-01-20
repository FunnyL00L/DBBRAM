import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { ScreeningQuestion } from '../types';
import { MapPin, Baby, ChevronRight, CheckCircle, AlertCircle, Loader2, Navigation } from 'lucide-react';
import { API_URL } from '../constants';

interface ScreeningFormProps {
  questions: ScreeningQuestion[];
}

export const ScreeningForm: React.FC<ScreeningFormProps> = ({ questions }) => {
  const [step, setStep] = useState<'LOCATING' | 'IDENTITY' | 'QUIZ' | 'RESULT'>('LOCATING');
  const [location, setLocation] = useState<{ lat: number, lng: number, name: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    pregnancyWeeks: '',
    answers: {} as Record<string, string>,
    notes: ''
  });
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ status: string, message: string } | null>(null);

  // 1. GPS AUTO-TRACKING
  useEffect(() => {
    if (step === 'LOCATING') {
      if (!navigator.geolocation) {
        setLocation({ lat: -8.409, lng: 115.188, name: 'Bali (GPS Not Supported)' });
        setStep('IDENTITY');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            name: 'Lokasi Akurat (GPS)'
          });
          setStep('IDENTITY');
        },
        (err) => {
          console.warn("GPS Denied", err);
          setLocation({ lat: -8.409, lng: 115.188, name: 'Bali (Manual/Estimated)' });
          setStep('IDENTITY');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [step]);

  const sortedQuestions = [...questions].sort((a, b) => a.index - b.index);

  const handleAnswer = (answer: 'YES' | 'NO') => {
    const q = sortedQuestions[currentQuizIdx];
    setFormData(prev => ({
      ...prev,
      answers: { ...prev.answers, [q.id]: answer }
    }));

    if (currentQuizIdx < sortedQuestions.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
    } else {
      processAndSubmit();
    }
  };

  const processAndSubmit = async () => {
    setIsSubmitting(true);
    
    // LOGIKA PENENTUAN STATUS
    let status: 'ZONA HIJAU' | 'ZONA KUNING' | 'ZONA MERAH' = 'ZONA HIJAU';
    const issues: string[] = [];

    // Cek Minggu
    const weeks = parseInt(formData.pregnancyWeeks);
    if (weeks < 14 || weeks > 26) {
      status = 'ZONA MERAH';
      issues.push(weeks < 14 ? "Usia kehamilan < 14 minggu" : "Usia kehamilan > 26 minggu");
    }

    // Cek Jawaban Quiz
    for (const q of sortedQuestions) {
      const userAns = formData.answers[q.id];
      if (userAns !== q.safe_answer) {
        // Fix: Ensure we don't downgrade from RED to YELLOW
        if (q.type === 'RISK') {
          status = 'ZONA MERAH';
        } else if (status !== 'ZONA MERAH') {
          status = 'ZONA KUNING';
        }
        issues.push(`Gagal pada: ${q.text_id}`);
      }
    }

    const finalData = {
      name: formData.name,
      age: parseInt(formData.age),
      pregnancyWeeks: weeks,
      status: status,
      riskFactors: issues.join(', '),
      notes: `Lat: ${location?.lat}, Lng: ${location?.lng}`,
      lat: location?.lat,
      lng: location?.lng,
      locationName: location?.name
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: 'submit_screening', data: finalData })
      });
      const res = await response.json();
      
      if (res.status === 'success') {
        setResult({
          status: status,
          message: status === 'ZONA HIJAU' ? 'Selamat! Anda aman untuk berwisata.' : 
                   status === 'ZONA KUNING' ? 'Perhatian! Dibutuhkan pengawasan khusus.' : 
                   'Maaf, demi keselamatan, Anda tidak diizinkan ikut.'
        });
        setStep('RESULT');
      }
    } catch (e) {
      alert("Koneksi gagal, silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1120] text-white flex flex-col items-center p-4 font-sans overflow-x-hidden">
      
      {/* Header Mobile */}
      <div className="w-full max-w-md flex justify-between items-center py-6">
         <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
               <Baby className="text-white" size={20} />
            </div>
            <div>
               <h1 className="text-lg font-bold leading-none">LovinaMom</h1>
               <p className="text-[10px] text-cyan-400/70 font-bold uppercase tracking-widest">Safety Screening</p>
            </div>
         </div>
         {location && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400">
               <MapPin size={12} className="text-red-500" />
               Bali, ID
            </div>
         )}
      </div>

      <div className="w-full max-w-md flex-1 flex flex-col">
        
        {/* STEP: LOCATING */}
        {step === 'LOCATING' && (
           <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                 <div className="w-24 h-24 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin"></div>
                 <Navigation size={32} className="absolute inset-0 m-auto text-cyan-400 animate-pulse" />
              </div>
              <div>
                 <h2 className="text-xl font-bold mb-2">Mengunci Koordinat...</h2>
                 <p className="text-sm text-gray-400">Mohon izinkan GPS untuk keamanan maksimal saat tour.</p>
              </div>
           </div>
        )}

        {/* STEP: IDENTITY */}
        {step === 'IDENTITY' && (
           <div className="animate-in slide-in-from-right duration-500 flex-1 flex flex-col">
              <div className="mb-8">
                 <h2 className="text-2xl font-bold mb-2">Data Kehamilan</h2>
                 <p className="text-sm text-gray-400">Silakan lengkapi data dasar Anda di bawah ini.</p>
              </div>

              <div className="space-y-4">
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nama Lengkap</label>
                    <input 
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500 transition-all"
                       placeholder="Contoh: Siti Aminah"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 uppercase ml-1">Usia (Tahun)</label>
                       <input 
                          type="number"
                          value={formData.age}
                          onChange={e => setFormData({...formData, age: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500 transition-all"
                          placeholder="28"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 uppercase ml-1">Minggu Hamil</label>
                       <input 
                          type="number"
                          value={formData.pregnancyWeeks}
                          onChange={e => setFormData({...formData, pregnancyWeeks: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-cyan-500 transition-all"
                          placeholder="20"
                       />
                    </div>
                 </div>
              </div>

              <div className="mt-auto pb-8 pt-10">
                 <button 
                    disabled={!formData.name || !formData.age || !formData.pregnancyWeeks}
                    onClick={() => setStep('QUIZ')}
                    className="w-full bg-cyan-500 disabled:opacity-30 disabled:grayscale py-5 rounded-2xl font-bold text-blue-900 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-cyan-500/20"
                 >
                    Lanjutkan Screening <ChevronRight size={20} />
                 </button>
              </div>
           </div>
        )}

        {/* STEP: QUIZ */}
        {step === 'QUIZ' && sortedQuestions.length > 0 && (
           <div className="animate-in slide-in-from-right duration-500 flex-1 flex flex-col">
              <div className="mb-8">
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full">
                       Pertanyaan {currentQuizIdx + 1} dari {sortedQuestions.length}
                    </span>
                    <span className="text-xs text-gray-500">{Math.round((currentQuizIdx / sortedQuestions.length) * 100)}%</span>
                 </div>
                 <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${(currentQuizIdx / sortedQuestions.length) * 100}%` }}></div>
                 </div>
              </div>

              <div className="flex-1 flex flex-col justify-center text-center">
                 <h2 className="text-2xl font-bold leading-tight mb-8">
                    {sortedQuestions[currentQuizIdx].text_id}
                 </h2>
                 
                 <div className="grid grid-cols-1 gap-4">
                    <button 
                       onClick={() => handleAnswer('YES')}
                       className="w-full py-5 rounded-3xl bg-white/5 border border-white/10 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all font-bold text-lg active:scale-95"
                    >
                       Ya, Benar
                    </button>
                    <button 
                       onClick={() => handleAnswer('NO')}
                       className="w-full py-5 rounded-3xl bg-white/5 border border-white/10 hover:border-red-500 hover:bg-red-500/10 transition-all font-bold text-lg active:scale-95 text-gray-300"
                    >
                       Tidak
                    </button>
                 </div>
              </div>

              {isSubmitting && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-[200]">
                   <div className="flex flex-col items-center gap-4">
                      <Loader2 size={48} className="text-cyan-400 animate-spin" />
                      <p className="font-bold text-white">Menganalisis Jawaban Anda...</p>
                   </div>
                </div>
              )}
           </div>
        )}

        {/* STEP: RESULT */}
        {step === 'RESULT' && result && (
           <div className="animate-in zoom-in-95 duration-500 flex-1 flex flex-col items-center justify-center text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl ${
                result.status === 'ZONA HIJAU' ? 'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20' : 
                result.status === 'ZONA KUNING' ? 'bg-amber-500/20 text-amber-400 shadow-amber-500/20' : 
                'bg-red-500/20 text-red-400 shadow-red-500/20'
              }`}>
                 {result.status === 'ZONA HIJAU' ? <CheckCircle size={48} /> : <AlertCircle size={48} />}
              </div>
              
              <h2 className={`text-3xl font-bold mb-4 ${
                result.status === 'ZONA HIJAU' ? 'text-emerald-400' : 
                result.status === 'ZONA KUNING' ? 'text-amber-400' : 
                'text-red-400'
              }`}>
                {result.status}
              </h2>
              
              <p className="text-gray-300 leading-relaxed mb-10 max-w-xs">
                {result.message}
              </p>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 w-full mb-10">
                 <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">Informasi Penting</h4>
                 <div className="space-y-3 text-left">
                    <div className="flex gap-3 items-start">
                       <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                       <p className="text-xs text-gray-400">Data ini telah tersimpan dan terpantau oleh admin tour.</p>
                    </div>
                    <div className="flex gap-3 items-start">
                       <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                       <p className="text-xs text-gray-400">Tunjukkan layar ini kepada staf operasional di dermaga.</p>
                    </div>
                 </div>
              </div>

              <button 
                 onClick={() => window.location.reload()}
                 className="px-10 py-4 rounded-full bg-white/10 text-white font-bold text-sm active:scale-95 transition-all"
              >
                 Selesai & Keluar
              </button>
           </div>
        )}

      </div>

      <footer className="w-full max-w-md py-6 text-center text-[10px] text-gray-600 font-medium">
         &copy; 2024 LovinaMom Bali Safety GIS. All Rights Reserved.
      </footer>
    </div>
  );
};