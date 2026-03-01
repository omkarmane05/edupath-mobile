
import React, { useState, useEffect } from 'react';
import {
  Compass, ArrowRight, Mail,
  Loader2, AlertCircle, Sparkles, Inbox
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabase';

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
    </div>
  );
};

export default Login;
