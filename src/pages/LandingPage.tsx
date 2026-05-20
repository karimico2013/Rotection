import { motion } from 'motion/react';
import { ShieldCheck, Code, Users, ArrowRight, Verified, Star, ChevronsRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { OperationType } from '../lib/firebase';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onGameSelect: (id: string) => void;
  userProfile?: any;
  onSignOut?: () => void;
}

export default function LandingPage({ onNavigate, onGameSelect, userProfile }: LandingPageProps) {
  const [verifiedGames, setVerifiedGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/games');
        const data = await response.json();
        if (response.ok) {
          // Sort by rating desc and take 4
          const topGames = [...data]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4);
          setVerifiedGames(topGames);
        }
      } catch (error) {
        console.error('Error fetching landing games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const fadeInVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative bg-surface-bright overflow-hidden px-6 md:px-12 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 space-y-6"
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-bold text-label-sm">
              <ShieldCheck size={16} className="mr-2" />
              TRUSTED BY 10k+ DEVELOPERS
            </div>
            <h1 className="font-headline-xl text-on-background">
              Play <span className="text-primary">Safe.</span><br />
              Play <span className="text-primary">Fun.</span><br />
              Play <span className="text-primary">Verified.</span>
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-xl">
              Making Roblox safer, one game at a time. Empowering players and developers with real-time safety infrastructure and community-driven insights.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              {userProfile ? (
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="bg-primary text-white px-8 py-4 rounded font-label-bold text-label-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                >
                  Go to Dashboard <ChevronsRight size={18} />
                </button>
              ) : (
                <button 
                  onClick={() => onNavigate('signin')}
                  className="bg-primary text-white px-8 py-4 rounded font-label-bold text-label-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  Get Started
                </button>
              )}
              <button 
                onClick={() => onNavigate('games')}
                className="border-2 border-primary text-primary px-8 py-4 rounded font-label-bold text-label-bold hover:bg-primary/5 active:scale-95 transition-all"
              >
                Explore Ratings
              </button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 w-full relative"
          >
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl border border-outline-variant bg-white">
              <img 
                alt="Dashboard preview" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida/ADBb0ujlTl6sLDVRQ-jgErH2wcQkzvDVKMeFC-_cOXAZusEOIkR0KAt1ao1JyafGtb9eR3fHBsMA3eOrLkrQ2Vfjd_XJpHqUSmvOrD7Dvko4TJncB0WlqaNfNX6NVsS2k5t1vrKVxkOvLW_OebNmpLliDxsrYHIxC18BR4FJdk0dLBOExjYBhSHqtXluVQs7UdjftMHg3tMZ--ztXeHXgyfuTZsg6sGq21SJFcyw-AAOpyYbJyXv6jSRzHyO1QKa8cpHyxTbEq_JK-A" 
              />
            </div>
            {/* Floating Shield Metric */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-indigo-50 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck size={32} />
              </div>
              <div>
                <div className="text-label-sm font-label-bold text-outline">Global Safety Score</div>
                <div className="text-headline-md font-headline-md text-primary">98.2</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto"
        >
          <motion.div variants={fadeInVariant} className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="font-headline-lg text-on-background mb-4">A Robust Shield for Your Digital Experience</h2>
            <p className="font-body-md text-on-surface-variant">We combine machine learning with community governance to create a transparent, accountable ecosystem for millions of players.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <motion.div variants={fadeInVariant} className="md:col-span-8 bg-surface-container-low rounded-xl p-8 border border-outline-variant flex flex-col md:flex-row gap-8 items-center group hover:border-primary/40 transition-colors">
              <div className="flex-1 order-2 md:order-1">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary mb-6 shadow-sm">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-headline-md text-on-background mb-3">Safety Ratings</h3>
                <p className="font-body-md text-on-surface-variant">Our proprietary Shield Score uses over 50 data points to evaluate game safety, focusing on content moderation, economy stability, and player reporting history.</p>
              </div>
              <div className="flex-1 order-1 md:order-2 w-full">
                <img 
                  alt="Metrics" 
                  className="rounded-lg shadow-md w-full h-48 object-cover group-hover:scale-[1.02] transition-all" 
                  src="https://lh3.googleusercontent.com/aida/ADBb0uiLil3uGUvwYLOo7GOvLLaeLZ0OBHscDpJ0tSM-PVMnzWYu0c0sfggSqpXOVnzzKa_60-jUAWUEWgbWFo201YNUBGSpoNOvo6z8_3PnaEugALckVEeg0Gzsor4Sgb6TDydeI6BEuHaTVHfTKDmBHkZSsITXbMQLUcg2qXbjeuVvWzjXtdbhGCzLHLCu44hSs0hgXCrmrma86wG7cSqL4xLA64m0_e4VJLo4dNCa1yAdCYVlviMlLimoGjumzBhw4fmc5Y96d-lo" 
                />
              </div>
            </motion.div>
            <motion.div variants={fadeInVariant} className="md:col-span-4 bg-primary text-white rounded-xl p-8 border border-primary relative overflow-hidden group">
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-white mb-6">
                  <Code size={24} />
                </div>
                <h3 className="font-headline-md mb-3">Developer SDK</h3>
                <p className="font-body-md opacity-90 mb-8">Integrate our safety API directly into your workflow to automate reporting and protect your community seamlessly.</p>
                <a className="mt-auto font-label-bold inline-flex items-center hover:translate-x-2 transition-transform" href="#">
                  View Docs <ArrowRight size={16} className="ml-2" />
                </a>
              </div>
              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
            </motion.div>
            <motion.div variants={fadeInVariant} className="md:col-span-4 bg-surface-container-low rounded-xl p-8 border border-outline-variant hover:border-primary/40 transition-colors">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary mb-6 shadow-sm">
                <Users size={24} />
              </div>
              <h3 className="font-headline-md text-on-background mb-3">Community Insights</h3>
              <p className="font-body-md text-on-surface-variant">Verified reports from trusted community members provide the context that algorithms might miss, ensuring human-centric safety.</p>
            </motion.div>
            <motion.div variants={fadeInVariant} className="md:col-span-8 bg-surface-bright rounded-xl border border-outline-variant overflow-hidden flex flex-col md:flex-row items-center">
              <div className="flex-1 p-8">
                <h3 className="font-headline-md text-on-background mb-3">Military-Grade Infrastructure</h3>
                <p className="font-body-md text-on-surface-variant">Built on top of a global edge network to ensure 99.9% uptime for critical safety checks and moderation tasks.</p>
              </div>
              <div className="flex-1 w-full h-full min-h-[200px]">
                <img 
                  alt="Infrastructure" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida/ADBb0uhVNeh5ECBMJ9EOzdMvcPU-gsM4sUCOYq1xvA5GOYnEfHy4K-phY08V3hfIcXWagioYF9J5_uoPNclc9eBycUfeEf7ST7Wa3Pi4pFcWqLjZNg2_nv7ZUYfJnalfZkvLZ5KIKrKZzsv4BMrIT7bdnWs2t-pvGuC8V56FW8R7zgXx8kCQ5oFcX6nogaqldHnrxZvpoC8qVDQapNJn5vRCdnJ-raFQ03954r6YLcYzov2ovtTaFRxRE3dTqhUIaOshQOfhHpzXWeUf" 
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Recently Verified Games */}
      <section className="py-24 px-6 md:px-12 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-headline-lg text-on-background">Recently Verified Games</h2>
              <p className="font-body-md text-on-surface-variant">Check out the latest experiences that have passed our rigorous security audit.</p>
            </div>
            <button 
              onClick={() => onNavigate('games')}
              className="hidden md:flex font-label-bold text-primary items-center gap-2 hover:underline"
            >
              View All Verified <ChevronsRight size={16} />
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {verifiedGames.map((game, i) => (
                <motion.div 
                  key={game.id || `game-${i}`}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl overflow-hidden border border-outline-variant group hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer"
                  onClick={() => onGameSelect(game.id)}
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img 
                      alt={game.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      src={game.imgUrl || 'https://lh3.googleusercontent.com/aida/ADBb0uhEKq1fA2kLEcpUxHE45xL92Wn7NKqm406deFYLZ18WwB30giUdsgc7_aEoR8tKGi3zsZy9hxDo1ksUB1D9lR0NnokX9EpszH_kl9Cib-SmnmVvIS-LGfdAhM_vNhG-AFNQuODAKtezSukRVY_PCdJoCoFd29rKcx6jc4OMFC5CzsuVjJiz8fIJvlcRZNEW7BlBBj6fkLaxYHoeN58_44rgi7gApnx737-5rtgN8ftcutYcQIugxXXe-o7znshyJY92UIjrnTU-'} 
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-label-sm font-label-bold flex items-center shadow-sm">
                        <ShieldCheck size={14} className="mr-1" />
                        {game.status?.toUpperCase() || 'SECURE'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-label-sm font-label-bold text-primary mb-1">{game.category || 'EXPERIENCE'}</div>
                    <h4 className="font-headline-md text-on-surface mb-2 line-clamp-1">{game.title}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-label-bold">{game.rating || 0}</span>
                      </div>
                      <div className="text-on-surface-variant font-label-sm">{game.shieldScore}% Shield</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto rounded-2xl p-12 lg:p-20 relative overflow-hidden text-center md:text-left bg-custom-dark">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="font-headline-xl text-white mb-6">Ready to make your game safer?</h2>
              <p className="font-body-lg text-indigo-200 mb-8 max-w-xl">Join the thousands of developers already using Rotection's SDK to build trust with their communities and scale their experiences safely.</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button 
                  onClick={() => onNavigate('signin')}
                  className="bg-primary text-white px-8 py-4 rounded font-label-bold text-label-bold hover:opacity-90 transition-all shadow-xl shadow-primary/40"
                >
                  Get Started Now
                </button>
                <button className="border border-indigo-400 text-white px-8 py-4 rounded font-label-bold text-label-bold hover:bg-white/10 transition-all">
                  Talk to Sales
                </button>
              </div>
            </div>
            <div className="flex-1 hidden md:flex justify-center">
              <div className="w-64 h-64 border-8 border-primary/20 rounded-full flex items-center justify-center animate-pulse">
                <ShieldCheck size={120} className="text-primary" />
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
      </section>
    </div>
  );
}
