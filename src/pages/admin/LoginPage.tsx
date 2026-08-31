import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PrimeBroadcastLogo } from '../../components/PrimeBroadcastLogo';
import { Lock, Mail, AlertCircle, ArrowLeft, Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, isAdmin } = useAuth();

  const [email, setEmail] = useState('admin@primebroadcast.net');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in
  React.useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk ke sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#081A2E] via-[#1A0B1E] to-[#2C081A] flex flex-col justify-center py-12 px-6 sm:px-8 lg:px-12 selection:bg-[#A40D35] selection:text-white"
      id="admin-login-page"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-2">
          <PrimeBroadcastLogo variant="light" className="h-11" />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-2xl border border-slate-200/80">
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#A40D35] flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} id="admin-login-form">
            <div>
              <label htmlFor="admin-email-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Administrator
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="admin-email-input"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#081A2E] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A40D35] focus:border-transparent transition-all shadow-sm"
                  placeholder="admin@primebroadcast.net"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="admin-password-input"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#081A2E] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A40D35] focus:border-transparent transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                id="admin-login-submit-btn"
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-[#A40D35] hover:bg-[#850B2B] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A40D35] disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#081A2E] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Kembali ke Website Publik
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
