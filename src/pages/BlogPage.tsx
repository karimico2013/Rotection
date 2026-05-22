import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  User, 
  Clock, 
  Filter, 
  CheckCircle2, 
  ShieldCheck, 
  Cpu, 
  Mail, 
  ArrowRight,
  Globe,
  BarChart3,
  Terminal,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { OperationType } from '../lib/firebase';

interface BlogPageProps {
  onNavigate: (page: string, data?: any) => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/posts');
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        } else {
          console.error('Failed to fetch posts, status:', response.status);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-24">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="mt-4 text-outline font-body-md">Loading technical insights...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen font-sans pb-20">
      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-8 md:pb-12">
        
        {/* Featured Post */}
        {featuredPost && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 md:mb-16 cursor-pointer"
            onClick={() => onNavigate('blog-post-detail', featuredPost)}
          >
            <div className="group relative overflow-hidden rounded-2xl bg-white border border-outline-variant shadow-sm">
              <div className="flex flex-col lg:flex-row min-h-[500px]">
                <div className="lg:w-3/5 h-64 lg:h-auto overflow-hidden">
                  <img 
                    src={featuredPost.image || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop"} 
                    alt={featuredPost.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="lg:w-2/5 p-8 md:p-12 flex flex-col justify-center">
                  <div className="mb-6">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider">
                      {featuredPost.category || 'Engineering Deep Dive'}
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-on-surface mb-6 leading-tight">
                    {featuredPost.title}
                  </h1>
                  <p className="text-lg text-slate-600 mb-8 leading-relaxed line-clamp-3">
                    {featuredPost.description}
                  </p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary">
                      {featuredPost.authorPhoto ? <img src={featuredPost.authorPhoto} alt={featuredPost.author} className="w-full h-full object-cover" /> : <User size={24} className="text-primary" />}
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">{featuredPost.author}</p>
                      <p className="text-xs text-slate-500">CTO & Lead Architect • {featuredPost.readTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <h2 className="text-2xl font-black text-on-surface">Latest Engineering Updates</h2>
              <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">
                <Filter size={20} className="text-primary" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {otherPosts.length > 0 ? otherPosts.map((post, index) => (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col bg-white border border-outline-variant rounded-xl overflow-hidden hover:shadow-md transition-all group cursor-pointer"
                  onClick={() => onNavigate('blog-post-detail', post)}
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={post.image || "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1000&auto=format&fit=crop"} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 flex flex-col grow">
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-bold text-[10px] uppercase text-primary tracking-widest">{post.category || 'Blog'}</span>
                      <span className="text-slate-400 text-[10px]">
                        {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-3 mb-6 leading-relaxed">
                      {post.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                          {post.authorPhoto ? <img src={post.authorPhoto} alt={post.author} className="w-full h-full object-cover" /> : <User size={16} className="text-primary" />}
                        </div>
                        <span className="font-bold text-xs">{post.author}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 italic flex items-center gap-1">
                        <Clock size={10} /> {post.readTime}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )) : !featuredPost && (
                <div className="col-span-full py-24 text-center">
                  <p className="text-outline font-body-md italic text-lg">No technical reports published yet.</p>
                </div>
              )}
            </div>

            {posts.length > 5 && (
              <div className="flex justify-center pt-8">
                <button className="px-8 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/10 transition-all">
                  Load More Articles
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Newsletter */}
            <div className="bg-slate-900 text-white p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-4 text-purple-400">
                <Mail size={24} />
                <h3 className="text-xl font-bold text-white">Security Pulse</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Stay ahead of the curve. Get technical updates and safety breakthroughs delivered to your inbox weekly.
              </p>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="you@company.com" 
                  className="w-full bg-slate-800 border-none rounded-xl text-white p-4 focus:ring-2 focus:ring-primary placeholder:text-slate-500"
                />
                <button className="w-full bg-primary py-3 rounded-xl font-bold hover:brightness-110 transition-all">
                  Subscribe to Updates
                </button>
              </form>
              <p className="mt-4 text-[10px] text-slate-500 text-center uppercase tracking-widest font-medium">
                No spam, just engineering excellence.
              </p>
            </div>

            {/* Popular Tags */}
            <div className="bg-white p-8 rounded-2xl border border-outline-variant shadow-sm">
              <h3 className="text-lg font-black text-on-surface mb-6 uppercase tracking-wider">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['Cryptography', 'Cybersecurity', 'Blockchain', 'AI Safety', 'Privacy', 'Cloud Native', 'DevOps'].map(tag => (
                  <button key={tag} className="px-4 py-2 bg-slate-50 text-slate-600 font-bold text-xs rounded-lg border border-outline-variant hover:border-primary hover:text-primary transition-colors">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Careers */}
            <div className="relative h-64 rounded-2xl overflow-hidden group shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000&auto=format&fit=crop" 
                alt="Office space" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-8">
                <h4 className="text-white text-xl font-black mb-2">Join the Fleet</h4>
                <p className="text-white/70 text-xs mb-4">We are hiring Security Engineers and Backend Architects.</p>
                <button className="text-primary font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform text-sm">
                  View Careers <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default BlogPage;
