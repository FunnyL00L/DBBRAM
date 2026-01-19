import React, { useState } from 'react';
import { ADMIN_PIN } from '../constants';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      onLogin();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Dynamic Ocean Background */}
      <div className="absolute inset-0 bg-blue-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-cyan-900 to-blue-950 opacity-90"></div>
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-cyan-400 mx-auto mb-6 flex items-center justify-center text-2xl font-bold text-blue-900 shadow-[0_0_20px_rgba(34,211,238,0.5)]">
            L
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">LovinaMom</h1>
          <p className="text-blue-200 mb-8">Admin Dashboard Access</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="Enter PIN"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-center text-xl text-white tracking-[0.5em] placeholder-transparent focus:outline-none focus:border-cyan-400 transition-colors"
              maxLength={4}
              autoFocus
            />
            {error && <p className="text-red-400 text-sm">Incorrect PIN. Try again.</p>}
            
            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-blue-900 font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
