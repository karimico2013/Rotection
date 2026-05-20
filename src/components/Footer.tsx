import { Share2, Globe, Shield, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-custom-dark text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <div className="text-2xl font-black tracking-tighter text-primary mb-6">Rotection</div>
            <p className="text-slate-400 text-xs uppercase tracking-widest leading-relaxed">
              Setting the global standard for digital safety infrastructure in gaming and beyond. Built for trust. Powered by precision.
            </p>
          </div>
          <div>
            <h5 className="text-xs font-black uppercase tracking-widest text-primary mb-6">Resources</h5>
            <ul className="space-y-4 text-xs font-medium text-slate-400 uppercase tracking-widest">
              <li><a className="hover:text-white transition-colors" href="#">Documentation</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Security Disclosure</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Infrastructure API</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Contact Support</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-black uppercase tracking-widest text-primary mb-6">Legal</h5>
            <ul className="space-y-4 text-xs font-medium text-slate-400 uppercase tracking-widest">
              <li><a className="hover:text-white transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Terms of Service</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Compliance Certs</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Cookie Policy</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-black uppercase tracking-widest text-primary mb-6">Newsletter</h5>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-4">Stay updated with our security patches.</p>
            <div className="flex">
              <input 
                className="bg-white/5 border border-white/10 rounded-l-lg px-4 py-2 text-xs w-full focus:outline-none focus:border-primary/50" 
                placeholder="Email Address" 
                type="email" 
              />
              <button className="bg-primary px-4 py-2 rounded-r-lg hover:opacity-90">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-slate-500 text-[10px] uppercase tracking-widest">Rotection 2026 all rights reserved</span>
          <div className="flex gap-6">
            <a className="text-slate-500 hover:text-white transition-colors" href="#"><Share2 size={16} /></a>
            <a className="text-slate-500 hover:text-white transition-colors" href="#"><Globe size={16} /></a>
            <a className="text-slate-500 hover:text-white transition-colors" href="#"><Shield size={16} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
