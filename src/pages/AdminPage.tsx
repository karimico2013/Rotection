import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  RefreshCcw, 
  Loader2, 
  ChevronLeft, 
  Trash2, 
  LayoutDashboard, 
  Plus, 
  Image as ImageIcon, 
  Eye, 
  Edit3, 
  Save, 
  Send,
  FileText,
  Users as UsersIcon,
  X,
  Upload,
  Database
} from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, OperationType } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import UserAvatar from '../components/UserAvatar';

interface AdminPageProps {
  onNavigate: (page: string) => void;
  userProfile?: any;
}

export default function AdminPage({ onNavigate, userProfile }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'blog'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Blog creation state
  const [isCreating, setIsCreating] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    category: 'Engineering',
    content: '',
    image: '',
    readTime: '5 min read',
    author: userProfile?.displayName || 'Anonymous'
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = ['admin', 'creator', 'co-creator', 'moderator', 'owner', 'co-owner'].includes(userProfile?.role?.toLowerCase()) || userProfile?.email === 'karimico2013@gmail.com';

  const handleAddTestUser = async () => {
    if (!window.confirm("Add a test user to the Google Sheet?")) return;
    try {
      const res = await fetch('/api/admin/add-test-user', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      fetchUsers();
    } catch (error: any) {
      alert('Failed: ' + error.message);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      onNavigate('landing');
      return;
    }

    fetchUsers();

    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);
        const res = await fetch('/api/posts');
        const data = await res.json();
        if (res.ok) {
          setPosts(data);
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, [isAdmin, onNavigate]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync-sheets', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert('Sync successful! ' + data.message);
    } catch (error: any) {
      alert('Sync failed: ' + error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteUser = async (userId: string, displayName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${displayName}"? This will permanently remove their profile data and account from the system.`)) return;
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        alert(`SUCCESS: User "${displayName}" has been deleted.`);
        fetchUsers();
      }
    } catch (error: any) {
      console.error("Delete user error:", error);
      alert(`DELETE FAILED: ${error.message}`);
    }
  };

  const handleNukeFS = async () => {
    if (!window.confirm("CRITICAL ACTION: This will delete ALL user records. Continue?")) return;
    
    const doubleCheck = window.prompt("Type 'CONFIRM' to proceed with wiping the database users collection:");
    if (doubleCheck !== 'CONFIRM') return;

    try {
      const res = await fetch('/api/admin/nuke-fs-users', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert('SUCCESS: ' + data.message);
    } catch (error: any) {
      alert('Wipe failed: ' + error.message);
    }
  };

  const handleDeletePost = async (postId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete post "${title}"?`)) return;
    
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        alert(`Post "${title}" deleted successfully.`);
        // Refresh posts
        const postsRes = await fetch('/api/posts');
        const data = await postsRes.json();
        if (postsRes.ok) setPosts(data);
      }
    } catch (error: any) {
      console.error("Delete post error:", error);
      alert(`Failed to delete post: ${error.message}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `blog-images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setNewPost(prev => ({ ...prev, image: url }));
    } catch (error: any) {
      console.error("Image upload failed detailed error:", error);
      let message = "Image upload failed. ";
      if (error.code === 'storage/unauthorized') {
        message += "You might need to enable Firebase Storage and set rules to allow writes in the Google Cloud/Firebase console.";
      } else if (error.code === 'storage/unknown') {
        message += "Ensure the Firebase Storage service is enabled for your project.";
      } else {
        message += error.message || "Unknown error.";
      }
      alert(message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSavePost = async () => {
    if (!newPost.title || !newPost.content) {
      alert("Title and Content are required.");
      return;
    }

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });

      if (res.ok) {
        setIsCreating(false);
        setNewPost({
          title: '',
          description: '',
          category: 'Engineering',
          content: '',
          image: '',
          readTime: '5 min read',
          author: userProfile?.displayName || 'Anonymous'
        });
        alert("Post published successfully!");
        // Refresh posts
        const postsRes = await fetch('/api/posts');
        const data = await postsRes.json();
        if (postsRes.ok) setPosts(data);
      }
    } catch (error: any) {
      console.error('Failed to save post:', error);
    }
  };

  if (!isAdmin) return null;

  return (
    <main className="flex-grow max-w-7xl mx-auto px-6 py-24 min-h-screen">
      <div className="mb-12">
        <button 
          onClick={() => onNavigate('games')}
          className="flex items-center gap-2 text-outline hover:text-primary transition-colors font-label-bold mb-4"
        >
          <ChevronLeft size={16} />
          Back to Listings
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline-xl text-on-surface">Admin Control Panel</h1>
            <p className="text-outline font-body-md mt-2">Manage users and blog content from a single dashboard.</p>
          </div>
          <div className="flex bg-surface-container rounded-xl p-1 shadow-sm border border-outline-variant/30">
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-label-bold text-sm transition-all ${activeTab === 'users' ? 'bg-white text-primary shadow-sm' : 'text-outline hover:text-on-surface'}`}
            >
              <UsersIcon size={16} />
              Users
            </button>
            <button 
              onClick={() => setActiveTab('blog')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-label-bold text-sm transition-all ${activeTab === 'blog' ? 'bg-white text-primary shadow-sm' : 'text-outline hover:text-on-surface'}`}
            >
              <FileText size={16} />
              Blog
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'users' ? (
          <motion.div 
            key="users-tab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="font-label-bold text-on-surface">Data Consistency Check</h3>
                  <p className="text-xs text-outline font-body-md max-w-md">
                    The app is currently connected to Firestore Database: <span className="font-mono text-primary bg-primary/5 px-2 py-0.5 rounded">ai-studio-ad6c5449-1b68-4243-bac5-20b2bb64c059</span>. 
                    If you see discrepancies with the Firebase Console, ensure you have switched to this specific database ID (it is not the (default) database).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] text-outline font-black uppercase mb-1">Session UserID</div>
                  <div className="text-[10px] font-mono text-on-surface bg-surface-container px-2 py-1 rounded">{userProfile?.uid}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-outline font-black uppercase mb-1">Roblox Username</div>
                  <div className="text-[10px] font-mono text-on-surface bg-surface-container px-2 py-1 rounded">{userProfile?.robloxUsername || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-headline-lg text-on-surface">Registered Users</h2>
                <p className="text-sm text-outline mt-1 font-body-md">Manage user authorization and roles directly in Firestore.</p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleAddTestUser}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-label-bold hover:bg-slate-200 transition-all"
                  title="Inject test user into sheet"
                >
                  <UsersIcon size={16} />
                  Add Test User
                </button>
                <button 
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-6 py-2 bg-white border border-primary text-primary rounded-xl font-label-bold hover:bg-primary/5 transition-all disabled:opacity-50"
                  title="Push current DB state to Sheets"
                >
                  {isSyncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
                  {isSyncing ? 'Syncing...' : 'Sync to Sheets'}
                </button>
                  <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-label-bold text-sm">
                    {users.length} Users in System
                  </div>
              </div>
            </div>

            <div className="bg-surface-container/50 border border-outline-variant/30 p-4 rounded-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center text-outline">
                  <Database size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-outline leading-none mb-1">Active Connectivity</div>
                  <div className="text-[10px] font-mono text-primary flex items-center gap-2">
                    <span>Sheet ID: 1vnfl7...rBY</span>
                    <span className="w-1 h-1 bg-outline-variant rounded-full" />
                    <span>Firestore DB: {(firebaseConfig as any).firestoreDatabaseId || '(default)'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${users.length > 0 ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
                <span className="text-[10px] font-label-bold text-outline uppercase">{users.length > 0 ? 'Data Connected' : 'Empty/No Records'}</span>
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="font-body-md text-outline">Loading users data...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-24 bg-surface-container/30 rounded-3xl border border-dashed border-outline-variant">
                <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center mx-auto mb-4 text-outline">
                  <UsersIcon size={32} />
                </div>
                <h3 className="font-headline-sm text-on-surface">No Users in Database</h3>
                <p className="font-body-md text-outline mt-2 max-w-sm mx-auto">
                  The Firestore 'users' collection is empty. new sign-ups will appear here automatically.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <button 
                    onClick={handleManualSync}
                    className="px-6 py-2 bg-primary text-white rounded-xl font-label-bold"
                  >
                    Sync from Sheets
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {users.map((user, index) => (
                    <motion.div 
                      key={user.uid || `user-${index}`} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-outline-variant/30 p-6 rounded-2xl flex items-center justify-between hover:shadow-sm transition-shadow group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <UserAvatar 
                          userId={user.uid}
                          robloxId={user.robloxId}
                          photoURL={user.photoURL}
                          displayName={user.displayName}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary/5" 
                        />
                        <div>
                          <div className="font-label-bold text-on-surface flex items-center gap-2">
                            {user.displayName || 'Anonymous User'}
                            {['admin', 'creator', 'co-creator', 'owner', 'co-owner'].includes(user.role?.toLowerCase()) && <ShieldCheck size={14} className="text-primary" />}
                          </div>
                          <div className="text-xs text-outline font-body-md leading-tight">@{user.robloxUsername || 'No Roblox Username'}</div>
                          <div className="text-[9px] font-mono text-outline-variant uppercase tracking-tighter mt-1">Roblox ID: {user.robloxId || user.uid}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-[10px] text-outline font-black uppercase mb-1">Current Role</div>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            ['admin', 'creator', 'co-creator', 'owner', 'co-owner'].includes(user.role?.toLowerCase()) ? 'bg-primary text-white shadow-sm' : 
                            ['auditor', 'moderator'].includes(user.role?.toLowerCase()) ? 'bg-secondary text-white' : 'bg-surface-container text-on-surface-variant'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </div>
                        <div className="text-right min-w-[120px]">
                          <div className="text-[10px] text-outline font-black uppercase mb-1">Created</div>
                          <div className="text-xs font-label-bold text-on-surface text-nowrap">
                            {user.createdAt?.toDate ? new Date(user.createdAt.toDate()).toLocaleDateString() : 
                             user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                        {user.uid !== userProfile?.uid && (
                          <button 
                            onClick={() => handleDeleteUser(user.uid, user.displayName)}
                            className="p-2 text-outline hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete user record"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-12 p-8 border border-red-100 bg-red-50/30 rounded-3xl">
                  <h3 className="font-label-bold text-red-600 mb-2">Advanced Tools</h3>
                  <p className="text-xs text-outline font-body-md mb-6">
                    If you see "ghost" accounts that shouldn't be here, you can wipe the Firestore collection. 
                    This will NOT delete the actual accounts from Firebase Authentication, only their data records here.
                  </p>
                  <button 
                    onClick={handleNukeFS}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-label-bold hover:bg-red-700 transition-all shadow-sm"
                  >
                    <Trash2 size={18} />
                    Wipe database users collection
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="blog-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {!isCreating ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-headline-lg text-on-surface">Manage Blog Posts</h2>
                    <p className="text-sm text-outline mt-1 font-body-md">Create, edit and delete technical safety reports.</p>
                  </div>
                  <button 
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl font-label-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                  >
                    <Plus size={18} />
                    New Article
                  </button>
                </div>

                {loadingPosts ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="animate-spin text-primary" size={48} />
                    <p className="font-body-md text-outline">Loading articles...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {posts.length === 0 ? (
                      <div className="bg-white border border-dashed border-outline-variant p-24 rounded-3xl flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center">
                          <FileText size={32} className="text-outline-variant" />
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">No articles yet</p>
                          <p className="text-sm text-outline font-body-md">Click "New Article" to get started.</p>
                        </div>
                      </div>
                    ) : (
                      posts.map((post) => (
                        <motion.div 
                          key={post.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border border-outline-variant/30 p-4 rounded-2xl flex items-center gap-6 hover:shadow-sm transition-shadow"
                        >
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-container-high shrink-0">
                            {post.image ? (
                              <img src={post.image} className="w-full h-full object-cover" alt={post.title} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon size={24} className="text-outline-variant" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{post.category}</span>
                              <span className="text-outline-variant text-[10px]">•</span>
                              <span className="text-[10px] text-outline font-bold uppercase">{post.author}</span>
                            </div>
                            <h3 className="font-label-bold text-on-surface text-lg line-clamp-1">{post.title}</h3>
                            <p className="text-xs text-outline font-body-md line-clamp-1 mt-1">{post.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleDeletePost(post.id, post.title)}
                              className="p-2 text-outline hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-outline-variant p-8 rounded-3xl shadow-xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsCreating(false)}
                      className="p-2 hover:bg-surface-container rounded-lg text-outline"
                    >
                      <X size={20} />
                    </button>
                    <h3 className="font-headline-lg text-on-surface">Article Editor</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setPreviewMode(!previewMode)}
                      className={`flex items-center gap-2 px-6 py-2 rounded-xl font-label-bold text-sm transition-all ${previewMode ? 'bg-primary text-white shadow-lg' : 'bg-surface-container text-outline hover:text-on-surface'}`}
                    >
                      {previewMode ? <Edit3 size={16} /> : <Eye size={16} />}
                      {previewMode ? 'Editor' : 'Preview'}
                    </button>
                    {!previewMode && (
                      <button 
                        onClick={handleSavePost}
                        className="flex items-center gap-2 px-8 py-2 bg-primary text-white rounded-xl font-label-bold hover:brightness-110 transition-all shadow-lg shadow-primary/25"
                      >
                        <Send size={16} />
                        Publish
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className={`space-y-6 ${previewMode ? 'hidden lg:block opacity-50 pointer-events-none' : ''}`}>
                    <div>
                      <label className="block text-xs font-black text-outline uppercase tracking-wider mb-2">Article Image</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="relative h-48 rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-low transition-all group overflow-hidden"
                      >
                        {newPost.image ? (
                          <>
                            <img src={newPost.image} className="w-full h-full object-cover" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Upload size={32} className="text-white" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-2">
                              {uploadingImage ? <Loader2 className="animate-spin text-primary" size={24} /> : <ImageIcon size={24} className="text-primary" />}
                            </div>
                            <p className="text-xs font-bold text-on-surface">Click to upload banner</p>
                            <p className="text-[10px] text-outline font-body-md">Recommended 1200x600px</p>
                          </>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleImageUpload} 
                          className="hidden" 
                          accept="image/*" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-outline uppercase tracking-wider mb-2">Category</label>
                        <select 
                          value={newPost.category}
                          onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full border-outline-variant rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary"
                        >
                          <option>Engineering</option>
                          <option>Safety Updates</option>
                          <option>Community</option>
                          <option>Infrastructure</option>
                          <option>DevOps</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-outline uppercase tracking-wider mb-2">Read Time</label>
                        <input 
                          type="text" 
                          value={newPost.readTime}
                          onChange={(e) => setNewPost(prev => ({ ...prev, readTime: e.target.value }))}
                          className="w-full border-outline-variant rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary"
                          placeholder="e.g. 10 min read"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-outline uppercase tracking-wider mb-2">Title</label>
                      <input 
                        type="text" 
                        value={newPost.title}
                        onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full border-outline-variant rounded-xl p-3 text-lg font-bold focus:ring-2 focus:ring-primary"
                        placeholder="Article Headline"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-outline uppercase tracking-wider mb-2">Short Description</label>
                      <textarea 
                        value={newPost.description}
                        onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full border-outline-variant rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary h-20 resize-none"
                        placeholder="Brief summary for the card view..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-outline uppercase tracking-wider mb-2">Content (Markdown)</label>
                      <textarea 
                        value={newPost.content}
                        onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full border-outline-variant rounded-xl p-4 text-sm font-mono focus:ring-2 focus:ring-primary h-96 resize-none"
                        placeholder="# Your Article Content..."
                      />
                    </div>
                  </div>

                  <div className={`h-full flex flex-col ${!previewMode ? 'hidden lg:flex' : ''}`}>
                    <label className="block text-xs font-black text-outline uppercase tracking-wider mb-2">Live Preview</label>
                    <div className="flex-grow bg-surface-container-low rounded-2xl border border-outline-variant p-8 overflow-y-auto max-h-[800px]">
                      <article className="prose prose-slate prose-sm max-w-none">
                        {newPost.image && <img src={newPost.image} className="w-full rounded-xl mb-8" alt="Featured" />}
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{newPost.category}</span>
                          <span className="text-outline-variant">•</span>
                          <span className="text-[10px] text-outline font-bold uppercase">{newPost.readTime}</span>
                        </div>
                        <h1 className="text-3xl font-black text-on-surface mb-6 leading-tight">{newPost.title || 'Your Title Here'}</h1>
                        <p className="text-slate-500 font-medium italic mb-8 border-l-4 border-outline-variant pl-4">{newPost.description || 'Describe your post...'}</p>
                        <div className="markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {newPost.content || '*Markdown content will appear here...*'}
                          </ReactMarkdown>
                        </div>
                      </article>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
