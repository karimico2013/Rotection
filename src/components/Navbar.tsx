import { Bell, UserCircle, LogOut, ShieldCheck } from 'lucide-react';
import UserAvatar from './UserAvatar';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  user?: any; // Kept for prop stability but unused
  userProfile?: any;
  onSignOut?: () => void;
}

export default function Navbar({ onNavigate, currentPage, userProfile, onSignOut }: NavbarProps) {
  const handleLogout = () => {
    if (onSignOut) {
      onSignOut();
    }
    onNavigate('landing');
  };

  const displayName = userProfile?.displayName || 'User';
  const role = userProfile?.role?.toLowerCase() || 'user';
  const isAdmin = ['admin', 'creator', 'co-creator', 'moderator', 'owner', 'co-owner'].includes(role);

  return (
    <nav className="bg-white/95 backdrop-blur-md fixed w-full top-0 z-50 border-b border-slate-200">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        <div 
          className="text-2xl font-black tracking-tighter text-primary cursor-pointer"
          onClick={() => onNavigate('landing')}
        >
          Rotection
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <button 
            className={`${currentPage === 'dashboard' ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-600 hover:text-primary'} transition-all font-medium text-sm`}
            onClick={() => onNavigate('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`${currentPage === 'games' ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-600 hover:text-primary'} transition-all font-medium text-sm`}
            onClick={() => onNavigate('games')}
          >
            Games
          </button>
          <button className="text-slate-600 hover:text-primary transition-colors font-medium text-sm">
            Safety Reports
          </button>
          <button 
            className={`${currentPage === 'blog' ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-600 hover:text-primary'} transition-all font-medium text-sm`}
            onClick={() => onNavigate('blog')}
          >
            Blog
          </button>
          {isAdmin && (
            <button 
              className={`${currentPage === 'admin' ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-600 hover:text-primary'} transition-colors font-medium text-sm`}
              onClick={() => onNavigate('admin')}
            >
              Admin
            </button>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-slate-600 hover:text-primary transition-colors">
            <Bell size={20} />
          </button>
          
          {userProfile ? (
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold text-on-surface leading-none">{displayName}</span>
              </div>
              <div className="relative group">
                <button className="text-slate-600 hover:text-primary transition-colors flex items-center">
                  <div className="w-8 h-8 rounded-full border border-primary/20 bg-surface-container flex items-center justify-center overflow-hidden">
                    <UserAvatar 
                      userId={userProfile?.uid}
                      robloxId={userProfile?.robloxId}
                      photoURL={userProfile?.photoURL}
                      displayName={displayName}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </button>
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-outline-variant rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-3">
                  <div className="mb-3 border-b border-outline-variant pb-3">
                    <p className="text-sm font-bold text-on-surface truncate">{displayName}</p>
                    <p className="text-[10px] text-outline truncate uppercase tracking-tighter">{role}</p>
                    {userProfile?.bio && (
                      <p className="mt-2 text-[11px] text-on-surface-variant line-clamp-3 leading-relaxed italic">
                        "{userProfile.bio}"
                      </p>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors font-medium mb-1 cursor-pointer" onClick={() => onNavigate('admin')}>
                      <ShieldCheck size={16} /> Admin Panel
                    </div>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              className="bg-primary text-white px-5 py-2 rounded-lg font-label-bold hover:opacity-90 transition-opacity"
              onClick={() => onNavigate('signin')}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
