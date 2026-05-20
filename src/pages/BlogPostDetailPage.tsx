import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Clock, 
  Terminal, 
  Lightbulb, 
  Share2, 
  Twitter, 
  Linkedin, 
  Link as LinkIcon,
  ChevronLeft,
  Vibrate,
  ArrowRight,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Github,
  Monitor,
  LayoutDashboard,
  Gamepad2,
  ShieldAlert,
  Users
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogPostDetailPageProps {
  post: any;
  onBack: () => void;
}

const BlogPostDetailPage: React.FC<BlogPostDetailPageProps> = ({ post, onBack }) => {
  const relatedPosts = [
    {
      tag: 'HARDWARE SEC',
      title: 'Securing the Silicon: The Root of Trust in RISC-V',
      author: 'Dr. Marcus Chen',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop'
    },
    {
      tag: 'CRYPTOGRAPHY',
      title: 'Implementing Post-Quantum Encryption Today',
      author: 'Sarah Hughes',
      image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1000&auto=format&fit=crop'
    },
    {
      tag: 'NETWORK OPS',
      title: 'Autonomous Recovery: Healing After a Zero-Day',
      author: 'Leo Varma',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=1000&auto=format&fit=crop'
    }
  ];

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-24 text-center px-6">
        <h2 className="text-2xl font-black text-on-surface mb-4">Post not found</h2>
        <button 
          onClick={onBack}
          className="px-6 py-2 bg-primary text-white rounded-xl font-bold"
        >
          Back to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen font-sans selection:bg-primary-container selection:text-on-primary-container">
      <main className="pt-24">
        {/* Header Section */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto mb-12">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-8 font-bold text-sm"
          >
            <ChevronLeft size={18} /> Back to Blog
          </button>
          
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs mb-6 uppercase tracking-wider">
              <Terminal size={14} className="mr-2" />
              {post.category || 'Engineering Deep Dive'}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-on-surface mb-8 leading-[1.1]">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 border-y border-outline-variant py-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high border-2 border-primary">
                  {post.authorPhoto ? (
                    <img className="w-full h-full object-cover" src={post.authorPhoto} alt={post.author} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <User size={24} className="text-primary" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-on-surface">{post.author}</p>
                  <p className="text-xs text-on-surface-variant font-medium">Author • {post.readTime}</p>
                </div>
              </div>
              <div className="h-8 w-px bg-outline-variant hidden sm:block"></div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Clock size={16} />
                <span className="text-xs font-medium">
                  {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'Published recently'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {post.image && (
          <section className="px-6 md:px-12 max-w-7xl mx-auto mb-16">
            <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 shadow-xl border border-outline-variant">
              <img 
                className="w-full h-full object-cover" 
                src={post.image} 
                alt={post.title}
              />
            </div>
          </section>
        )}

        {/* Article Body */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto pb-24 flex flex-col lg:flex-row gap-12">
          {/* Left Sidebar (Social) */}
          <aside className="hidden lg:block w-16 shrink-0 pt-4">
            <div className="sticky top-24 flex flex-col gap-4 items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 [writing-mode:vertical-rl] rotate-180">
                Share
              </span>
              <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-slate-500 hover:bg-primary/10 hover:text-primary transition-all hover:border-primary">
                <Twitter size={18} />
              </button>
              <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-slate-500 hover:bg-primary/10 hover:text-primary transition-all hover:border-primary">
                <Linkedin size={18} />
              </button>
              <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-slate-500 hover:bg-primary/10 hover:text-primary transition-all hover:border-primary">
                <LinkIcon size={18} />
              </button>
            </div>
          </aside>

          {/* Main Body */}
          <div className="flex-grow max-w-3xl">
            <div className="prose prose-slate prose-lg max-w-none text-slate-600">
              <p className="text-xl leading-relaxed mb-8 font-medium">
                {post.description}
              </p>
              
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Mobile Social Share */}
            <div className="lg:hidden mt-16 pt-8 border-t border-outline-variant">
              <p className="font-bold text-sm mb-4 text-on-surface">Share this article</p>
              <div className="flex gap-4">
                <button className="px-5 py-2.5 rounded-xl border border-outline-variant flex items-center gap-2 font-bold text-sm hover:border-primary hover:text-primary transition-all">
                  <Twitter size={16} />
                  Twitter
                </button>
                <button className="px-5 py-2.5 rounded-xl border border-outline-variant flex items-center gap-2 font-bold text-sm hover:border-primary hover:text-primary transition-all">
                  <Linkedin size={16} />
                  LinkedIn
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-24 flex flex-col gap-8">
              {/* Newsletter Widget */}
              <div className="bg-slate-950 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6 relative z-10">
                  <Vibrate size={24} className="text-white" />
                </div>
                <h4 className="text-xl font-black mb-2 relative z-10">Security Pulse</h4>
                <p className="text-sm text-slate-400 mb-6 relative z-10 font-medium">Weekly insights on autonomous network defense and technical breakthroughs.</p>
                <form className="space-y-4 relative z-10" onSubmit={(e) => e.preventDefault()}>
                  <input 
                    className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-600" 
                    placeholder="Engineering email" 
                    type="email"
                  />
                  <button className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                    Join 12k Engineers
                  </button>
                </form>
              </div>

              {/* Article Details */}
              <div className="p-8 border border-outline-variant rounded-2xl bg-white shadow-sm">
                <h5 className="font-black text-xs text-on-surface uppercase tracking-[0.2em] mb-6 border-b border-outline-variant pb-4">Article Details</h5>
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Difficulty</span>
                    <span className="text-xs font-black px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">Advanced</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Focus</span>
                    <span className="text-xs font-black text-primary">AI & SecOps</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Views</span>
                    <span className="text-xs font-black text-on-surface">4.2k</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* RELATED ARTICLES */}
        <section className="bg-slate-50 py-24 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-black text-on-surface mb-2 tracking-tight">Continue Reading</h2>
                <p className="text-slate-500 font-medium">More technical insights from the Rotection Engineering team.</p>
              </div>
              <button className="hidden sm:flex items-center gap-2 text-primary font-black text-sm hover:gap-4 transition-all uppercase tracking-widest">
                View Research Hub <ArrowRight size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((post, idx) => (
                <article key={idx} className="group bg-white rounded-2xl overflow-hidden border border-outline-variant hover:border-primary transition-all flex flex-col hover:shadow-lg">
                  <div className="aspect-video overflow-hidden">
                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={post.image} alt={post.title} />
                  </div>
                  <div className="p-8 flex-grow flex flex-col">
                    <div className="text-[10px] font-black text-primary mb-4 uppercase tracking-[0.2em]">{post.tag}</div>
                    <h3 className="text-xl font-bold mb-6 flex-grow leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <User size={14} />
                      <span>{post.author}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

export default BlogPostDetailPage;
