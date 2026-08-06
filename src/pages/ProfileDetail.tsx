import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    FileText,
    Heart,
    Mail,
    MapPin,
    MessageSquare,
    Pencil,
    Phone,
    User,
    UserCheck,
    UserPlus,
    X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import type { ProfileResponse } from '../types/auth';
import type { PostResponse } from '../types/post';
import { userService } from '../service/userService';
import { postService } from '../service/PostService';
import { friendService } from '../service/friendService';
import { AppContextProvider } from '../context/AppContext';

const apiUrl = import.meta.env.VITE_API_URL;

const ProfileDetail = () => {
    const { nickname } = useParams<{ nickname: string }>();
    const navigate = useNavigate();
    const { userProfile: currentUser } = useContext<any>(AppContextProvider);

    const [profileData, setProfileData] = useState<ProfileResponse | any>(null);
    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [isFriend, setIsFriend] = useState<boolean>(false);
    const [actionLoading, setActionLoading] = useState<boolean>(false);
    const [activePost, setActivePost] = useState<PostResponse | null>(null);

    const isSelf = currentUser?.nickname === nickname;

    useEffect(() => {
        const controller = new AbortController();

        const fetchProfile = async () => {
            if (!nickname) return;
            try {
                setLoading(true);
                setNotFound(false);

                const response = await userService.getByNickname(nickname);
                if (!response.success || !response.data) {
                    setNotFound(true);
                    return;
                }
                const profile = response.data;
                setProfileData(profile);

                const userId = profile.id;
                const [postsRes, friendsList] = await Promise.all([
                    userId ? postService.getPostsByUserId(userId) : Promise.resolve({ data: [] }),
                    userId && currentUser?.id ? friendService.getFriends(currentUser.id) : Promise.resolve([]),
                ]);

                if (postsRes?.data) setPosts(postsRes.data);
                if (Array.isArray(friendsList)) {
                    setIsFriend(friendsList.some((f: any) => f.userId === userId));
                }
            } catch (err: any) {
                console.error('Failed to fetch user profile:', err.message);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
        return () => controller.abort();
    }, [nickname, currentUser?.id]);

    const handleAddFriend = async () => {
        if (!profileData?.id) return;
        try {
            setActionLoading(true);
            await friendService.sendRequest(profileData.id);
            toast.success('Friend request sent!');
        } catch (e: any) {
            toast.error(e.message || 'Failed to send request');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemoveFriend = async () => {
        if (!profileData?.id) return;
        try {
            setActionLoading(true);
            await friendService.deleteFriend(profileData.id);
            toast.info('Friend removed');
            setIsFriend(false);
        } catch (e: any) {
            toast.error(e.message || 'Failed to remove friend');
        } finally {
            setActionLoading(false);
        }
    };

    // --- Loading state ---
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50">
                <div className="h-48 sm:h-56 bg-zinc-200 animate-pulse" />
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="w-28 h-28 rounded-full bg-zinc-300 border-4 border-zinc-50 -mt-16 animate-pulse" />
                    <div className="h-5 w-40 bg-zinc-200 rounded-full mt-4 animate-pulse" />
                    <div className="h-4 w-56 bg-zinc-200 rounded-full mt-2 animate-pulse" />
                </div>
            </div>
        );
    }

    // --- Not found state ---
    if (notFound || !profileData) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                    <User className="w-7 h-7 text-zinc-400" />
                </div>
                <h2 className="text-lg font-bold text-zinc-900">Profile not found</h2>
                <p className="text-sm text-zinc-500 mt-1">
                    There's no account with the nickname "{nickname}".
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors"
                >
                    Go back
                </button>
            </div>
        );
    }

    const user = profileData;

    return (
        <div className="min-h-screen bg-zinc-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                <div className="h-48 sm:h-56 rounded-b-md bg-gray-200 relative">
                    <button
                        onClick={() => navigate("/")}
                        className="absolute top-5 left-4 sm:left-6 p-2 bg-black/20 hover:bg-black/30 rounded-full text-white transition-colors backdrop-blur-md"
                    >
                        <ArrowLeft size={20} />
                    </button>
                </div>

                <div className="flex px-12 flex-col sm:flex-row sm:items-end justify-between -mt-16 mb-4 gap-4">
                    {/* Avatar */}
                    <div className="w-30 h-30 z-1 rounded-full overflow-hidden bg-white shadow-xl border-4 border-white shrink-0">
                        <div className="w-full h-full rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 text-xl md:text-3xl font-bold overflow-hidden">
                            {user?.profile ? (
                                <img
                                    src={user.profile}
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                user?.username?.[0]?.toUpperCase() || 'U'
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {isSelf ? (
                            <button
                                onClick={() => navigate('/profile/edit')}
                                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-sm font-medium text-sm transition-colors flex items-center gap-2"
                            >
                                <Pencil className="w-4 h-4" /> Edit Profile
                            </button>
                        ) : isFriend ? (
                            <button
                                disabled={actionLoading}
                                onClick={handleRemoveFriend}
                                className="px-4 py-2 bg-zinc-100 hover:bg-rose-50 hover:text-rose-600 text-zinc-700 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-60"
                            >
                                <UserCheck className="w-4 h-4 text-emerald-500" /> Friend
                            </button>
                        ) : (
                            <button
                                disabled={actionLoading}
                                onClick={handleAddFriend}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shadow-md shadow-indigo-200 disabled:opacity-60"
                            >
                                <UserPlus className="w-4 h-4" /> Add Friend
                            </button>
                        )}
                    </div>
                </div>

                {/* User Details */}
                <div className="px-12">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-2xl font-bold text-zinc-900">{user?.username}</h2>
                        {user?.roles && (
                            <span className="px-2 py-0.5 bg-emerald-100 rounded-md text-emerald-600 text-xs font-semibold">
                                {user.roles}
                            </span>
                        )}
                    </div>
                    {user?.nickname && <p className="text-md text-indigo-500 font-medium mt-0.5">{user.nickname}</p>}
                    {user?.bio && <p className="text-sm text-zinc-600 mt-2 leading-relaxed max-w-2xl">{user.bio}</p>}

                    <div className="flex flex-wrap gap-x-6 gap-y-1.5 mt-4">
                        {user?.email && (
                            <span className="text-sm text-zinc-500 flex items-center gap-1.5">
                                <Mail className="w-4 h-4 text-zinc-400" /> {user.email}
                            </span>
                        )}
                        {user?.phone && (
                            <span className="text-sm text-zinc-500 flex items-center gap-1.5">
                                <Phone className="w-4 h-4 text-zinc-400" /> {user.phone}
                            </span>
                        )}
                        {user?.dob && (
                            <span className="text-sm text-zinc-500 flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-zinc-400" /> {user.dob}
                            </span>
                        )}
                        {user?.gender && (
                            <span className="text-sm text-zinc-500 flex items-center gap-1.5">
                                <User className="w-4 h-4 text-zinc-400" /> {user.gender}
                            </span>
                        )}
                        {user?.address && (
                            <span className="text-sm text-zinc-500 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-zinc-400" /> {user.address}
                            </span>
                        )}
                    </div>
                </div>

                {/* Stats Bar */}
                <div className='px-12'>
                    <div className="flex items-center gap-6 mt-6 py-3 px-4 bg-white rounded-md border border-zinc-100">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-semibold text-zinc-800">{posts.length}</span>
                            <span className="text-xs text-zinc-500">Posts</span>
                        </div>
                    </div>

                </div>
                {/* Posts Feed */}
                <div className="mt-6 px-12">
                    <h3 className="text-base font-bold text-zinc-900 mb-4">Posts</h3>

                    {posts.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-md border border-dashed border-zinc-200">
                            <p className="text-zinc-400 text-sm">No posts shared yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    onClick={() => setActivePost(post)}
                                    className="p-4 rounded-md border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-zinc-900 text-base">{post.title}</h4>
                                        <span className="text-[11px] text-zinc-400 font-medium shrink-0 ml-2">
                                            {post.createdAt}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-600 line-clamp-3 mb-3">{post.content}</p>

                                    {post.image && (
                                        <div className="w-full h-44 rounded-xl overflow-hidden bg-zinc-100 mb-3">
                                            {post.image.endsWith('.mp4') ? (
                                                <video className="w-full h-full object-cover" controls>
                                                    <source src={post.image} type="video/mp4" />
                                                </video>
                                            ) : (
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium pt-2 border-t border-zinc-50">
                                        <span className="flex items-center gap-1">
                                            <Heart
                                                className={`w-3.5 h-3.5 ${post.like ? 'text-rose-500 fill-rose-500' : ''}`}
                                            />{' '}
                                            {post.like || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />{' '}
                                            {post.comments?.length || 0}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Post Detail Overlay */}
            {activePost && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setActivePost(null)}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setActivePost(null)}
                            className="absolute top-4 right-4 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-600 transition-colors"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex justify-between items-start mb-3 pr-8">
                            <h4 className="font-bold text-zinc-900 text-lg">{activePost.title}</h4>
                            <span className="text-xs text-zinc-400 font-medium shrink-0 ml-2 mt-1">
                                {activePost.createdAt}
                            </span>
                        </div>

                        <p className="text-sm text-zinc-600 whitespace-pre-wrap mb-4">{activePost.content}</p>

                        {activePost.image && (
                            <div className="w-full rounded-xl overflow-hidden bg-zinc-100 mb-4">
                                {activePost.image.endsWith('.mp4') ? (
                                    <video className="w-full max-h-96 object-contain" controls autoPlay>
                                        <source src={activePost.image} type="video/mp4" />
                                    </video>
                                ) : (
                                    <img
                                        src={activePost.image}
                                        alt={activePost.title}
                                        className="w-full max-h-96 object-contain"
                                    />
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium pt-3 border-t border-zinc-100">
                            <span className="flex items-center gap-1.5">
                                <Heart
                                    className={`w-4 h-4 ${activePost.like ? 'text-rose-500 fill-rose-500' : ''}`}
                                />{' '}
                                {activePost.like || 0}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4 text-zinc-400" /> {activePost.comments?.length || 0}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDetail;