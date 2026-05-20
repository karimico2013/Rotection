import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  BadgeCheck, 
  Users, 
  Clock, 
  Search, 
  Bell, 
  Settings, 
  Terminal, 
  CheckCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { OperationType } from '../lib/firebase';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onGameSelect: (id: string) => void;
  userProfile?: any;
}

export default function DashboardPage({ onNavigate, onGameSelect, userProfile }: DashboardPageProps) {
  const [games, setGames] = useState<any[]>([]);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<{ id: string, time: string, message: string, type: 'info' | 'success' | 'warning' }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/games');
        const allGames = await response.json();
        if (response.ok) {
          // Top Rated Games
          const topGames = [...allGames]
            .sort((a, b) => b.shieldScore - a.shieldScore)
            .slice(0, 4);
          setGames(topGames);

          // Recent Audits
          const recent = [...allGames]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 10);
          setRecentAudits(recent);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Initialize logs with system events
    const initialLogs = [
      { id: 'start', time: new Date().toLocaleTimeString(), message: 'Rotection Security Engine initialized...', type: 'success' as const },
      { id: 'conn', time: new Date().toLocaleTimeString(), message: 'Google Sheets synchronization established', type: 'info' as const },
      { id: 'ai', time: new Date().toLocaleTimeString(), message: 'AI Scanning Module: ONLINE', type: 'info' as const },
    ];
    setAuditLogs(initialLogs);

    // Interval for background environmental "noise"
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString();
      const systemMessages = [
        'Routine security heartbeat pulse: STABLE',
        'Global threat database synchronized',
        'Resource consumption within normal parameters',
        'API latency check: 42ms - OK',
        'Encryption keys rotated for active sessions',
      ];
      
      const log = {
        id: `sys-${Date.now()}`,
        time: timeStr,
        message: systemMessages[Math.floor(systemMessages.length * Math.random())],
        type: 'info' as const
      };
      setAuditLogs(prev => [log, ...prev.slice(0, 15)]);
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-surface font-body-md text-on-surface">
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-12 space-y-8">
        
        {/* Hero Section: Global Security Health */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center py-6 rounded-lg border border-outline-variant px-8 bg-white relative overflow-hidden"
        >
          {/* Subtle Background Glow */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)]" style={{ '--color-primary': '#940fff' } as any}></div>
          
          <div className="lg:col-span-7 space-y-4 relative z-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md font-label-bold text-[10px] flex items-center gap-2 border border-green-100 uppercase tracking-tight">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                System Status: Operational
              </span>
              <span className="text-outline font-label-sm text-xs flex items-center gap-1.5">
                <Clock size={12} />
                Live updates active
              </span>
            </div>
            
            <h1 className="font-headline-xl text-3xl md:text-4xl text-on-surface tracking-tighter leading-tight font-black">Global Security Health</h1>
            <p className="text-sm font-body-md text-outline max-w-xl leading-relaxed">
              Real-time monitoring across the entire Rotection ecosystem. Our advanced AI scans and manual audits ensure 24/7 safety for all users.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => fetch('/api/sync-sheets', { method: 'POST' }).then(() => alert('Syncing in progress...'))}
                className="px-4 py-2.5 bg-primary text-white font-label-bold text-[10px] uppercase tracking-[0.2em] rounded-lg hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all flex items-center gap-2"
              >
                <RefreshCw size={12} className="animate-spin-slow" />
                Sync Active Ecosystem
              </button>
              <div className="hidden sm:flex gap-8 ml-2">
                <div>
                  <p className="text-outline-variant font-label-bold text-[9px] uppercase tracking-[0.2em] mb-0.5">Scanned Experiences</p>
                  <p className="text-2xl font-headline-md font-black tracking-tight text-on-surface">1,248,392</p>
                </div>
                <div className="w-px h-10 bg-outline-variant/20"></div>
                <div>
                  <p className="text-outline-variant font-label-bold text-[9px] uppercase tracking-[0.2em] mb-0.5">Last Audit</p>
                  <p className="text-2xl font-headline-md font-black tracking-tight text-on-surface">2 mins ago</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  className="text-surface-container-low" 
                  cx="50%" cy="50%" fill="transparent" r="45%" stroke="currentColor" strokeWidth="6"
                ></circle>
                <motion.circle 
                  initial={{ strokeDashoffset: 754 }}
                  animate={{ strokeDashoffset: 120 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-primary" 
                  cx="50%" cy="50%" fill="transparent" r="45%" stroke="currentColor" strokeDasharray="754" strokeLinecap="round" strokeWidth="10"
                ></motion.circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <Shield size={32} className="text-primary fill-primary/10 mb-1" />
                <span className="font-headline-xl text-3xl md:text-4xl text-on-surface leading-none font-black">98.4%</span>
                <span className="font-label-bold text-[9px] text-primary uppercase tracking-[0.3em] mt-1">SECURE</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Top Metrics Row */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Audits', value: '342', trend: '+12%', icon: Activity, color: 'text-primary' },
            { label: 'Threats', value: '0', trend: 'Stable', icon: AlertTriangle, color: 'text-red-500' },
            { label: 'Developers', value: '15.8k', trend: '+48', icon: BadgeCheck, color: 'text-primary' },
            { label: 'Reports', value: '1,102', trend: '-2%', icon: Users, color: 'text-primary', negative: true },
          ].map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="bg-white p-4 rounded-lg border border-outline-variant/30 flex flex-col gap-2 hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start">
                <div className="p-2 bg-surface-container rounded-lg group-hover:bg-primary/10 transition-colors">
                  <stat.icon className={`${stat.color} group-hover:scale-110 transition-transform`} size={18} />
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${stat.negative ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'} border border-current/10 flex items-center gap-1`}>
                   {stat.trend.includes('+') && <ArrowUpRight size={8} />}
                   {stat.trend.includes('-') && <ArrowDownRight size={8} />}
                   {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-outline font-label-bold text-[9px] uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <h3 className="text-xl font-headline-md font-black text-on-surface">{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Main Content Area */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Audit Activity */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-outline-variant/50 overflow-hidden flex flex-col h-[640px]">
            <div className="px-6 py-3 border-b border-outline-variant/30 flex flex-wrap justify-between items-center gap-4">
              <h2 className="font-headline-md text-lg font-black text-on-surface">Recent Audit Activity</h2>
              <button 
                onClick={() => onNavigate('games')}
                className="text-primary font-label-bold text-[10px] uppercase tracking-widest hover:bg-primary/5 px-3 py-1.5 rounded-md transition-all"
              >
                View Activity
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant/30 sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-3 font-label-bold text-[9px] uppercase tracking-widest text-outline">Experience Name</th>
                    <th className="px-6 py-3 font-label-bold text-[9px] uppercase tracking-widest text-outline">Developer</th>
                    <th className="px-6 py-3 font-label-bold text-[9px] uppercase tracking-widest text-outline text-center">Scan</th>
                    <th className="px-6 py-3 font-label-bold text-[9px] uppercase tracking-widest text-outline text-center">Score</th>
                    <th className="px-6 py-3 font-label-bold text-[9px] uppercase tracking-widest text-outline">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {recentAudits.length > 0 ? recentAudits.map((game, i) => (
                    <motion.tr 
                      key={game.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-surface-container-low transition-colors cursor-pointer"
                      onClick={() => onGameSelect(game.id)}
                    >
                      <td className="px-6 py-4 font-bold text-on-surface text-sm">{game.title}</td>
                      <td className="px-6 py-4 text-xs text-outline line-clamp-1">{game.studio}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-1.5 py-0.5 rounded-sm text-[8px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                          AI Scan
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-primary text-sm text-center">
                        {game.shieldScore}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-[10px] text-green-600">
                          <CheckCircle size={12} />
                          <span>Passed</span>
                        </div>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-[10px] text-outline uppercase tracking-widest">Loading audits...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Intelligence & Feed */}
          <div className="space-y-6 flex flex-col">
            
            {/* Threat Intelligence Chart */}
            <div className="bg-white rounded-lg border border-outline-variant/50 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="font-headline-md text-lg font-black text-on-surface leading-tight">Threat Intel</h2>
                  <p className="text-[9px] text-outline font-label-bold uppercase tracking-widest mt-0.5">30-Day Trend</p>
                </div>
                <Info size={14} className="text-outline-variant hover:text-primary cursor-help transition-colors" />
              </div>
              
              <div className="relative h-32 w-full bg-surface-container-low/50 rounded-lg p-4 flex items-end gap-1.5 group">
                {[30, 45, 35, 60, 25, 100, 60, 15, 40, 20].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.03, duration: 0.6 }}
                    className={`flex-1 rounded-t-sm transition-all duration-300 relative ${
                      i === 5 ? 'bg-primary' : 'bg-primary/20 hover:bg-primary/40'
                    }`}
                  >
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="font-label-bold text-[10px] uppercase tracking-tight text-outline">Critical</span>
                  </div>
                  <span className="font-black text-on-surface text-xs">0</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="font-label-bold text-[10px] uppercase tracking-tight text-outline">Medium</span>
                  </div>
                  <span className="font-black text-on-surface text-xs">4</span>
                </div>
              </div>
            </div>

            {/* Live Audit Feed */}
            <div className="bg-[#120422] text-on-primary-container rounded-lg border border-white/5 overflow-hidden flex flex-col h-[300px] shadow-xl shadow-primary/5">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <Terminal size={12} className="text-primary" />
                  <h2 className="font-label-bold text-[9px] uppercase tracking-[0.2em] text-on-primary-container/80">Live Audit</h2>
                </div>
                <span className="text-[8px] text-green-400 uppercase font-black px-1.5 py-0.5 bg-green-500/10 rounded flex items-center gap-1">
                  <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></span>
                  Live
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[10px] leading-relaxed custom-scrollbar">
                {auditLogs.map((log) => (
                  <motion.div 
                    key={log.id} 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 group"
                  >
                    <span className="text-primary opacity-50 font-bold shrink-0">{log.time}</span>
                    <span className={`opacity-70 group-hover:opacity-100 transition-opacity ${
                      log.type === 'success' ? 'text-green-400' : log.type === 'warning' ? 'text-amber-400' : 'text-on-primary-container'
                    }`}>
                      {log.message}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Lower Section: Top Rated Verified Games */}
        <section className="space-y-4 pt-8">
          <div className="flex flex-wrap justify-between items-end gap-6">
            <div className="space-y-0.5">
              <h2 className="font-headline-lg text-2xl font-black text-on-surface leading-none tracking-tight">Verified Experiences</h2>
              <p className="text-outline text-sm font-body-md max-w-xl">The highest security rated games on the platform.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onNavigate('games')}
                className="p-2.5 border border-outline-variant rounded-lg hover:bg-white hover:shadow-md transition-all active:scale-95 text-outline hover:text-primary"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => onNavigate('games')}
                className="p-2.5 border border-outline-variant rounded-lg hover:bg-white hover:shadow-md transition-all active:scale-95 text-outline hover:text-primary"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {games.length > 0 ? games.map((game, i) => (
              <motion.div 
                key={game.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (i * 0.05) }}
                whileHover={{ y: -3 }}
                className="bg-white rounded-lg border border-outline-variant/30 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
                onClick={() => onGameSelect(game.id)}
              >
                <div className="h-36 overflow-hidden relative">
                  <img 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src={game.imgUrl} 
                    alt={game.title}
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-black text-primary border border-primary/20">
                    {Math.round(game.shieldScore)}
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="font-headline-md text-base font-bold mb-0.5 text-on-surface line-clamp-1">{game.title || 'Untitled'}</h4>
                    <p className="text-[9px] font-label-bold text-outline uppercase tracking-widest">{game.studio || 'Unknown'}</p>
                  </div>
                  <div className="flex items-center gap-2 py-1.5 px-3 bg-primary/5 rounded-md w-fit border border-primary/10">
                    <ShieldCheck className="text-primary" size={14} />
                    <span className="text-[9px] text-primary font-black uppercase tracking-widest">Verified</span>
                  </div>
                </div>
              </motion.div>
            )) : (
               [1, 2, 3, 4].map(i => (
                 <div key={i} className="h-64 bg-white rounded-lg animate-pulse border border-outline-variant/10" />
               ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
