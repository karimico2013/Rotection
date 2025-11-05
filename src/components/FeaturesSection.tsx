import { Shield, Star, Award, Users, Heart, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: 'For Players',
      description: 'Browse verified games, see safety scores, and rate games you\'ve played to help others!'
    },
    {
      icon: Award,
      title: 'For Developers',
      description: 'Submit your game, earn the Rotection Verified badge, and show players you\'re trustworthy!'
    },
    {
      icon: Heart,
      title: 'For Parents',
      description: 'See safety scores and age ratings to make sure games are appropriate for your kids!'
    },
    {
      icon: Star,
      title: 'Community Ratings',
      description: 'Players rate games on honesty, safety, fairness, and age-appropriateness.'
    },
    {
      icon: Shield,
      title: 'Moderator Review',
      description: 'Our team reviews all games and ratings to make sure everything is accurate and fair.'
    },
    {
      icon: Lock,
      title: 'Safety First',
      description: 'Only games that meet our standards get the Rotection Verified badge.'
    }
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-purple-600 mb-4">How Rotection Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We make it easy to find safe games and help developers show they care about player safety.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="text-center"
            >
              <motion.div 
                whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
                className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <feature.icon className="w-8 h-8 text-purple-600" />
              </motion.div>
              <h3 className="mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
