import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, ArrowLeft, Key, Sparkles, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
  brandName?: string;
}

export default function AdminLogin({ onLoginSuccess, onCancel, brandName = "Bhagwati" }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Secure local demo credentials
  const defaultEmail = 'admin@bhagwati.com';
  const defaultPassword = 'Bhagwati@108';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      if (email.trim() === defaultEmail && password === defaultPassword) {
        setIsSubmitting(false);
        onLoginSuccess();
      } else {
        setIsSubmitting(false);
        setErrorMsg('Invalid login credentials. Please check your username and password.');
      }
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden"
      >
        {/* Brand Banner Header color */}
        <div className="bg-[#800020] p-8 text-center text-white relative">
          <div className="absolute top-4 left-4">
            <button
              onClick={onCancel}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition cursor-pointer flex items-center justify-center"
              title="Return to Main Shop"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-white/10 text-amber-300 text-xl font-serif font-black flex items-center justify-center border-2 border-amber-300/60 shadow-inner mx-auto mb-3">
            भ
          </div>
          <h2 className="font-serif font-extrabold text-lg text-amber-300 tracking-tight">Owner Portal Security</h2>
          <p className="text-[10px] text-orange-200 font-medium tracking-wider uppercase mt-1">Bhagwati Cloud Kitchen</p>

          <div className="absolute right-4 bottom-4">
            <Lock className="w-5 h-5 text-amber-400 opacity-40 shrink-0" />
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-extrabold text-neutral-800">Secure Admin Authentication</h3>
            <p className="text-xs text-neutral-400">Please provide credential keys to view and manage active bookings, kitchen catalog, coupons & analytics.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-start gap-2.5 font-sans"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span className="font-semibold leading-relaxed">{errorMsg}</span>
              </motion.div>
            )}

            {/* Email Field input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Administrator Email</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-neutral-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 font-semibold"
                />
              </div>
            </div>

            {/* Password Field input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Security Password PIN</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-neutral-400">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 font-semibold font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <button
              id="admin-login-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#800020] hover:bg-[#99002a] text-white font-extrabold text-xs rounded-xl shadow-md transition transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Unlocking Portal Access...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verify Credentials & Enter 🔐</span>
                </>
              )}
            </button>
          </form>

          {/* Share details and help panel to meet the design rules & requested parameters */}
        </div>
      </motion.div>
    </div>
  );
}
