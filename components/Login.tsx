
import React, { useState, useEffect } from 'react';
import {
  Compass, ArrowRight, Mail,
  Loader2, AlertCircle, Sparkles, Inbox
} from 'lucide-react';
import { supabase, isSupabaseConfigured, signInWithGoogle } from '../supabase';

interface LoginProps {
  onLogin: (data: { identifier: string; method: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'input' | 'sent' | 'processing'>('input');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        onLogin({ identifier: session.user.email || 'User', method: 'supabase' });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        onLogin({ identifier: session.user.email || 'User', method: 'supabase' });
      }
    });

    return () => subscription.unsubscribe();
  }, [onLogin]);

  const [currentSlide, setCurrentSlide] = useState(0);

  const VISION_SLIDES = [
    { title: "Opportunity", text: "Turning unemployment into opportunity." },
    { title: "For India", text: "Built for India's workforce to grow." },
    { title: "Bridge", text: "Connecting skills to meaningful work." },
    { title: "Impact", text: "No talent should go unnoticed." },
    { title: "Growth", text: "From potential to productivity." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % VISION_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setLoading(true);

    if (!isSupabaseConfigured) {
      setError("System Configuration Error: API Keys Missing.");
      setLoading(false);
      return;
    }

    // Magic Link Login (Passwordless)
    // RedirectTo ensures they come back to the right place after clicking mail
    const redirectUrl = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl }
    });

    setLoading(false);
    if (error) {
      console.error(error);
      setError(error.message || "Could not send login link. Try again.");
    } else {
      setStep('sent');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();

    if (error) {
      console.error(error);
      setError(error.message || "Could not sign in with Google.");
      setLoading(false);
    }
    // If successful, the onAuthStateChange listener in useEffect will catch it and call onLogin
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 relative overflow-hidden font-sans">
      {/* Optimized Background: Standard CSS Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 pointer-events-none"></div>

      <div className="w-full max-w-[440px] bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-12 md:p-14 border border-slate-100 relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-2xl shadow-blue-200">
            <Compass className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">EduPath</h1>

          {/* Vision Carousel */}
          <div className="h-12 flex flex-col items-center justify-center relative w-full overflow-hidden">
            {VISION_SLIDES.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 transform ${index === currentSlide
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-4 scale-95'
                  }`}
              >
                <p className="text-blue-600 font-black uppercase tracking-[0.2em] text-[10px]">{slide.title}</p>
                <p className="text-slate-400 font-bold text-[11px] text-center w-full truncate">{slide.text}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-1.5 mt-3">
            {VISION_SLIDES.map((_, idx) => (
              <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-4 bg-blue-600' : 'w-1 bg-slate-200'}`} />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 animate-in shake">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-xs font-bold text-amber-700 leading-tight">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center animate-in fade-in duration-500">
            <Loader2 className="w-14 h-14 text-blue-600 animate-spin mb-6" />
            <p className="text-slate-900 font-black text-lg tracking-tight">Sending Link...</p>
          </div>
        ) : (
          <>
            {step === 'input' && (
              <>
                <form onSubmit={handleMagicLink} className="space-y-6 page-transition">
                  <div className="animate-in slide-in-from-right-4 duration-300">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest pl-2">University Email</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input
                        type="email" required autoFocus
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@college.edu"
                        className="w-full pl-16 pr-8 py-5 rounded-[1.75rem] bg-slate-50 border-2 border-slate-100 font-bold outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner text-slate-900 placeholder:text-slate-300"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold mt-4 pl-2 leading-relaxed">
                      Enter your email to receive a secure login link. No password required.
                    </p>
                  </div>

                  <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-4 group active:scale-95">
                    Send Magic Link
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                <div className="mt-8 flex items-center gap-4 opacity-50 page-transition">
                  <div className="h-px bg-slate-300 flex-1"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">OR</span>
                  <div className="h-px bg-slate-300 flex-1"></div>
                </div>

                <div className="mt-6 page-transition">
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-white text-slate-800 border-2 border-slate-100 font-black py-5 rounded-[2rem] shadow-sm hover:border-blue-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              </>
            )}

            {step === 'sent' && (
              <div className="py-4 flex flex-col items-center animate-in fade-in duration-500 text-center">
                <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center text-green-500 mb-6 shadow-xl shadow-green-100">
                  <Inbox className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Check your Inbox!</h2>
                <p className="text-sm font-bold text-slate-500 leading-relaxed mb-6">
                  We've sent a secure login link to <br /> <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{email}</span>
                </p>
                <button onClick={() => setStep('input')} className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">
                  Use different email
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-10 text-center space-y-4">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-blue-400" /> Secure Access
          </p>

          {/* Dev/Admin Bypass Removed for Production */}
        </div>
      </div>
    </div >
  );
};

export default Login;
