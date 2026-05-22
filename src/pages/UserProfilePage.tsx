import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Mail, 
  PersonStanding, 
  PersonStanding as UserCheck, 
  MessageSquare, 
  CheckCircle2, 
  ShieldAlert, 
  Trophy, 
  Network, 
  Share2, 
  ExternalLink,
  ArrowLeft,
  Loader2,
  Lock,
  Star,
  UserPlus
} from 'lucide-react';
import { useState, useEffect } from 'react';
import UserAvatar from '../components/UserAvatar';

interface UserProfilePageProps {
  userId: string;
  onNavigate: (page: string, data?: any) => void;
  onGameSelect: (gameId: string) => void;
}

export default function UserProfilePage({ userId, onNavigate, onGameSelect }: UserProfilePageProps) {
  const [profile, setProfile] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'comments' | 'reports'>('comments');
  const [games, setGames] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, activityRes, gamesRes] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch(`/api/users/${userId}/activity`),
          fetch('/api/games')
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json();
          setActivity(activityData);
        }

        if (gamesRes.ok) {
          const gamesData = await gamesRes.json();
          const gamesMap = gamesData.reduce((acc: any, game: any) => {
            acc[game.id] = game;
            return acc;
          }, {});
          setGames(gamesMap);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-4 bg-surface">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-label-bold text-outline uppercase tracking-widest text-[10px]">Accessing Infrastructure</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-32 px-6 max-w-7xl mx-auto text-center space-y-6">
        <ShieldAlert size={64} className="mx-auto text-error" />
        <h1 className="font-headline-lg">Unauthorized Access</h1>
        <p className="text-secondary">The specified user profile could not be found or is restricted.</p>
        <button 
          onClick={() => onNavigate('landing')}
          className="bg-primary text-white px-8 py-3 rounded-xl font-label-bold"
        >
          Return to Portal
        </button>
      </div>
    );
  }

  const isStaff = ['admin', 'creator', 'co-creator', 'owner', 'co-owner'].includes(profile.role?.toLowerCase());
  const isSpecialist = ['auditor', 'moderator'].includes(profile.role?.toLowerCase());

  const getRoleDisplay = () => {
    const role = profile.role?.toLowerCase() || 'user';
    switch(role) {
      case 'creator': return 'Founder & Creator';
      case 'co-creator': return 'Building the Future';
      case 'admin': return 'System Administrator';
      case 'owner': return 'Owner';
      case 'co-owner': return 'Co-Owner';
      case 'auditor': return 'Verified Auditor';
      case 'moderator': return 'Community Moderator';
      default: return 'Community Member';
    }
  };

  const comments = activity.filter(a => a.type === 'comment');
  const reports = activity.filter(a => a.type === 'report');

  return (
    <div className="min-h-screen bg-surface pt-24 pb-12 overflow-x-hidden">
      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-6 mb-8 mt-4">
        <button 
          onClick={() => onNavigate('detail', null)} /* Back to whatever history we have or detail */
          className="flex items-center gap-2 text-outline font-label-bold hover:text-primary transition-all text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Back to Directory
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-6 space-y-8">
        {/* High-Impact Hero Section */}
        <section className="relative bg-custom-dark rounded-2xl overflow-hidden p-8 md:p-12 border border-outline-variant/10 shadow-2xl">
          {/* Decorative Background Element */}
          <div className="absolute -top-12 -right-12 p-8 opacity-[0.03] select-none pointer-events-none">
            <ShieldCheck size={320} fill="currentColor" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-10">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-4 border-primary shadow-2xl ring-4 ring-primary/10">
                <UserAvatar 
                  userId={profile.uid}
                  robloxId={profile.robloxId}
                  photoURL={profile.photoURL}
                  displayName={profile.displayName}
                  className="w-full h-full object-cover bg-surface-container-highest"
                />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-2 -right-2 bg-primary-container text-white p-1.5 rounded-lg shadow-xl ring-4 ring-custom-dark"
              >
                <CheckCircle2 size={18} fill="currentColor" className="text-white" />
              </motion.div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-6">
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <h1 className="font-headline-xl text-white tracking-tight">{profile.displayName}</h1>
                  <span className={`px-4 py-1.5 rounded font-label-bold text-[10px] uppercase tracking-widest border shadow-lg ${
                    isStaff ? 'bg-primary text-white border-primary/50' : 
                    isSpecialist ? 'bg-secondary text-white border-secondary/50' : 
                    'bg-white/5 text-secondary-fixed-dim border-white/10'
                  }`}>
                    {getRoleDisplay()}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <div className="flex items-center gap-1.5 text-secondary-fixed-dim font-label-bold text-[11px] uppercase tracking-wider">
                    <Calendar size={14} className="text-primary/60" /> Joined 2024
                  </div>
                  {profile.robloxUsername && (
                    <a 
                      href={`https://www.roblox.com/users/${profile.robloxId}/profile`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary-fixed hover:text-white transition-colors font-label-bold text-[11px] uppercase tracking-wider group"
                    >
                      <Trophy size={14} className="text-primary/60 group-hover:text-primary transition-colors" /> Roblox: {profile.robloxUsername}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex gap-10 justify-center md:justify-start">
                <div className="flex flex-col">
                  <span className="text-white font-headline-md leading-tight">12.4k</span>
                  <span className="text-outline-variant font-label-bold text-[10px] uppercase tracking-widest">Followers</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-headline-md leading-tight">{activity.length}</span>
                  <span className="text-outline-variant font-label-bold text-[10px] uppercase tracking-widest">Security Posts</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-headline-md leading-tight">98%</span>
                  <span className="text-outline-variant font-label-bold text-[10px] uppercase tracking-widest">Trust Score</span>
                </div>
              </div>

              <p className="font-body-lg text-secondary-fixed-dim max-w-2xl leading-relaxed text-balance">
                {profile.bio || "Digital safety advocate and verified security specialist. Committed to building a more transparent gaming ecosystem through proactive infrastructure and community-driven security protocols."}
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto">
              <button className="bg-primary-container text-white px-10 py-3 rounded-xl font-headline-md hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-primary/20">
                <UserPlus size={20} /> Follow
              </button>
              <button className="border border-white/20 text-white px-10 py-3 rounded-xl font-headline-md hover:bg-white/5 transition-all flex items-center justify-center gap-3">
                <Mail size={20} /> Message
              </button>
            </div>
          </div>
        </section>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Activity Feed */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              {/* Tab Header */}
              <div className="flex border-b border-outline-variant bg-surface-container-low/30">
                <button 
                  onClick={() => setActiveTab('comments')}
                  className={`flex-1 px-8 py-5 font-headline-md transition-all relative ${activeTab === 'comments' ? 'text-primary' : 'text-outline hover:text-on-surface'}`}
                >
                  Activity Logs
                  {activeTab === 'comments' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />}
                </button>
                <button 
                  onClick={() => setActiveTab('reports')}
                  className={`flex-1 px-8 py-5 font-headline-md transition-all relative ${activeTab === 'reports' ? 'text-primary' : 'text-outline hover:text-on-surface'}`}
                >
                  Security Audits
                  {activeTab === 'reports' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />}
                </button>
              </div>

              {/* Activity Content */}
              <div className="p-8 space-y-6">
                {(activeTab === 'comments' ? comments : reports).length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <div className="w-16 h-16 bg-surface-container rounded-lg flex items-center justify-center mx-auto text-outline/30">
                      <MessageSquare size={32} />
                    </div>
                    <p className="text-secondary font-label-bold uppercase tracking-widest text-xs">No entries found in ledger</p>
                  </div>
                ) : (
                  (activeTab === 'comments' ? comments : reports).map((item) => {
                    const game = games[item.gameId];
                    return (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-6 p-6 rounded-xl bg-surface-container-low border border-transparent hover:border-primary/10 transition-all group cursor-pointer"
                        onClick={() => item.gameId && onGameSelect(item.gameId)}
                      >
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-surface-dim flex-shrink-0 overflow-hidden border border-outline-variant/30 group-hover:scale-105 transition-transform shadow-sm">
                          <img 
                            alt="Experience Icon" 
                            className="w-full h-full object-cover" 
                            src={game?.imgUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80'} 
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h4 className="font-headline-md text-on-surface group-hover:text-primary transition-colors">{game?.title || "Unknown Experience"}</h4>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={14} 
                                    className={i < (item.rating || item.overallRating || 0) ? 'fill-primary text-primary' : 'text-outline'} 
                                    fill={i < (item.rating || item.overallRating || 0) ? "currentColor" : "none"}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] font-label-bold text-outline uppercase tracking-widest">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-body-md text-on-surface-variant leading-relaxed line-clamp-3">
                            {item.text || item.description || "Digital scan complete. Integrity verified."}
                          </p>
                          <div className="pt-4 flex gap-6">
                            <button className="flex items-center gap-1.5 text-[11px] font-label-bold text-outline hover:text-primary transition-colors">
                              <ShieldCheck size={14} /> Integrity Validated
                            </button>
                            <button className="flex items-center gap-1.5 text-[11px] font-label-bold text-outline hover:text-primary transition-colors">
                              <Share2 size={14} /> Broadcast
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Stats & Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Achievement Bento Box */}
            <div className="bg-white border border-outline-variant rounded-xl p-8 shadow-sm">
              <h3 className="font-headline-md text-on-surface mb-6">Badges & Assets</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { title: "Early Adopter", icon: <Trophy />, active: true },
                  { title: "Safe Guardian", icon: <ShieldCheck />, active: true },
                  { title: "Security Specialist", icon: <Lock />, active: false },
                  { title: "Trust Advocate", icon: <UserCheck />, active: true },
                  { title: "Beta Tester", icon: <Share2 />, active: false },
                  { title: "Network Peer", icon: <Network />, active: true },
                ].map((badge, i) => (
                  <div 
                    key={i} 
                    className={`aspect-square rounded-lg flex items-center justify-center group cursor-pointer transition-all ${badge.active ? 'bg-primary/5 text-primary border border-primary/10 shadow-sm' : 'bg-surface-container-high text-outline opacity-40 grayscale border border-transparent'}`}
                    title={badge.title}
                  >
                    <div className="group-hover:scale-110 transition-transform">
                      {badge.icon}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trusted Networks */}
            <div className="bg-white border border-outline-variant rounded-xl p-8 shadow-sm">
              <h3 className="font-headline-md text-on-surface mb-6">Trusted Infrastructure</h3>
              <ul className="space-y-5">
                <li className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-custom-dark flex items-center justify-center shadow-lg">
                      <ShieldCheck size={20} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-bold text-on-surface leading-tight">Safety Alliance</span>
                      <span className="text-[10px] text-outline uppercase tracking-widest">Full Auth</span>
                    </div>
                  </div>
                  <CheckCircle2 size={18} className="text-primary" fill="currentColor" />
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg">
                      <Lock size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-bold text-on-surface leading-tight">Auth Systems</span>
                      <span className="text-[10px] text-outline uppercase tracking-widest">System Peer</span>
                    </div>
                  </div>
                  <CheckCircle2 size={18} className="text-primary" fill="currentColor" />
                </li>
              </ul>
            </div>

            {/* Safety Shield Rating Display */}
            <div className="bg-gradient-to-br from-primary to-custom-dark rounded-2xl p-8 text-white text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 space-y-6">
                <div className="inline-block p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                  <CheckCircle2 size={48} fill="currentColor" className="text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-headline-lg">Elite Rank</h3>
                  <p className="text-primary-fixed/80 text-sm font-body-md">Top 0.5% of security contributors worldwide.</p>
                </div>
                <button className="w-full bg-white text-primary hover:bg-white/90 py-3 rounded-xl font-label-bold transition-all shadow-xl">
                  View Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
