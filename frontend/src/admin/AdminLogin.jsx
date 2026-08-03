import React, { useState } from 'react';
import { Zap } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@diversia.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Échec de la connexion');
      }

      localStorage.setItem('authToken', data.data.token);
      window.location.href = '/admin';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center px-4 py-10 relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] shadow-2xl p-8 md:p-10 relative z-10">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="bg-amber-500 text-slate-950 p-2 rounded-2xl shadow-lg shadow-amber-500/20">
            <Zap className="h-6 w-6 fill-slate-950" />
          </div>
          <span className="text-2xl font-black tracking-wider text-white">DIVERSIA <span className="text-amber-500">SARL</span></span>
        </div>
        
        <h1 className="text-xl md:text-2xl font-extrabold text-white text-center mb-2">Espace d'Administration</h1>
        <p className="text-xs text-slate-400 text-center mb-8 leading-relaxed">
          Saisissez vos identifiants pour accéder à la console d'exploitation de la plateforme.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-150 placeholder-slate-600 focus:border-amber-500 focus:bg-slate-950/80 focus:outline-none transition-all duration-300"
              placeholder="admin@diversia.local"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-150 placeholder-slate-600 focus:border-amber-500 focus:bg-slate-950/80 focus:outline-none transition-all duration-300"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="text-xs text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-4 text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.01] shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-8 text-[10px] text-slate-500 leading-relaxed text-center border-t border-slate-850 pt-6">
          Seul le personnel autorisé disposant de droits d'administration peut accéder à cette section.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
