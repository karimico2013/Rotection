import { motion } from 'motion/react';
import { BadgeCheck, ShieldCheck, Lock, Scale, Baby, ArrowRight, ThumbsUp, Flag, Star, ArrowLeft, Loader2, ExternalLink, Send, Trash2, UserCircle, MessageSquare, X, CheckCircle2, UserPlus } from 'lucide-react';
import { useState, useEffect, FormEvent, useRef } from 'react';
import { OperationType, auth } from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import UserAvatar from '../components/UserAvatar';

interface GameDetailPageProps {
  gameId: string | null;
  onNavigate: (page: string, data?: any) => void;
  user?: any;
  userProfile: any;
}

export default function GameDetailPage({ gameId, onNavigate, userProfile }: GameDetailPageProps) {
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [securityReports, setSecurityReports] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [newReview, setNewReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    chatSafety: 5,
    accountSecurity: 5,
    overallRating: 5,
    description: ''
  });

  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<any>(null);

  const handleUserMouseEnter = (id: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredUser(id);
  };

  const handleUserMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredUser(null);
    }, 300);
  };
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());

  const toggleFollow = (userName: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userName)) next.delete(userName);
      else next.add(userName);
      return next;
    });
  };

  const toggleBlock = (userName: string) => {
    setBlockedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userName)) next.delete(userName);
      else next.add(userName);
      return next;
    });
  };

  const UserProfileCard = ({ userId, userName, userPhoto }: { userId: string, userName: string, userPhoto?: string }) => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const response = await fetch(`/api/users/${userId}`);
          if (response.ok) {
            const data = await response.json();
            setProfile(data);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }, [userId]);

    const isStaff = ['admin', 'creator', 'co-creator'].includes(profile?.role?.toLowerCase());
    const isSpecialist = ['auditor', 'moderator'].includes(profile?.role?.toLowerCase());

    const getRoleDisplay = () => {
      const role = profile?.role?.toLowerCase() || 'user';
      switch(role) {
        case 'creator': return 'Founder & Creator';
        case 'co-creator': return 'Building the Future';
        case 'admin': return 'System Administrator';
        case 'auditor': return 'Verified Auditor';
        case 'moderator': return 'Community Moderator';
        default: return 'Community Member';
      }
    };

    const isFollowed = followedUsers.has(userId);
    const isBlocked = blockedUsers.has(userId);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="absolute z-[100] bottom-full left-0 mb-3 w-64 bg-white rounded-xl shadow-xl border border-outline-variant p-4 pointer-events-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="animate-spin text-primary" size={20} />
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 mb-3">
              <div className="relative">
                <UserAvatar 
                  userId={userId}
                  robloxId={profile?.robloxId}
                  photoURL={profile?.photoURL || userPhoto}
                  displayName={userName}
                  className={`w-12 h-12 rounded-lg object-cover ring-2 ${isStaff ? 'ring-primary/40' : isSpecialist ? 'ring-secondary/40' : 'ring-primary/10'}`} 
                />
                {isStaff && (
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white p-0.5 rounded-md border-2 border-white shadow-sm">
                    <ShieldCheck size={10} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-headline-sm text-on-surface leading-tight truncate">{profile?.displayName || userName}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    isStaff ? 'bg-primary text-white' : 
                    isSpecialist ? 'bg-secondary text-white' : 
                    'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {profile?.role || 'Member'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 pt-3 border-t border-outline-variant/30">
              <p className="text-[10px] text-on-surface-variant leading-relaxed line-clamp-2">
                {profile?.bio || (isStaff ? "Developing the future of digital safety and community protection." : "Active member since 2024. Passionate about safe gaming environments.")}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleFollow(userId)}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-label-bold text-[9px] transition-all flex items-center justify-center gap-1.5 ${
                    isFollowed 
                    ? 'bg-secondary text-white' 
                    : 'bg-primary text-white hover:brightness-105'
                  }`}
                >
                  {isFollowed ? <CheckCircle2 size={10} /> : <UserPlus size={10} />}
                  {isFollowed ? 'Following' : 'Follow'}
                </button>
                <button
                  onClick={() => toggleBlock(userId)}
                  className={`py-1.5 px-2 rounded-lg font-label-bold text-[9px] transition-all border ${
                    isBlocked
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {isBlocked ? 'Blocked' : 'Block'}
                </button>
              </div>

              <button 
                onClick={() => onNavigate('user-profile', userId)}
                className="w-full py-1.5 rounded-lg bg-surface-container-high text-primary font-label-bold text-[9px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                Show More <ArrowRight size={10} />
              </button>
            </div>
          </>
        )}

        {/* Decorative Arrow */}
        <div className="absolute -bottom-1.5 left-5 w-3 h-3 bg-white border-b border-r border-outline-variant rotate-45" />
      </motion.div>
    );
  };

  const handleSubmitReport = async (e: FormEvent) => {
    e.preventDefault();
    if (!userProfile || !gameId) return;

    setSubmitting(true);
    try {
      const reportData = {
        userId: userProfile?.uid,
        robloxId: userProfile?.robloxId,
        userName: userProfile?.displayName,
        userPhoto: userProfile?.photoURL,
        ...reportForm,
      };

      const response = await fetch(`/api/games/${gameId}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });

      if (response.ok) {
        setShowReportModal(false);
        setReportForm({ chatSafety: 5, accountSecurity: 5, overallRating: 5, description: '' });
        // Refresh reports
        const reportsRes = await fetch(`/api/games/${gameId}/reports`);
        const reportsData = await reportsRes.json();
        if (reportsRes.ok) setSecurityReports(reportsData);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/games/${gameId}`);
        const data = await response.json();
        if (response.ok) {
          setGame(data);
          setActiveImage(data.gallery?.[0] || data.imgUrl);
        }
      } catch (error) {
        console.error('Error fetching game:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/games/${gameId}/reviews`);
        const data = await response.json();
        if (response.ok) {
          setReviews(data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    const fetchReports = async () => {
      try {
        const response = await fetch(`/api/games/${gameId}/reports`);
        const data = await response.json();
        if (response.ok) {
          setSecurityReports(data);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchGame();
    fetchReviews();
    fetchReports();
  }, [gameId]);

  const handleSubmitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!userProfile || !newReview.trim() || !gameId) return;

    setSubmitting(true);
    try {
      const reviewData = {
        userId: userProfile.uid,
        robloxId: userProfile?.robloxId,
        userName: userProfile?.displayName,
        userPhoto: userProfile?.photoURL,
        text: newReview.trim(),
        rating,
      };

      const response = await fetch(`/api/games/${gameId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        setNewReview('');
        setRating(5);
        // Refresh reviews
        const reviewsRes = await fetch(`/api/games/${gameId}/reviews`);
        const data = await reviewsRes.json();
        if (reviewsRes.ok) setReviews(data);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    // Note: Sheets API deletion is tricky with just an "id" if we don't have it in the sheet.
    // For now, we'll just log that deletion is not implemented for manual sheets yet or needs a complex lookup.
    console.warn('Delete review not implemented for Sheets yet');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-body-md text-outline">Fetching security report...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <h2 className="font-headline-lg text-on-surface">Experience Not Found</h2>
        <p className="text-secondary">The requested experience could not be found in our database.</p>
        <button 
          onClick={() => onNavigate('games')}
          className="flex items-center gap-2 text-primary font-label-bold hover:underline"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>
      </div>
    );
  }

  const metrics = [
    { 
      title: 'Honesty', 
      value: game.metrics?.honesty || 0, 
      description: 'Transparency of monetization and gameplay loops.', 
      icon: <ShieldCheck />, 
      stars: Math.floor(game.metrics?.honesty || 0) 
    },
    { 
      title: 'Safety', 
      value: game.metrics?.safety || 0, 
      description: 'Infrastructure integrity and user data protection.', 
      icon: <Lock />, 
      stars: Math.floor(game.metrics?.safety || 0) 
    },
    { 
      title: 'Fairness', 
      value: game.metrics?.fairness || 0, 
      description: 'Balance of competitive play and economic equity.', 
      icon: <Scale />, 
      stars: Math.floor(game.metrics?.fairness || 0) 
    },
    { 
      title: 'Age Appropriateness', 
      value: game.metrics?.ageAppropriateness || 0, 
      description: 'Compliance with global age rating standards.', 
      icon: <Baby />, 
      stars: Math.floor(game.metrics?.ageAppropriateness || 0) 
    },
  ];

  return (
    <div className="pt-24 pb-12 bg-surface min-h-screen">
      {/* Navigation Bar */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <button 
          onClick={() => onNavigate('games')}
          className="flex items-center gap-2 text-outline font-label-bold hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> BACK TO DIRECTORY
        </button>
      </div>

      {/* Game Hero Section */}
      <header className="relative w-full h-[600px] flex items-end">
        <div className="absolute inset-0 z-0">
          <img 
            alt={game.title} 
            className="w-full h-full object-cover transition-all duration-700" 
            src={activeImage || game.imgUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80'} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-transparent"></div>
        </div>

        {/* Gallery Overlay */}
        {game.gallery && game.gallery.length > 0 && (
          <div className="absolute top-8 right-8 z-20 flex gap-3 overflow-x-auto max-w-full pb-4 scrollbar-hide">
            {game.gallery.map((img: string, idx: number) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveImage(img)}
                className={`w-24 h-16 rounded-xl overflow-hidden border-2 transition-all shadow-lg ${activeImage === img ? 'border-primary ring-4 ring-primary/20' : 'border-white/50 border-outline-variant hover:border-white'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx + 1}`} />
              </motion.button>
            ))}
          </div>
        )}

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-12 flex flex-col md:flex-row items-end md:items-center justify-between gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <img src={game.imgUrl} className="w-20 h-20 rounded-2xl shadow-2xl border-4 border-white object-cover" alt="Icon" />
              <div>
                <div className="flex items-center gap-3">
                  <span className="bg-primary/10 text-primary text-[10px] font-label-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-primary/20">Verified Platform</span>
                  <span className={`text-[10px] font-label-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm border ${
                    game.category === 'Action' ? 'bg-red-100 text-red-700 border-red-200' :
                    game.category === 'Adventure' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                    game.category === 'RPG' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                    game.category === 'Simulation' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    game.category === 'Roleplay' ? 'bg-pink-100 text-pink-700 border-pink-200' :
                    game.category === 'Platformer' ? 'bg-green-100 text-green-700 border-green-200' :
                    game.category === 'Shooter' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                    'bg-violet-100 text-violet-700 border-violet-200'
                  }`}>
                    {game.category || 'Social'}
                  </span>
                  <span className="bg-surface-container-high text-outline text-[10px] font-mono px-2 py-0.5 rounded-full border border-outline-variant/30">ID: {game.id}</span>
                </div>
                <h1 className="font-headline-xl text-on-surface leading-none mt-1">{game.title}</h1>
              </div>
            </div>
            <p className="font-body-lg text-secondary flex items-center gap-2 mt-2">
              Developed by {game.studio}
              <BadgeCheck className="text-primary fill-primary/20" size={20} />
            </p>
          </div>
          
          {/* Shield Rating Gauge */}
          <div className="flex items-center gap-6 bg-white p-6 rounded-2xl shadow-xl shadow-primary/5 border border-outline-variant/30">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container-high" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                <circle 
                  className="text-primary transition-all duration-1000 ease-out" 
                  cx="64" cy="64" fill="transparent" r="58" 
                  stroke="currentColor" 
                  strokeDasharray="364.4" 
                  strokeDashoffset={364.4 - (364.4 * (game.shieldScore || 0)) / 100} 
                  strokeLinecap="round" 
                  strokeWidth="8"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-headline-xl text-on-surface">{Math.round(game.shieldScore || 0)}%</span>
                <span className="text-[9px] font-label-bold text-secondary uppercase tracking-widest text-center">Safety<br/>Score</span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-primary font-headline-md">{game.shieldScore >= 90 ? 'PLATINUM' : game.shieldScore >= 80 ? 'GOLD' : 'SILVER'}</div>
              <div className="text-on-surface-variant font-label-sm max-w-[120px]">
                {game.status} rating across all protocols.
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
             {/* About Section */}
             <section>
              <h2 className="font-headline-lg text-on-surface mb-4">About Experience</h2>
              <p className="text-on-surface-variant font-body-md leading-relaxed whitespace-pre-wrap">
                {game.description || "No description provided for this experience."}
              </p>
              {game.gameLink && (
                <a 
                  href={game.gameLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 bg-surface-container-high text-primary px-6 py-3 rounded-xl font-label-bold hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  Visit Game Link <ExternalLink size={18} />
                </a>
              )}
            </section>

            {/* Compliance Metrics */}
            <section>
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="font-headline-lg text-on-surface">Compliance Metrics</h2>
                  <p className="text-secondary font-body-md">Quantified security assessment across core pillars</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metrics.map((metric, i) => (
                  <div key={i} className="bg-white border border-secondary-container p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg hover:shadow-primary/5 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-primary/5 rounded-xl text-primary">{metric.icon}</div>
                      <div className="text-right">
                        <div className="text-headline-md text-on-surface">{metric.value}</div>
                        <div className="flex gap-0.5 mt-1">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} size={12} className={j < metric.stars ? 'fill-primary text-primary' : 'text-outline'} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-label-bold text-on-surface mb-1">{metric.title}</h3>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{metric.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Verified Safety Audits */}
            <section id="safety-audits" className="pt-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-headline-lg text-on-surface">Verified Safety Audits</h2>
                  <p className="text-secondary font-body-md">Detailed security assessments from trusted community members</p>
                </div>
                <span className="bg-primary/10 text-primary px-4 py-1 rounded-full font-label-bold text-sm border border-primary/20">
                  {securityReports.length} Audits
                </span>
              </div>

              <div className="space-y-6">
                {securityReports.length === 0 ? (
                  <div className="bg-surface-container-lowest border border-outline-variant/30 p-12 rounded-3xl text-center">
                    <ShieldCheck size={48} className="mx-auto text-outline/30 mb-4" />
                    <p className="text-outline font-body-md mb-2">No verified audits yet.</p>
                    <button 
                      onClick={() => userProfile ? setShowReportModal(true) : onNavigate('signin')}
                      className="text-primary font-label-bold hover:underline text-sm"
                    >
                      Be the first to perform a security audit
                    </button>
                  </div>
                ) : (
                  securityReports.map((report, index) => (
                    <motion.div 
                      key={report.id || `${report.userId}-${report.createdAt}-${index}`}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border-2 border-primary/10 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative"
                    >
                      <div className="flex flex-col md:flex-row gap-8">
                        <div 
                          className="flex-shrink-0 flex flex-col items-center gap-2 relative"
                          onMouseEnter={() => handleUserMouseEnter(`report-${report.id}`)}
                          onMouseLeave={handleUserMouseLeave}
                        >
                          {hoveredUser === `report-${report.id}` && (
                            <UserProfileCard 
                              userId={report.userId}
                              userName={report.userName} 
                              userPhoto={report.userPhoto} 
                            />
                          )}
                          <UserAvatar 
                            userId={report.userId}
                            robloxId={report.robloxId} // Reports might need to store robloxId too
                            photoURL={report.userPhoto}
                            displayName={report.userName}
                            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/10 hover:ring-primary transition-all cursor-help" 
                          />
                          <div className="text-center">
                            <div className="font-label-bold text-[13px] text-on-surface">{report.userName}</div>
                            <div className="text-[10px] text-primary font-black uppercase tracking-tighter">Verified Auditor</div>
                          </div>
                        </div>
                        
                        <div className="flex-grow space-y-4">
                          <div className="flex flex-wrap items-center gap-6">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-outline font-black uppercase mb-1">Overall</span>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} className={i < report.overallRating ? 'fill-primary text-primary' : 'text-outline'} />
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-outline font-black uppercase mb-1">Chat Filter</span>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-24 bg-surface-container rounded-full overflow-hidden">
                                  <div className="h-full bg-secondary" style={{ width: `${(report.chatSafety / 5) * 100}%` }} />
                                </div>
                                <span className="text-[11px] font-label-bold text-on-surface">{report.chatSafety}/5</span>
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-outline font-black uppercase mb-1">Account Sec</span>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-24 bg-surface-container rounded-full overflow-hidden">
                                  <div className="h-full bg-primary" style={{ width: `${(report.accountSecurity / 5) * 100}%` }} />
                                </div>
                                <span className="text-[11px] font-label-bold text-on-surface">{report.accountSecurity}/5</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="relative">
                            <MessageSquare size={20} className="absolute -left-1 -top-1 text-primary/10 -z-0" />
                            <p className="text-on-surface-variant font-body-md leading-relaxed relative z-10 pl-6">
                              "{report.description}"
                            </p>
                          </div>
                          
                          <div className="text-[10px] text-outline italic">
                            Audit performed on {report.createdAt?.toDate ? new Date(report.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                          </div>
                        </div>
                        
                        <div className="absolute top-6 right-6">
                          <div className="bg-primary/5 text-primary px-3 py-1 rounded-lg flex items-center gap-1.5 border border-primary/10">
                            <ShieldCheck size={16} />
                            <span className="text-xs font-label-bold">VERIFIED AUDIT</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            {/* Community Comments */}
            <section id="community-comments" className="pt-8 border-t border-outline-variant/30">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-headline-lg text-on-surface">Community Comments</h2>
                  <p className="text-secondary font-body-md">Feedback and observations from the community</p>
                </div>
                <span className="bg-surface-container-high text-on-surface px-4 py-1 rounded-full font-label-bold text-sm">
                  {reviews.length} Comments
                </span>
              </div>

              {/* Comment Input */}
              {userProfile ? (
                <div className="bg-white border border-outline-variant p-6 rounded-2xl mb-10">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {userProfile?.photoURL ? (
                        <img src={userProfile?.photoURL} className="w-10 h-10 rounded-full object-cover" alt="User" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <UserCircle size={24} />
                        </div>
                      )}
                    </div>
                    <form onSubmit={handleSubmitReview} className="flex-grow space-y-4">
                      <textarea 
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        placeholder="Add a comment about this experience..."
                        className="w-full bg-surface-container-lowest border border-outline rounded-xl p-4 font-body-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none min-h-[80px]"
                      />
                      <div className="flex justify-end">
                        <button 
                          disabled={submitting || !newReview.trim()}
                          className="bg-surface-container-high text-on-surface-variant px-6 py-2 rounded-xl font-label-bold flex items-center gap-2 hover:bg-surface-container-highest transition-all disabled:opacity-50"
                        >
                          {submitting ? <Loader2 className="animate-spin" size={18} /> : <>Post Comment <Send size={16} /></>}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-primary/5 border border-primary/10 p-8 rounded-3xl text-center mb-10">
                  <p className="font-body-md text-on-surface-variant mb-4">You must be signed in to join the conversation.</p>
                  <button 
                    onClick={() => onNavigate('signin')}
                    className="bg-primary text-white px-8 py-3 rounded-xl font-label-bold shadow-lg shadow-primary/20"
                  >
                    Sign In to Comment
                  </button>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-12 text-outline font-body-md">
                    No comments yet. Start the discussion!
                  </div>
                ) : (
                  reviews.map((review, index) => (
                    <motion.div 
                      key={review.id || `${review.userId}-${review.createdAt}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-outline-variant/30 p-6 rounded-2xl group relative"
                    >
                      <div className="flex gap-4">
                        <div 
                          className="flex-shrink-0 relative"
                          onMouseEnter={() => handleUserMouseEnter(`review-${review.id}`)}
                          onMouseLeave={handleUserMouseLeave}
                        >
                          {hoveredUser === `review-${review.id}` && (
                            <UserProfileCard 
                              userId={review.userId}
                              userName={review.userName} 
                              userPhoto={review.userPhoto} 
                            />
                          )}
                          <UserAvatar 
                            userId={review.userId}
                            robloxId={review.robloxId}
                            photoURL={review.userPhoto}
                            displayName={review.userName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent hover:ring-primary/20 transition-all cursor-help" 
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-label-bold text-on-surface">{review.userName}</span>
                              <span className="w-1 h-1 bg-outline rounded-full" />
                              <span className="text-[10px] text-outline uppercase font-black tracking-wider">
                                {review.createdAt?.toDate ? new Date(review.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                              </span>
                            </div>
                          </div>
                          <p className="text-on-surface-variant font-body-md leading-relaxed">
                            {review.text}
                          </p>
                        </div>
                      </div>
                      
                      {userProfile?.uid === review.userId && (
                        <button 
                          onClick={() => handleDeleteReview(review.id)}
                          className="absolute top-4 right-4 p-2 text-outline hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-secondary-container/30 p-8 rounded-3xl space-y-6">
              <h3 className="font-headline-md text-on-secondary-container">Safety Verdict</h3>
              <p className="text-on-secondary-container text-sm leading-relaxed opacity-80">
                {game.title} has undergone our {game.status} process. Based on current data, it maintains a {Math.round(game.shieldScore)}% safety rating.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-secondary-container pb-2 text-[10px] font-label-bold uppercase text-secondary">
                  <span>Age Group</span>
                  <span className="text-on-surface">{game.ageGroup || 'Everyone'}</span>
                </div>
                <div className="flex items-center justify-between border-b border-secondary-container pb-2 text-[10px] font-label-bold uppercase text-secondary">
                  <span>Rating</span>
                  <span className="text-on-surface">{game.rating || 0} / 5</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-label-bold uppercase text-secondary">
                  <span>Last Audit</span>
                  <span className="text-on-surface">{new Date(game.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (!userProfile) {
                    onNavigate('signin');
                  } else {
                    setShowReportModal(true);
                  }
                }}
                className="w-full bg-primary text-white py-4 rounded-xl font-label-bold mt-4 shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
              >
                Submit a Security Report
              </button>
            </div>
          </div>
        </div>

        {/* Security Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-on-surface/60 backdrop-blur-md"
              onClick={() => setShowReportModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-xl bg-white rounded-3xl p-8 shadow-2xl border border-outline-variant/30 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <ShieldCheck size={28} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-headline-lg text-on-surface">Security Audit</h2>
                    <p className="text-on-surface-variant text-sm">Detailed safety report for parents</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-label-bold text-on-surface">Chat Safety & Filter</label>
                    <p className="text-xs text-outline mb-2">How effective is the chat monitoring?</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button 
                          key={s} type="button" 
                          onClick={() => setReportForm({...reportForm, chatSafety: s})}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${reportForm.chatSafety >= s ? 'bg-primary text-white' : 'bg-surface-container text-outline'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-label-bold text-on-surface">Account Protection</label>
                    <p className="text-xs text-outline mb-2">Are there risky monetization tactics?</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button 
                          key={s} type="button" 
                          onClick={() => setReportForm({...reportForm, accountSecurity: s})}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${reportForm.accountSecurity >= s ? 'bg-primary text-white' : 'bg-surface-container text-outline'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-label-bold text-on-surface">Overall Safety Verification</label>
                  <div className="flex items-center gap-4">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button 
                        key={s} type="button" 
                        onClick={() => setReportForm({...reportForm, overallRating: s})}
                        className="group"
                      >
                        <Star 
                          size={28} 
                          className={s <= reportForm.overallRating ? 'fill-primary text-primary' : 'text-outline group-hover:text-primary/40'} 
                        />
                      </button>
                    ))}
                    <span className="text-sm font-label-bold text-primary ml-2">Verified Rank: {reportForm.overallRating}/5</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-label-bold text-on-surface">Detailed Observations</label>
                  <textarea 
                    required
                    value={reportForm.description}
                    onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                    placeholder="Describe specific safety features or concerns..."
                    className="w-full bg-surface-container-lowest border border-outline rounded-2xl p-4 font-body-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[120px] resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitting || !reportForm.description.trim()}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-headline-md shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <>Submit Security Report <CheckCircle2 size={20} /></>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
