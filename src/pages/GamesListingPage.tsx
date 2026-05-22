import { motion } from 'motion/react';
import { Search, ChevronDown, ShieldCheck, Cpu, Lock, Shield, CheckCircle, ChevronLeft, ChevronRight, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { OperationType } from '../lib/firebase';
import { GoogleGenAI } from '@google/genai';

interface GamesListingPageProps {
  onNavigate: (page: string) => void;
  onGameSelect: (id: string) => void;
  userProfile?: any;
}

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export default function GamesListingPage({ onNavigate, onGameSelect, userProfile }: GamesListingPageProps) {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/games');
        if (response.ok) {
          const data = await response.json();
          setGames(data.filter((game: any) => game.title && game.title.trim() !== ''));
        } else {
          console.error('Failed to fetch games, status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const filteredGames = games.filter(game => 
    game.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.studio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Verified': return <ShieldCheck size={20} />;
      case 'Manual Audit': return <Lock size={20} />;
      case 'Secure Core': return <Shield size={20} />;
      case 'AI Scanned': return <Cpu size={20} />;
      default: return <CheckCircle size={20} />;
    }
  };

  return (
    <main className="flex-grow max-w-7xl mx-auto px-6 py-24">
      {/* Search and Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex flex-1 gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={20} />
            <input 
              className="w-full pl-12 pr-4 py-3 bg-white border border-outline rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none font-body-md text-on-surface" 
              placeholder="Search verified games..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="font-body-md text-outline">Loading verified experiences...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGames.map((game) => (
            <motion.div 
              key={game.id}
              whileHover={{ y: -4 }}
              className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden flex flex-col group transition-all hover:shadow-[0px_4px_20px_rgba(148,15,255,0.08)] cursor-pointer"
              onClick={() => onGameSelect(game.id)}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  src={game.imgUrl} 
                  alt={game.title}
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1 text-white text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md ${
                    game.status === 'Verified' ? 'bg-green-500/90' : 
                    game.status === 'Manual Audit' ? 'bg-blue-500/90' : 'bg-violet-600/90'
                  }`}>
                    {game.status}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-headline-md text-on-surface mb-1 line-clamp-1">{game.title}</h3>
                    <p className="font-label-sm text-outline uppercase tracking-wider line-clamp-1">{game.studio}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-primary">{Math.round(game.shieldScore)}%</span>
                    <span className="text-[10px] font-label-bold text-outline">SHIELD SCORE</span>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">
                      {getStatusIcon(game.status)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`font-label-sm px-2 py-0.5 rounded-md font-bold uppercase text-[9px] tracking-wider ${
                        game.category === 'Action' ? 'bg-red-100 text-red-700' :
                        game.category === 'Adventure' ? 'bg-orange-100 text-orange-700' :
                        game.category === 'RPG' ? 'bg-purple-100 text-purple-700' :
                        game.category === 'Simulation' ? 'bg-blue-100 text-blue-700' :
                        game.category === 'Roleplay' ? 'bg-pink-100 text-pink-700' :
                        game.category === 'Platformer' ? 'bg-green-100 text-green-700' :
                        game.category === 'Shooter' ? 'bg-slate-100 text-slate-700' :
                        'bg-violet-100 text-violet-700'
                      }`}>
                        {game.category || 'Social'}
                      </span>
                      <span className="text-[9px] bg-surface-container px-1.5 py-0.5 rounded text-primary font-bold border border-primary/10">
                        SN: {game.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}
