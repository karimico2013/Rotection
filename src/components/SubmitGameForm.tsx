import { ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface SubmitGameFormProps {
  onCancel: () => void;
}

export function SubmitGameForm({ onCancel }: SubmitGameFormProps) {
  return (
    <div className="py-8 px-4 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ x: -5 }}
            onClick={onCancel}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </motion.button>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-8"
          >
            <div className="text-center mb-8">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-purple-600" />
              </div>
              <h1 className="text-purple-600 mb-3">Submit Your Game</h1>
              <p className="text-gray-700">
                Join the Rotection community and show players your game is safe and fun!
              </p>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-gray-700 mb-2">
                  Game Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="gameName"
                  required
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
                  placeholder="Enter your game's name"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Game URL (Roblox Link) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="gameUrl"
                  required
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
                  placeholder="https://www.roblox.com/games/..."
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Developer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="developerName"
                  required
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
                  placeholder="Your developer name or studio"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
                  >
                    <option value="">Select a category</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Educational">Educational</option>
                    <option value="Simulation">Simulation</option>
                    <option value="Building">Building</option>
                    <option value="Sports">Sports</option>
                    <option value="Puzzle">Puzzle</option>
                    <option value="Role-Playing">Role-Playing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Suggested Age Rating <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="ageRating"
                    required
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
                  >
                    <option value="">Select age rating</option>
                    <option value="5+">5+</option>
                    <option value="6+">6+</option>
                    <option value="7+">7+</option>
                    <option value="8+">8+</option>
                    <option value="9+">9+</option>
                    <option value="10+">10+</option>
                    <option value="13+">13+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Game Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none resize-none"
                  placeholder="Tell us about your game! What makes it fun and safe?"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-600 focus:outline-none"
                  placeholder="your@email.com"
                />
                <p className="text-sm text-gray-500 mt-2">
                  We'll use this to contact you about your submission
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-purple-600 mb-3">Before You Submit</h3>
                <ul className="text-gray-700 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Make sure your game follows Roblox's Community Standards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Your game should be honest about its content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>All players should be treated fairly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>Content should be appropriate for your suggested age rating</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-3 pl-8 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Submit for Review
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
  );
}
