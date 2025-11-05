import { MessageCircle, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface DiscordRedirectProps {
  action: string;
  onBack?: () => void;
}

export function DiscordRedirect({ action, onBack }: DiscordRedirectProps) {
  const handleDiscordClick = () => {
    window.open('https://discord.com', '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-8"
      >
        <div className="text-center">
          <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-12 h-12 text-purple-600" />
          </div>
          
          <h2 className="text-purple-600 mb-4">Join Our Discord!</h2>
          
          <p className="text-gray-700 mb-6">
            To {action}, you need to join the Rotection Discord server first! 
            This is where our community connects and works together to keep games safe.
          </p>

          <div className="bg-purple-50 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-3 text-left mb-3">
              <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-purple-600 mb-1">Why Discord?</h3>
                <p className="text-gray-600 text-sm">
                  Our Discord server is where verified players can rate games, submit their own games, 
                  and report issues. It helps us keep everything safe and organized!
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDiscordClick}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mb-3"
          >
            <MessageCircle className="w-5 h-5" />
            Join Discord Server
            <ArrowRight className="w-5 h-5" />
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="w-full text-gray-600 hover:text-gray-800 transition-colors"
            >
              Go Back
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
