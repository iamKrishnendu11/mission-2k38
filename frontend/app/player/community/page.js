"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Heart, MessageCircle, Send, Plus, UserPlus, UserMinus, ShieldCheck } from "lucide-react";
import { SlidingButton } from "@/app/login/components/SlidingButton";

// Removed LottieIcon

export default function PlayerCommunity() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState("");
  const [newPostMedia, setNewPostMedia] = useState("");
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [comments, setComments] = useState({});
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = () => {
    setLoading(true);
    api.get("/social/posts")
      .then(res => {
        setPosts(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    setSubmittingPost(true);

    try {
      const payload = {
        text: newPostText,
        mediaUrl: newPostMedia || undefined,
        mediaType: newPostMedia ? "image" : undefined
      };

      const res = await api.post("/social/posts", payload);
      setPosts(prev => [res, ...prev]);
      setNewPostText("");
      setNewPostMedia("");
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/social/posts/${postId}/like`);
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          return {
            ...p,
            likes: res.liked 
              ? [...(p.likes || []), "currentUserId"] 
              : (p.likes || []).filter(id => id !== "currentUserId")
          };
        }
        return p;
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleFollowToggle = async (userId) => {
    try {
      const res = await api.post(`/social/users/${userId}/follow`);
      alert(res.following ? "User followed!" : "User unfollowed!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenComments = async (postId) => {
    if (commentingPostId === postId) {
      setCommentingPostId(null);
      return;
    }
    setCommentingPostId(postId);
    
    try {
      const res = await api.get(`/social/posts/${postId}/comments`);
      setComments(prev => ({ ...prev, [postId]: res }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      const res = await api.post(`/social/posts/${postId}/comment`, { text: newCommentText });
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res]
      }));
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
      setNewCommentText("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 border-b border-white/[0.04] pb-6 pt-10">
          <div className="w-14 h-14 bg-gradient-to-b from-white/[0.06] to-transparent border border-white/[0.05] rounded-2xl flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] shrink-0">
            <MessageCircle className="w-6 h-6 text-yellow-400 drop-shadow-md" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Social Pitch</h2>
            <p className="text-white/50 text-sm mt-1 font-medium">
              Connect, share video clips, and tag scouts
            </p>
          </div>
        </div>

        {/* CREATE POST CARD */}
        <div className="bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-3xl p-6 backdrop-blur-xl">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <textarea
              rows="3"
              placeholder="What's your training update today? e.g. Flexion angle down to 110deg..."
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              className="w-full bg-zinc-950/80 border border-white/[0.04] focus:border-yellow-400 focus:outline-none rounded-2xl p-4 text-white placeholder-zinc-500 text-sm"
            />
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <input
                type="text"
                placeholder="Image URL link (optional)"
                value={newPostMedia}
                onChange={(e) => setNewPostMedia(e.target.value)}
                className="w-full sm:w-2/3 bg-zinc-950/80 border border-white/[0.04] focus:border-yellow-400 focus:outline-none rounded-xl p-3 text-xs text-white"
              />
              <div className="w-full sm:w-1/3">
                <SlidingButton
                  onClick={handleCreatePost}
                  disabled={submittingPost || !newPostText.trim()}
                  className="w-full h-12 text-sm font-bold tracking-tight"
                >
                  {submittingPost ? "Posting..." : "Share Post"}
                </SlidingButton>
              </div>
            </div>
          </form>
        </div>

        {/* POSTS LIST */}
        {loading ? (
          <div className="text-center py-10">
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <span className="text-xs text-white/40 uppercase tracking-widest font-bold">Rendering Feed...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-white/[0.02] border border-white/[0.05] rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-white/20" />
            </div>
            <h4 className="text-sm font-bold text-white/70 mb-1">No Posts Yet</h4>
            <p className="text-xs font-medium text-white/40 max-w-sm">No updates posted yet. Be the first to share your goals!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => {
              const authorProfile = post.authorProfile || {};
              const userRole = post.user?.role || "player";
              const postComments = comments[post._id] || [];

              return (
                <div key={post._id} className="bg-zinc-900/20 border border-zinc-805 rounded-3xl p-6 space-y-6">
                  {/* Author Header */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/[0.04] bg-zinc-950">
                        <img 
                          src={authorProfile.profilePhoto || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150"} 
                          alt="Author" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1">
                          {authorProfile.name || "M2K38 Player"}
                          {authorProfile.verifiedBadge && <ShieldCheck className="w-4.5 h-4.5 text-blue-400 fill-blue-400/20" />}
                        </h4>
                        <span className="text-[9px] uppercase tracking-widest font-black text-yellow-400/90 block">
                          {userRole} • {authorProfile.currentClub || "Squad Cadet"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Follow Trigger */}
                    <button 
                      onClick={() => handleFollowToggle(post.user?._id)}
                      className="p-2 bg-zinc-950 border border-white/[0.04] rounded-full hover:bg-zinc-900 text-white/50 hover:text-white transition-all"
                    >
                      <UserPlus className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-4">
                    <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
                      {post.text}
                    </p>
                    {post.mediaUrl && (
                      <div className="rounded-2xl overflow-hidden border border-white/[0.04] max-h-[380px] bg-zinc-950">
                        <img src={post.mediaUrl} alt="Post Attachment" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center space-x-6 border-t border-white/[0.04] pt-4 text-white/50 text-xs font-bold">
                    <button 
                      onClick={() => handleLike(post._id)}
                      className="flex items-center space-x-2 hover:text-red-400 transition-colors"
                    >
                      <Heart className="w-5 h-5" />
                      <span>{post.likes?.length || 0} Likes</span>
                    </button>
                    <button 
                      onClick={() => handleOpenComments(post._id)}
                      className="flex items-center space-x-2 hover:text-yellow-400 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.commentsCount || 0} Comments</span>
                    </button>
                  </div>

                  {/* Comments Drawer */}
                  {commentingPostId === post._id && (
                    <div className="border-t border-white/[0.04] pt-4 space-y-4">
                      {/* Comments Feed */}
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {postComments.map((comment) => (
                          <div key={comment._id} className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900 text-xs">
                            <span className="font-bold text-white block">{comment.authorProfile?.name || "Player"}:</span>
                            <p className="text-white/50 mt-1 leading-relaxed">{comment.text}</p>
                          </div>
                        ))}
                      </div>

                      {/* Comment Input */}
                      <form onSubmit={(e) => handleAddComment(e, post._id)} className="flex items-center gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Type your comment..."
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          className="flex-1 bg-zinc-950 border border-white/[0.04] focus:border-yellow-400 focus:outline-none rounded-xl p-3 text-xs text-white"
                        />
                        <button type="submit" className="p-3 bg-yellow-400 hover:bg-yellow-500 rounded-xl text-black transition-all">
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
