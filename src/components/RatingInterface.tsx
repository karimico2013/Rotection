import { X, Star } from 'lucide-react';
import { DiscordRedirect } from './DiscordRedirect';
import { motion } from 'motion/react';

interface RatingInterfaceProps {
  gameName: string;
  onClose: () => void;
  onSubmit: () => void;
}

export function RatingInterface({ gameName, onClose, onSubmit }: RatingInterfaceProps) {
  const StarRating = ({ 
    label, 
    description 
  }: { 
    label: string; 
    description: string;
  }) => (
    <div className="mb-6">
      <h3 className="mb-1">{label}</h3>
      <p className="text-gray-600 text-sm mb-3">{description}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(value => (
          <motion.button
            key={value}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="transition-all"
          >
            <Star className="w-8 h-8 text-gray-300" />
          </motion.button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
            <h2 className="text-purple-600">Rate {gameName}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-700 mb-6">
              Help other players by sharing your honest opinion about this game!
            </p>

            <StarRating
              label="Honesty"
              description="Does the game accurately represent its content and gameplay?"
            />

            <StarRating
              label="Safety"
              description="Is the game safe and appropriate for players?"
            />

            <StarRating
              label="Fairness"
              description="Does the game treat all players fairly?"
            />

            <StarRating
              label="Age-Appropriate"
              description="Is the content appropriate for the game's age rating?"
            />

            <div className="mb-6">
              <h3 className="mb-2">Additional Feedback (Optional)</h3>
              <textarea
                placeholder="Share any other thoughts about this game..."
                className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <button
                disabled
                className="flex-1 py-3 pl-8 rounded-lg transition-colors bg-gray-300 text-gray-500 cursor-not-allowed"
              >
                Submit Rating
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-3 text-center">
              Please rate all categories before submitting
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Discord Redirect Overlay */}
      <DiscordRedirect action="rate this game" onBack={onClose} />
    </>
  );
}
