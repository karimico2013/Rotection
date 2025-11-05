import { Shield, Star, Users } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';

interface Game {
  id: string;
  name: string;
  developer: string;
  thumbnail: string;
  safetyScore: number;
  ageRating: string;
  ratings: {
    honesty: number;
    safety: number;
    fairness: number;
    ageAppropriate: number;
  };
  totalRatings: number | 'Staff';
  verified: boolean;
  category: string;
}

interface GameCardProps {
  game: Game;
  onClick: () => void;
}

export function GameCard({ game, onClick }: GameCardProps) {
  const isStaffRated = game.totalRatings === 'Staff';

  const averageRating = (
    (game.ratings.honesty + game.ratings.safety + game.ratings.fairness + game.ratings.ageAppropriate) / 4
  ).toFixed(1);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
    >
      <div className="relative">
        <ImageWithFallback
          src={game.thumbnail}
          alt={game.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
        />
        {game.verified && (
          <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm">
            <Shield className="w-4 h-4" />
            <span>Verified</span>
          </div>
        )}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm ${getScoreColor(game.safetyScore)}`}>
          Safety: {game.safetyScore}%
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-purple-600 mb-1">{game.name}</h3>
            <p className="text-gray-600 text-sm">by {game.developer}</p>
          </div>
          <div className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-sm">
            {game.ageRating}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>{averageRating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {isStaffRated ? (
              <span>Staff</span>
            ) : (
              <span>{typeof game.totalRatings === 'number' ? game.totalRatings.toLocaleString() : game.totalRatings} ratings</span>
            )}
          </div>
        </div>

        <div className="inline-block bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-sm">
          {game.category}
        </div>
      </div>
    </motion.div>
  );
}
