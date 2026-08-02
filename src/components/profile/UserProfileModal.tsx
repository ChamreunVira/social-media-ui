import React, { useEffect, useState, useContext } from "react";
import { X, Mail, FileText, UserPlus, UserCheck, MessageSquare, Heart } from "lucide-react";
import type { UserResponse } from "../../types/auth";
import type { PostResponse } from "../../types/post";
import { atuhService } from "../../service/authService";
import { postService } from "../../service/PostService";
import { AppContextProvider } from "../../context/AppContext";
import { friendService } from "../../service/friendService";
import { toast } from "react-toastify";

interface UserProfileModalProps {
    userId: number;
    onClose: () => void;
    onOpenPost?: (post: PostResponse) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, onClose, onOpenPost }) => {
    const { userProfile: currentUser } = useContext<any>(AppContextProvider);
    const [user, setUser] = useState<UserResponse | null>(null);
    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isFriend, setIsFriend] = useState<boolean>(false);
    const [actionLoading, setActionLoading] = useState<boolean>(false);

    const apiUrl = import.meta.env.VITE_API_URL;
    const isSelf = currentUser?.id === userId;

    useEffect(() => {
        const fetchProfileAndPosts = async () => {
            try {
                setLoading(true);
                const [userRes, postsRes, friendsList] = await Promise.all([
                    atuhService.getUserById(userId),
                    postService.getPostsByUserId(userId),
                    currentUser?.id ? friendService.getFriends(currentUser.id) : Promise.resolve([]),
                ]);

                if (userRes.data) {
                    setUser(userRes.data);
                }
                if (postsRes.data) {
                    setPosts(postsRes.data);
                }

                if (friendsList && Array.isArray(friendsList)) {
                    setIsFriend(friendsList.some((f: any) => f.userId === userId));
                }
            } catch (e: any) {
                console.error("Error loading user profile:", e);
                toast.error("Failed to load user profile");
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchProfileAndPosts();
        }
    }, [userId, currentUser?.id]);

    const handleAddFriend = async () => {
        if (!userId) return;
        try {
            setActionLoading(true);
            await friendService.sendRequest(userId);
            toast.success("Friend request sent!");
        } catch (e: any) {
            toast.error(e.message || "Failed to send request");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveFriend = async () => {
        if (!userId) return;
        try {
            setActionLoading(true);
            await friendService.deleteFriend(userId);
            toast.info("Friend removed");
            setIsFriend(false);
        } catch (e: any) {
            toast.error(e.message || "Failed to remove friend");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-200">
                {/* Header / Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full text-zinc-700 transition-colors z-20 backdrop-blur-md"
                >
                    <X size={20} />
                </button>

                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {/* Cover Banner */}
                    <div className="h-36 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"></div>

                    {/* Profile Header Info */}
                    <div className="px-6 pb-6 pt-0 relative">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 mb-4 gap-4">
                            {/* Avatar */}
                            <div className="w-28 h-28 rounded-full overflow-hidden bg-white p-1.5 shadow-xl border-4 border-white shrink-0">
                                <div className="w-full h-full rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 text-3xl font-bold overflow-hidden">
                                    {user?.profile ? (
                                        <img
                                            src={`${apiUrl}/images/${user.profile}`}
                                            alt={user.username}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        user?.username?.[0]?.toUpperCase() || 'U'
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {!isSelf && (
                                <div className="flex items-center gap-2">
                                    {isFriend ? (
                                        <button
                                            disabled={actionLoading}
                                            onClick={handleRemoveFriend}
                                            className="px-4 py-2 bg-zinc-100 hover:bg-rose-50 hover:text-rose-600 text-zinc-700 rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
                                        >
                                            <UserCheck className="w-4 h-4 text-emerald-500" /> Friend
                                        </button>
                                    ) : (
                                        <button
                                            disabled={actionLoading}
                                            onClick={handleAddFriend}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shadow-md shadow-indigo-200"
                                        >
                                            <UserPlus className="w-4 h-4" /> Add Friend
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* User Details */}
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                                {user?.username || "Loading..."}
                            </h2>
                            <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-1">
                                <Mail className="w-4 h-4 text-zinc-400" /> {user?.email}
                            </p>
                        </div>

                        {/* Stats Bar */}
                        <div className="flex items-center gap-6 mt-6 py-3 px-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-500" />
                                <span className="text-sm font-semibold text-zinc-800">{posts.length}</span>
                                <span className="text-xs text-zinc-500">Posts</span>
                            </div>
                        </div>

                        {/* Posts Feed */}
                        <div className="mt-6">
                            <h3 className="text-base font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                Posts
                            </h3>

                            {loading ? (
                                <div className="text-center py-10">
                                    <p className="text-zinc-400 text-sm">Loading posts...</p>
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="text-center py-10 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                                    <p className="text-zinc-400 text-sm">No posts shared yet.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {posts.map((post) => (
                                        <div
                                            key={post.id}
                                            onClick={() => onOpenPost?.(post)}
                                            className="p-4 rounded-2xl border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-semibold text-zinc-900 text-base">{post.title}</h4>
                                                <span className="text-[11px] text-zinc-400 font-medium">{post.createdAt}</span>
                                            </div>
                                            <p className="text-sm text-zinc-600 line-clamp-3 mb-3">{post.content}</p>

                                            {post.image && (
                                                <div className="w-full h-44 rounded-xl overflow-hidden bg-zinc-100 mb-3">
                                                    {post.image.endsWith('.mp4') ? (
                                                        <video className="w-full h-full object-cover">
                                                            <source src={`${apiUrl}/images/${post.image}`} type="video/mp4" />
                                                        </video>
                                                    ) : (
                                                        <img
                                                            src={`${apiUrl}/images/${post.image}`}
                                                            alt={post.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium pt-2 border-t border-zinc-50">
                                                <span className="flex items-center gap-1">
                                                    <Heart className={`w-3.5 h-3.5 ${post.like ? 'text-rose-500 fill-rose-500' : ''}`} /> {post.like || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare className="w-3.5 h-3.5 text-zinc-400" /> {post.comments?.length || 0}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
