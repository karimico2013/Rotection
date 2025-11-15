import { useState, useEffect } from 'react';
import { Shield, Search, Users, CheckCircle } from 'lucide-react';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { GameCard } from './components/GameCard';
import { GameDetails } from './components/GameDetails';
import { FeaturesSection } from './components/FeaturesSection';
import { DiscordRedirect } from './components/DiscordRedirect';
import { SubmitGameForm } from './components/SubmitGameForm';

import { motion, AnimatePresence } from 'motion/react';

type Game = {
  id: string;
  name: string;
  developer: string;
  description: string;
  ageGroup: string;
  category: string;
  link: string;
  ratings: {
    honesty: number;
    safety: number;
    fairness: number;
    ageAppropriate: number;
  };
};

type View = 'home' | 'browse' | 'submit' | 'game-details';

export default function App() {
  const [verifiedGames, setVerifiedGames] = useState<Game[]>([]);
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmitDiscord, setShowSubmitDiscord] = useState(false);

  // Fetch from Sheets CSV
  useEffect(() => {
    fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vQdMlcR44cKlhuBXWvwsKGEhwg5Mdx6yuVPGjjcuFIvVM0h4r1FGbp9uyXuCpzoqYomZQsmjrgo02WD/pub?output=csv")
      .then(res => res.text())
      .then(csv => {
        const rows = csv.split("\n").slice(1);

        const games = rows
          .filter(r => r.trim() !== "")
          .map((row, i) => {
            const cols = row.split(",");

            return {
              id: i.toString(),
              name: cols[0],
              developer: cols[1],
              description: cols[2],
              ageGroup: cols[3],
              category: cols[4],
              link: cols[5],
              ratings: {
                honesty: Number(cols[6]) || 0,
                safety: Number(cols[7]) || 0,
                fairness: Number(cols[8]) || 0,
                ageAppropriate: Number(cols[9]) || 0,
              },
            };
          });

        setVerifiedGames(games);
      })
      .catch(err => console.error("Failed to load games:", err));
  }, []);

  const filteredGames = verifiedGames.filter(game =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
    setCurrentView('game-details');
  };

  const handleBackToBrowse = () => {
    setSelectedGame(null);
    setCurrentView('browse');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <Header 
        currentView={currentView}
        onNavigate={setCurrentView}
        onSubmitGame={() => setShowSubmitDiscord(true)}
      />

      <AnimatePresence mode="wait">
        {/* HOME VIEW */}
        {currentView === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Hero onGetStarted={() => setCurrentView('browse')} />
            <FeaturesSection />

            {/* Featured Games */}
            <section className="py-16 px-4">
              <div className="max-w-7xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="mb-12"
                >
                  <h2 className="text-purple-600 mb-4">
                    <Shield className="inline-block w-10 h-10 mr-2" />
                    Featured Safe Games
                  </h2>
                  <p className="text-gray-600">
                    These games have been verified by Rotection and loved by players like you!
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {verifiedGames.slice(0, 3).map((game, index) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <GameCard game={game} onClick={() => handleGameClick(game)} />
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView('browse')}
                  className="bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700"
                >
                  Browse All Verified Games
                </motion.button>
              </div>
            </section>

            {/* For Parents */}
            <section className="py-16 px-4 bg-purple-100 text-center">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-purple-600 mb-4">For Parents</h2>
                <p className="text-gray-700 mb-6">
                  Rotection helps you make sure your kids are playing safe, honest, and age-appropriate games.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: Shield, title: 'Safety First', description: 'All verified games meet our strict safety standards' },
                    { icon: CheckCircle, title: 'Age Ratings', description: 'Clear age ratings help you choose the right games' },
                    { icon: Users, title: 'Community Reviews', description: 'Real players share honest feedback' },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.15, duration: 0.5 }}
                      whileHover={{ y: -5 }}
                      className="bg-white p-6 rounded-lg"
                    >
                      <item.icon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {/* BROWSE VIEW */}
        {currentView === 'browse' && (
          <motion.section
            key="browse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="py-12 px-4 min-h-screen"
          >
            <div className="max-w-7xl mx-auto">
              <h1 className="text-purple-600 mb-4">Browse Verified Games</h1>

              <div className="relative max-w-2xl mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search games, developers, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-purple-200 focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredGames.map((game, index) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      layout
                    >
                      <GameCard game={game} onClick={() => handleGameClick(game)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredGames.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No games found matching your search.
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* GAME DETAILS */}
        {currentView === 'game-details' && selectedGame && (
          <motion.div
            key="game-details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GameDetails game={selectedGame} onBack={handleBackToBrowse} />
          </motion.div>
        )}

        {/* SUBMIT */}
        {currentView === 'submit' && (
          <motion.div
            key="submit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SubmitGameForm onCancel={() => setCurrentView('home')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="bg-purple-900 text-white py-8 px-4 text-center">
        <div className="flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 mr-2" />
          <span className="text-xl">Rotection</span>
        </div>

        <p className="text-purple-200 mb-4">
          Making Roblox safer, one verified game at a time.
        </p>

        <p className="text-purple-300 text-sm">
          © 2025 Rotection. Helping players find safe and fun games.
        </p>
      </footer>

      {showSubmitDiscord && (
        <DiscordRedirect 
          action="submit your game"
          onBack={() => setShowSubmitDiscord(false)}
        />
      )}
    </div>
  );
}
