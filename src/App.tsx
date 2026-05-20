/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import GamesListingPage from './pages/GamesListingPage';
import DashboardPage from './pages/DashboardPage';
import GameDetailPage from './pages/GameDetailPage';
import AdminPage from './pages/AdminPage';
import BlogPage from './pages/BlogPage';
import BlogPostDetailPage from './pages/BlogPostDetailPage';
import SignInPage from './pages/SignInPage';
import UserProfilePage from './pages/UserProfilePage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const initSession = async () => {
      const savedUid = localStorage.getItem('rotection_uid');
      if (savedUid) {
        try {
          const res = await fetch(`/api/users/${savedUid}`);
          if (res.ok) {
            const data = await res.json();
            setUserProfile(data);
          } else {
            localStorage.removeItem('rotection_uid');
          }
        } catch (error) {
          console.error("Session restoration error:", error);
        }
      }
      setIsInitializing(false);
    };
    initSession();
  }, []);

  useEffect(() => {
    // Real-time profile updates are disabled now that Firestore is abolished.
    // In a real app with Sheets, you might poll or use a websocket proxy.
  }, [userProfile?.uid]);

  const handleSignInSuccess = (profile: any) => {
    localStorage.setItem('rotection_uid', profile.uid);
    setUserProfile(profile);
    setCurrentPage('dashboard');
  };

  const handleSignOut = () => {
    localStorage.removeItem('rotection_uid');
    setUserProfile(null);
    setCurrentPage('landing');
  };

  const navigateToDetail = (id: string) => {
    setSelectedGameId(id);
    setCurrentPage('detail');
  };

  const navigateWithData = (page: string, data?: any) => {
    if (page === 'blog-post-detail' && data) {
      setSelectedPost(data);
    }
    if (page === 'user-profile' && data) {
      setSelectedUserId(data);
    }
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} onGameSelect={navigateToDetail} />;
      case 'games':
        return <GamesListingPage onNavigate={setCurrentPage} onGameSelect={navigateToDetail} userProfile={userProfile} />;
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} onGameSelect={navigateToDetail} userProfile={userProfile} />;
      case 'detail':
        return <GameDetailPage gameId={selectedGameId} onNavigate={navigateWithData} userProfile={userProfile} />;
      case 'admin':
        return <AdminPage onNavigate={setCurrentPage} userProfile={userProfile} />;
      case 'blog':
        return <BlogPage onNavigate={navigateWithData} />;
      case 'blog-post-detail':
        return <BlogPostDetailPage post={selectedPost} onBack={() => setCurrentPage('blog')} />;
      case 'signin':
        return <SignInPage onNavigate={setCurrentPage} onSuccess={handleSignInSuccess} />;
      case 'user-profile':
        return <UserProfilePage userId={selectedUserId || ''} onNavigate={navigateWithData} onGameSelect={navigateToDetail} />;
      default:
        return <LandingPage onNavigate={setCurrentPage} onGameSelect={navigateToDetail} userProfile={userProfile} onSignOut={handleSignOut} />;
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-label-bold text-outline text-[10px] uppercase tracking-widest">Waking Up</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-x-hidden">
      <Navbar onNavigate={setCurrentPage} currentPage={currentPage} user={null} userProfile={userProfile} onSignOut={handleSignOut} />
      <div className="flex-grow">
        {renderPage()}
      </div>
      <Footer />
    </div>
  );
}
