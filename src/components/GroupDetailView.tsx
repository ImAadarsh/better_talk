"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, Users, MessageSquare, ThumbsUp, Send, ArrowLeft, LogOut, ChevronDown, ChevronUp, BadgeCheck, Pencil, X, Check } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

interface Comment {
    id: number;
    content: string;
    anonymous_username: string;
    author_name?: string;
    author_role?: 'user' | 'mentor' | 'admin';
    is_verified?: number;
    created_at: string;
    is_author?: number;
}

interface Post {
    id: number;
    content: string;
    anonymous_username: string;
    author_name?: string;
    author_role?: 'user' | 'mentor' | 'admin';
    is_verified?: number;
    created_at: string;
    upvote_count: number;
    has_upvoted: number;
    comment_count: number;
    is_author?: number;
}

interface GroupDetail {
    id: number;
    name: string;
    description: string;
    member_count: number;
}


function timeAgo(dateString: string) {
    const d = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (seconds < 0) return "just now";

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "just now";
}

function getColorForUsername(username: string) {
    const colors = [
        "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500", "bg-lime-500",
        "bg-green-500", "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-sky-500",
        "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500",
        "bg-pink-500", "bg-rose-500"
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export default function GroupDetailView() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<{ group: GroupDetail; posts: Post[]; isMember: boolean } | null>(null);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [headerCollapsed, setHeaderCollapsed] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Comments State
    const [activePostId, setActivePostId] = useState<number | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentInput, setCommentInput] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    // Editing State
    const [editingPostId, setEditingPostId] = useState<number | null>(null);
    const [editingPostContent, setEditingPostContent] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingCommentContent, setEditingCommentContent] = useState("");


    useEffect(() => {
        async function fetchGroup() {
            try {
                const res = await fetch(`/api/groups/${params.id}`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                    if (json.isMember) setHeaderCollapsed(true);
                }
            } catch (error) {
                console.error("Failed to fetch group", error);
            } finally {
                setLoading(false);
            }
        }
        if (params.id) fetchGroup();
    }, [params.id]);

    const handleJoinLeave = async (action: 'join' | 'leave') => {
        if (!data) return;
        try {
            const isNowMember = action === 'join';
            setData({ ...data, isMember: isNowMember });
            setHeaderCollapsed(isNowMember);

            await fetch(`/api/groups/${data.group.id}/join`, {
                method: "POST",
                body: JSON.stringify({ action }),
            });
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;

        const form = e.target as HTMLFormElement;
        const contentInput = form.elements.namedItem("content") as HTMLInputElement;
        const content = contentInput.value;

        if (!content.trim()) return;

        setPosting(true);
        try {
            const res = await fetch("/api/posts/create", {
                method: "POST",
                body: JSON.stringify({ groupId: data.group.id, content }),
            });

            if (res.ok) {
                contentInput.value = "";
                window.location.reload();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setPosting(false);
        }
    };

    const toggleLike = async (postId: number) => {
        setData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                posts: prev.posts.map(p => {
                    if (p.id === postId) {
                        const isUpvoting = !p.has_upvoted;
                        return {
                            ...p,
                            has_upvoted: isUpvoting ? 1 : 0,
                            upvote_count: p.upvote_count + (isUpvoting ? 1 : -1)
                        };
                    }
                    return p;
                })
            };
        });

        try {
            await fetch(`/api/posts/${postId}/upvote`, { method: "POST" });
        } catch (e) {
            console.error("Failed to upvote", e);
        }
    };

    const openComments = async (postId: number) => {
        if (activePostId === postId) {
            setActivePostId(null);
            return;
        }
        setActivePostId(postId);
        setLoadingComments(true);
        try {
            const res = await fetch(`/api/posts/${postId}/comments`);
            if (res.ok) {
                setComments(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingComments(false);
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activePostId || !commentInput.trim()) return;

        setSubmittingComment(true);
        try {
            const res = await fetch(`/api/posts/${activePostId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: commentInput }),
            });

            if (res.ok) {
                setCommentInput("");
                const commentsRes = await fetch(`/api/posts/${activePostId}/comments`);
                if (commentsRes.ok) {
                    setComments(await commentsRes.json());
                    setData(prev => prev ? ({
                        ...prev,
                        posts: prev.posts.map(p => p.id === activePostId ? { ...p, comment_count: p.comment_count + 1 } : p)
                    }) : null);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmittingComment(false);
        }
    };

    const startEditingPost = (post: Post) => {
        setEditingPostId(post.id);
        setEditingPostContent(post.content);
    };

    const savePost = async () => {
        if (!editingPostId || !editingPostContent.trim()) return;
        try {
            const res = await fetch(`/api/posts/${editingPostId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editingPostContent }),
            });
            if (res.ok) {
                setData(prev => prev ? ({
                    ...prev,
                    posts: prev.posts.map(p => p.id === editingPostId ? { ...p, content: editingPostContent } : p)
                }) : null);
                setEditingPostId(null);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const startEditingComment = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditingCommentContent(comment.content);
    };

    const saveComment = async () => {
        if (!editingCommentId || !editingCommentContent.trim()) return;
        try {
            const res = await fetch(`/api/comments/${editingCommentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: editingCommentContent }),
            });
            if (res.ok) {
                setComments(prev => prev.map(c => c.id === editingCommentId ? { ...c, content: editingCommentContent } : c));
                setEditingCommentId(null);
            }
        } catch (e) {
            console.error(e);
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-forest-green animate-spin" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-20 text-gray-500">Group not found</div>
        );
    }

    const { group, posts, isMember } = data;

    return (
        <div className="flex flex-col h-full relative bg-white md:bg-transparent">
            {/* Header - Collapsible */}
            <div className={`bg-white transition-all duration-300 ease-in-out border-b border-soft-clay/30 overflow-hidden relative z-50 sticky top-0 shadow-sm ${headerCollapsed ? "py-3 px-4" : "py-8 px-8 text-center"
                }`}>
                {headerCollapsed ? (
                    // Collapsed State
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.back()}
                                className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="w-8 h-8 bg-forest-green/10 rounded-full flex items-center justify-center text-forest-green">
                                <Users className="w-4 h-4" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-gray-900 leading-tight">{group.name}</h1>
                            </div>
                        </div>

                        <button
                            onClick={() => setHeaderCollapsed(false)}
                            className="p-2 text-gray-400 hover:text-forest-green transition-colors"
                        >
                            <ChevronDown className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    // Expanded State
                    <div className="space-y-4 relative">
                        <button
                            onClick={() => router.back()}
                            className="absolute top-0 left-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>

                        {isMember && (
                            <button
                                onClick={() => setHeaderCollapsed(true)}
                                className="absolute top-0 right-0 p-2 text-gray-400 hover:text-forest-green transition-colors"
                            >
                                <ChevronUp className="w-6 h-6" />
                            </button>
                        )}
                        <div className="w-20 h-20 bg-forest-green/10 rounded-full flex items-center justify-center mx-auto text-forest-green">
                            <Users className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                        <p className="text-gray-600 max-w-xl mx-auto text-sm">{group.description}</p>
                        <p className="text-xs text-gray-400 font-medium">{group.member_count} Members</p>

                        <div className="flex items-center justify-center gap-4 pt-4">
                            {isMember ? (
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => handleJoinLeave('leave')}
                                        className="text-red-500 text-sm font-medium hover:underline flex items-center gap-1 justify-center"
                                    >
                                        <LogOut className="w-3 h-3" /> Leave Group
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleJoinLeave('join')}
                                    className="bg-brand-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
                                >
                                    Join Group
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Posts Feed */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-60 md:pb-32 bg-warm-sand/30" ref={scrollRef}>
                {posts.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 italic">
                        No conversations yet. Start one!
                    </div>
                ) : (
                    posts.map((post) => (
                        <div key={post.id} className={`p-5 rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border transition-shadow hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] ${post.author_role === 'mentor' ? 'bg-white border-blue-100' : 'bg-white border-gray-100'
                            }`}>
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm shadow-sm ${post.author_role === 'mentor' ? "bg-blue-500" : (post.anonymous_username ? getColorForUsername(post.anonymous_username) : "bg-gray-400")
                                    }`}>
                                    {post.author_role === 'mentor' ? (
                                        <span className="text-white"><Users className="w-5 h-5" /></span>
                                    ) : (
                                        post.anonymous_username && post.anonymous_username[0].toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            {post.author_role === 'mentor' ? (
                                                <p className="font-bold text-gray-900 text-sm truncate flex items-center gap-1">
                                                    {post.author_name}
                                                    {post.is_verified === 1 && <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500 text-white" />}
                                                </p>
                                            ) : (
                                                <p className="font-bold text-gray-900 text-sm truncate">{post.anonymous_username}</p>
                                            )}
                                            {post.author_role === 'mentor' && (
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Therapist</span>
                                            )}
                                        </div>
                                        <span className="text-xs text-forest-green font-medium whitespace-nowrap flex items-center gap-2">
                                            {timeAgo(post.created_at)}
                                            {post.is_author === 1 && (
                                                <button onClick={() => startEditingPost(post)} className="text-gray-400 hover:text-gray-600 p-1">
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {editingPostId === post.id ? (
                                <div className="mb-4 pl-[52px] -mt-2">
                                    <textarea
                                        value={editingPostContent}
                                        onChange={(e) => setEditingPostContent(e.target.value)}
                                        className="w-full text-sm p-2 border rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                                        rows={3}
                                    />
                                    <div className="flex gap-2 justify-end mt-1">
                                        <button onClick={() => setEditingPostId(null)} className="p-1 text-gray-500 hover:text-gray-700">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <button onClick={savePost} className="p-1 text-green-500 hover:text-green-700">
                                            <Check className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap text-[15px] pl-[52px] -mt-2">{post.content}</p>
                            )}

                            <div className="flex items-center gap-6 text-gray-400 text-xs border-t border-gray-50 pt-3 pl-2">
                                <button
                                    onClick={() => toggleLike(post.id)}
                                    className={`flex items-center gap-1.5 transition-colors font-medium p-1 -ml-1 rounded-md hover:bg-gray-50 ${post.has_upvoted ? "text-forest-green" : "hover:text-forest-green"}`}
                                >
                                    <ThumbsUp className={`w-4 h-4 ${post.has_upvoted ? "fill-current" : ""}`} />
                                    {post.upvote_count > 0 && <span>{post.upvote_count}</span>}
                                    <span>Upvote</span>
                                </button>
                                <button
                                    className={`flex items-center gap-1.5 transition-colors font-medium p-1 rounded-md hover:bg-gray-50 ${activePostId === post.id ? "text-forest-green" : "hover:text-forest-green"}`}
                                    onClick={() => openComments(post.id)}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    {post.comment_count > 0 && <span>{post.comment_count}</span>}
                                    <span>{activePostId === post.id ? "Close" : "Comment"}</span>
                                </button>
                            </div>

                            {/* Comments Section */}
                            {activePostId === post.id && (
                                <div className="mt-4 pt-4 border-t border-gray-100 animate-slide-up pl-4">
                                    {loadingComments ? (
                                        <div className="flex justify-center py-4">
                                            <Loader2 className="w-4 h-4 text-forest-green animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {comments.length === 0 && (
                                                <p className="text-xs text-gray-400 text-center italic py-2">No comments yet</p>
                                            )}
                                            {comments.map(comment => (
                                                <div key={comment.id} className={`bg-gray-50 p-3 rounded-xl text-sm border ${comment.author_role === 'mentor' && comment.is_verified === 1 ? 'border-blue-100 bg-blue-50/30' : 'border-gray-100'}`}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            {comment.author_role === 'mentor' && comment.is_verified === 1 ? (
                                                                <span className="font-bold text-gray-900 text-xs flex items-center gap-1">
                                                                    {comment.author_name}
                                                                    <BadgeCheck className="w-3 h-3 text-blue-500 fill-blue-500 text-white" />
                                                                </span>
                                                            ) : (
                                                                <span className="font-bold text-gray-700 text-xs">{comment.anonymous_username}</span>
                                                            )}
                                                            <span className="text-[10px] text-gray-400">{timeAgo(comment.created_at)}</span>
                                                        </div>
                                                        {comment.is_author === 1 && (
                                                            <button onClick={() => startEditingComment(comment)} className="text-gray-400 hover:text-gray-600">
                                                                <Pencil className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {editingCommentId === comment.id ? (
                                                        <div>
                                                            <input
                                                                value={editingCommentContent}
                                                                onChange={(e) => setEditingCommentContent(e.target.value)}
                                                                className="w-full text-sm p-1 border rounded"
                                                            />
                                                            <div className="flex gap-2 justify-end mt-1">
                                                                <button onClick={() => setEditingCommentId(null)} className="p-1 text-gray-500 hover:text-gray-700">
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                                <button onClick={saveComment} className="p-1 text-green-500 hover:text-green-700">
                                                                    <Check className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-600">{comment.content}</p>
                                                    )}
                                                </div>
                                            ))}

                                            <form onSubmit={handlePostComment} className="flex gap-2 mt-3">
                                                <input
                                                    value={commentInput}
                                                    onChange={(e) => setCommentInput(e.target.value)}
                                                    placeholder="Write a comment..."
                                                    className="flex-1 bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-forest-green/30 outline-none"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={submittingComment || !commentInput.trim()}
                                                    className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg disabled:opacity-50"
                                                >
                                                    {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Sticky Input Area - Mobile Fixed */}
            {isMember && (
                <div className="fixed bottom-[64px] md:bottom-0 md:absolute left-0 w-full bg-white border-t border-soft-clay/30 px-4 py-3 z-30 md:rounded-t-2xl shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                    <form onSubmit={handleCreatePost} className="flex gap-3 items-center max-w-5xl mx-auto">
                        <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all">
                            <input
                                name="content"
                                placeholder="Share your thoughts..."
                                className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder:text-gray-400 text-sm"
                                autoComplete="off"
                                disabled={posting}
                            />
                        </div>
                        <button
                            type="submit"
                            className="p-2.5 bg-brand-primary text-white rounded-full hover:bg-brand-primary/90 transition-all shadow-md disabled:opacity-50 disabled:shadow-none"
                        >
                            {posting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
