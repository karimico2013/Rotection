import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Copy, 
  ExternalLink,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface SignInPageProps {
  onNavigate: (page: string) => void;
  onSuccess: (profile: any) => void;
}

type VerificationStep = 'USERNAME' | 'VERIFY' | 'FINALIZE';

export default function SignInPage({ onNavigate, onSuccess }: SignInPageProps) {
  const [step, setStep] = useState<VerificationStep>('USERNAME');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Verification State
  const [robloxUsername, setRobloxUsername] = useState('');
  const [robloxInfo, setRobloxInfo] = useState<any>(null);
  const verificationCode = useMemo(() => `ROT-${Math.floor(100000 + Math.random() * 900000)}`, []);
  
  // Profile State
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  const [robloxPhoto, setRobloxPhoto] = useState<string | null>(null);
  
  const handleFetchRoblox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!robloxUsername.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/roblox/user/${robloxUsername.trim()}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to find Roblox user');
      
      // Fetch User Avatar for Preview
      const avatarRes = await fetch(`/api/roblox/thumbnails/user-avatar?userId=${data.userId}`);
      const avatarData = await avatarRes.json();
      setRobloxPhoto(avatarData?.data?.[0]?.imageUrl || `https://www.roblox.com/headshot-thumbnail/image?userId=${data.userId}&width=420&height=420&format=png`);

      setRobloxInfo(data);
      setStep('VERIFY');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setError(null);
    try {
      // Re-fetch to check description
      const res = await fetch(`/api/roblox/user/${robloxInfo.username}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error('Verification failed. Try again.');

      if (data.description.includes(verificationCode)) {
        setDisplayName(data.displayName || data.username);
        setStep('FINALIZE');
      } else {
        throw new Error('Code not found in your Roblox description. Please ensure it is exactly correct.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: robloxInfo.userId.toString(),
          username: displayName.trim(),
          bio: bio.trim(),
          robloxId: robloxInfo.userId,
          robloxUsername: robloxInfo.username
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      onSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(verificationCode);
    alert('Code copied to clipboard!');
  };

  return (
    <main className="flex-grow flex items-center justify-center px-6 py-24 bg-surface relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-primary rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white border border-outline-variant/30 rounded-[2.5rem] p-10 shadow-xl shadow-primary/5">
          <AnimatePresence mode="wait">
            {step === 'USERNAME' && (
              <motion.div
                key="step-username"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
                    <ShieldCheck size={32} />
                  </div>
                  <h1 className="font-headline-lg text-on-surface mb-2">Connect Roblox</h1>
                  <p className="font-body-md text-outline">Enter your Roblox username to begin the verification process.</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-3">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleFetchRoblox} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block font-label-bold text-on-surface ml-1">Roblox Username</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                        <User size={18} />
                      </div>
                      <input 
                        required
                        placeholder="e.g. Builderman" 
                        value={robloxUsername}
                        onChange={(e) => setRobloxUsername(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-surface-container-lowest border border-outline rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-body-md" 
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={loading || !robloxUsername.trim()}
                    className="w-full py-4 bg-primary text-white font-label-bold rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                      <>Continue <ArrowRight size={18} /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'VERIFY' && (
              <motion.div
                key="step-verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button 
                  onClick={() => setStep('USERNAME')}
                  className="mb-6 flex items-center gap-1 text-xs font-label-bold text-outline hover:text-primary transition-colors"
                >
                  <ChevronLeft size={14} /> Back
                </button>

                <div className="text-center mb-8">
                  <img 
                    src={robloxPhoto || `https://www.roblox.com/headshot-thumbnail/image?userId=${robloxInfo.userId}&width=420&height=420&format=png`} 
                    className="w-20 h-20 rounded-2xl mx-auto mb-4 border-2 border-primary/20 p-1"
                    alt="Profile"
                  />
                  <h1 className="font-headline-sm text-on-surface">Verify Identity</h1>
                  <p className="text-xs text-outline mt-1">Logged in as <span className="font-black text-primary">@{robloxInfo.username}</span></p>
                </div>

                <div className="bg-surface-container/50 border border-outline-variant/30 rounded-2xl p-6 mb-8 text-center">
                  <p className="text-[10px] font-black uppercase text-outline tracking-widest mb-4">Verification Code</p>
                  <div 
                    onClick={handleCopyCode}
                    className="flex items-center justify-center gap-3 py-3 px-6 bg-white border-2 border-dashed border-primary/30 rounded-xl cursor-pointer hover:border-primary transition-all group"
                  >
                    <span className="font-mono text-xl font-bold tracking-tighter text-on-surface">{verificationCode}</span>
                    <Copy size={16} className="text-outline group-hover:text-primary" />
                  </div>
                  <p className="mt-4 text-xs text-outline leading-relaxed">
                    Paste this code into your Roblox <span className="font-bold text-on-surface">"About"</span> section and click verify once saved.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-3">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <button 
                    onClick={handleVerifyCode}
                    disabled={loading}
                    className="w-full py-4 bg-primary text-white font-label-bold rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                      <>Verify Now <CheckCircle2 size={18} /></>
                    )}
                  </button>
                  
                  <a 
                    href={`https://www.roblox.com/users/${robloxInfo.userId}/profile`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 bg-surface-container-low text-on-surface font-label-bold rounded-2xl hover:bg-surface-container transition-all flex justify-center items-center gap-2 text-sm"
                  >
                    Open Roblox Profile <ExternalLink size={14} />
                  </a>
                </div>
              </motion.div>
            )}

            {step === 'FINALIZE' && (
              <motion.div
                key="step-finalize"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={32} />
                  </div>
                  <h1 className="font-headline-lg text-on-surface mb-2">Verified!</h1>
                  <p className="font-body-md text-outline">Identity confirmed. Now set your platform profile.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block font-label-bold text-on-surface">App Display Name</label>
                    <input 
                      required
                      placeholder="Your safety handle" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-label-bold text-on-surface">Bio (Optional)</label>
                    <textarea 
                      rows={3}
                      placeholder="Security interests, experience..." 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-4 py-3 bg-surface-container-lowest border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none" 
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={loading || !displayName.trim()}
                    className="w-full py-4 bg-black text-white font-label-bold rounded-2xl hover:bg-black/90 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Complete Setup'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => onNavigate('landing')}
            className="text-xs font-label-bold text-outline hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <RotateCcw size={12} /> Cancel & Home
          </button>
        </div>
      </motion.div>
    </main>
  );
}
