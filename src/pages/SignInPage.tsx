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
  AlertCircle,
  FileText,
  Lock,
  Eye,
  Settings,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface SignInPageProps {
  onNavigate: (page: string) => void;
  onSuccess: (profile: any) => void;
}

type VerificationStep = 'USERNAME' | 'VERIFY' | 'PASSWORD_SIGN_IN' | 'FINALIZE';

export default function SignInPage({ onNavigate, onSuccess }: SignInPageProps) {
  const [step, setStep] = useState<VerificationStep>('USERNAME');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Verification State
  const [robloxUsername, setRobloxUsername] = useState('');
  const [robloxInfo, setRobloxInfo] = useState<any>(null);
  const verificationCode = useMemo(() => `ROT-${Math.floor(100000 + Math.random() * 900000)}`, []);
  
  // Profile & Password State
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      const photo = avatarData?.data?.[0]?.imageUrl || `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${data.userId}&size=420x420&format=Png&isCircular=false`;
      setRobloxPhoto(photo);

      setRobloxInfo(data);

      // Check if user has an account with a password
      const checkRes = await fetch(`/api/users/check?robloxId=${data.userId}`);
      const checkData = await checkRes.json();

      if (checkData.exists && checkData.hasPassword) {
        setStep('PASSWORD_SIGN_IN');
      } else {
        setStep('VERIFY');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInPassword.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robloxId: robloxInfo.userId,
          password: signInPassword.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to authenticate operator credentials.');

      onSuccess(data);
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

    if (!password.trim()) {
      setError('Please create a secure access password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

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
          robloxUsername: robloxInfo.username,
          password: password.trim()
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
    <main className="flex-grow relative flex items-center justify-center py-20 px-6 bg-surface overflow-hidden min-h-[calc(100vh-200px)]">
      {/* Mesh Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(#940fff 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Central Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md z-10"
      >
        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(148,15,255,0.06)]">
          
          {/* Card Header */}
          <div className="bg-slate-50 px-8 pt-8 pb-6 border-b border-outline-variant/50 text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-primary/20 text-primary">
              <ShieldCheck size={28} />
            </div>
            
            {step === 'USERNAME' && (
              <>
                <h1 className="font-headline-md text-lg text-on-surface mb-1">Infrastructure Access</h1>
                <p className="text-xs text-on-surface-variant opacity-80">Secure portal for Rotection services</p>
              </>
            )}

            {step === 'PASSWORD_SIGN_IN' && (
              <>
                <h1 className="font-headline-md text-lg text-on-surface mb-1">Secure Sign In</h1>
                <p className="text-xs text-on-surface-variant opacity-80">Authenticate operator credentials</p>
              </>
            )}

            {step === 'VERIFY' && (
              <>
                <h1 className="font-headline-md text-lg text-on-surface mb-1">Verify Identity</h1>
                <p className="text-xs text-on-surface-variant opacity-80">Rotection authentication sequence</p>
              </>
            )}

            {step === 'FINALIZE' && (
              <>
                <h1 className="font-headline-md text-lg text-on-surface mb-1">Initialize Operator Profile</h1>
                <p className="text-xs text-on-surface-variant opacity-80">Finalize security credentials</p>
              </>
            )}
          </div>

          {/* Form Body with step transitions */}
          <AnimatePresence mode="wait">
            {step === 'USERNAME' && (
              <motion.form
                key="step-username"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleFetchRoblox}
                className="p-8 space-y-6"
              >
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-start gap-2.5">
                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="font-label-bold text-xs text-on-surface-variant flex items-center gap-2" htmlFor="roblox-username">
                    <User size={14} className="text-primary" />
                    Roblox Username
                  </label>
                  <input 
                    required
                    id="roblox-username"
                    placeholder="Enter your system ID (e.g. Builderman)" 
                    value={robloxUsername}
                    onChange={(e) => setRobloxUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 outline-none transition-all text-sm text-on-surface" 
                  />
                </div>

                <div className="flex items-center gap-3 py-1">
                  <input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" id="remember" type="checkbox" defaultChecked />
                  <label className="text-xs text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Remember this device</label>
                </div>

                <button 
                  type="submit"
                  disabled={loading || !robloxUsername.trim()}
                  className="w-full bg-primary text-white py-2.5 rounded-lg font-label-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={16} className="mt-0.5" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-on-surface-variant">
                    Don't have an operative profile? Enter your Username to sign up.
                  </p>
                </div>
              </motion.form>
            )}

            {step === 'PASSWORD_SIGN_IN' && (
              <motion.form
                key="step-password-signin"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handlePasswordSignIn}
                className="p-8 space-y-6"
              >
                <button 
                  type="button"
                  onClick={() => setStep('USERNAME')}
                  className="flex items-center gap-1.5 text-xs font-label-bold text-outline hover:text-primary transition-colors mb-2 cursor-pointer"
                >
                  <ChevronLeft size={14} /> Back
                </button>

                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-outline-variant/50">
                  <img 
                    src={robloxPhoto || `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxInfo?.userId}&size=420x420&format=Png&isCircular=false`} 
                    className="w-12 h-12 rounded-lg object-cover border border-outline-variant/50 flex-shrink-0"
                    alt="Profile"
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none">Registered Operator</p>
                    <p className="text-sm font-bold text-on-surface truncate mt-1">@{robloxInfo?.username}</p>
                    <p className="text-[10px] text-outline mt-0.5">UID: {robloxInfo?.userId}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-label-bold text-xs text-on-surface-variant flex items-center gap-2" htmlFor="sign-in-password">
                    <Lock size={14} className="text-primary" />
                    Security Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      id="sign-in-password"
                      placeholder="Enter pass-code to unlock" 
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 outline-none transition-all text-sm pr-10 text-on-surface" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors cursor-pointer flex items-center justify-center p-1"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-start gap-2.5">
                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading || !signInPassword.trim()}
                  className="w-full bg-primary text-white py-2.5 rounded-lg font-label-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-md disabled:opacity-50 cursor-pointer animate-none"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      Unlock Terminal
                      <ArrowRight size={16} className="mt-0.5" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setStep('VERIFY');
                    }}
                    className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline cursor-pointer"
                  >
                    Reset or verify via Roblox Profile About text instead
                  </button>
                </div>
              </motion.form>
            )}

            {step === 'VERIFY' && (
              <motion.div
                key="step-verify"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="p-8 space-y-6"
              >
                <button 
                  onClick={() => setStep('USERNAME')}
                  className="flex items-center gap-1.5 text-xs font-label-bold text-outline hover:text-primary transition-colors mb-2"
                >
                  <ChevronLeft size={14} /> Back
                </button>

                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-outline-variant/50">
                  <img 
                    src={robloxPhoto || `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxInfo.userId}&size=420x420&format=Png&isCircular=false`} 
                    className="w-12 h-12 rounded-lg object-cover border border-outline-variant/50 flex-shrink-0"
                    alt="Profile"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-outline leading-none uppercase tracking-widest font-black">Target Agent</p>
                    <p className="text-sm font-bold text-on-surface truncate mt-1">@{robloxInfo.username}</p>
                    <p className="text-[10px] text-primary font-bold mt-0.5">UID: {robloxInfo.userId}</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-outline-variant/70 rounded-lg p-5 text-center">
                  <p className="text-[9px] font-black uppercase text-outline tracking-widest mb-3">Verification Hash Code</p>
                  <div 
                    onClick={handleCopyCode}
                    className="flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-dashed border-primary/40 rounded-lg cursor-pointer hover:border-primary transition-all group shadow-sm active:scale-95"
                  >
                    <span className="font-mono text-base font-bold tracking-tight text-on-surface">{verificationCode}</span>
                    <Copy size={14} className="text-outline group-hover:text-primary" />
                  </div>
                  <p className="mt-3.5 text-xs text-on-surface-variant leading-relaxed">
                    Paste this code into your Roblox profile <span className="font-bold text-on-surface">"About"</span> section, save it, and click verify below.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-start gap-2.5">
                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <button 
                    onClick={handleVerifyCode}
                    disabled={loading}
                    className="w-full bg-primary text-white py-2.5 rounded-lg font-label-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>
                        Verify Now
                        <CheckCircle2 size={16} />
                      </>
                    )}
                  </button>
                  
                  <a 
                    href={`https://www.roblox.com/users/${robloxInfo.userId}/profile`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-on-surface-variant font-label-bold rounded-lg transition-all flex justify-center items-center gap-1.5 text-xs border border-outline-variant"
                  >
                    Open Roblox Profile
                    <ExternalLink size={12} />
                  </a>
                </div>
              </motion.div>
            )}

            {step === 'FINALIZE' && (
              <motion.form
                key="step-finalize"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleRegister}
                className="p-8 space-y-6"
              >
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-green-700 text-xs flex gap-3">
                  <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Identity Verified Successfully</p>
                    <p className="mt-0.5 text-green-600/90">Please set up your operator credentials on Rotection.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-label-bold text-on-surface-variant">App Display Name</label>
                    <input 
                      required
                      placeholder="Your safety handle" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-slate-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 outline-none transition-all text-sm text-on-surface" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-label-bold text-on-surface-variant">Bio (Optional)</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g., Security interests, experience, digital moderation..." 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-slate-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 outline-none transition-all text-sm resize-none text-on-surface" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-label-bold text-on-surface-variant">Create Security Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 outline-none transition-all text-sm pr-10 text-on-surface" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-primary transition-colors cursor-pointer flex items-center justify-center p-1"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-label-bold text-on-surface-variant">Confirm Password</label>
                    <input 
                      type="password"
                      required
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-4 py-3 outline-none transition-all text-sm text-on-surface" 
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-start gap-2.5">
                    <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading || !displayName.trim()}
                  className="w-full bg-primary text-white py-2.5 rounded-lg font-label-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : 'Complete Setup'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info matches template exactly */}
        <div className="mt-6 flex items-center justify-center gap-3 text-on-surface-variant/40">
          <div className="flex items-center gap-1">
            <Lock size={12} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Encrypted 256-bit</span>
          </div>
          <div className="w-1 h-1 bg-outline rounded-full" />
          <div className="flex items-center gap-1">
            <ShieldCheck size={12} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Secure Hub Verified</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => onNavigate('landing')}
            className="text-xs font-label-bold text-outline hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto py-1 cursor-pointer"
          >
            <RotateCcw size={12} /> Cancel & return home
          </button>
        </div>

      </motion.div>
    </main>
  );
}
