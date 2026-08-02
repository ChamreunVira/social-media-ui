import { useContext, useEffect, useState } from "react"
import { postService } from "../service/PostService";
import { friendService } from "../service/friendService";
import { toast } from "react-toastify";
import type { PostResponse } from "../types/post";
import type { FriendResponse, FriendSenderResponse } from "../types/friend";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import PostCard from "../components/posts/PostCard";
import Profile from "../components/Profile";
import { AppContextProvider } from "../context/AppContext";
import { Mosaic } from "react-loading-indicators";
import PostModelPost from "../components/posts/PostModel.tsx";
import Friends from "../components/Friends.tsx";
import UserProfileModal from "../components/profile/UserProfileModal.tsx";

const Home = () => {
    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [friends, setFriends] = useState<FriendResponse[]>([]);
    const [pending, setPending] = useState<FriendSenderResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const { userProfile, isPostModelOpen, setIsPostModelOpen, searchQuery } = useContext<any>(AppContextProvider);

    const handleFetchPost = async () => {
        setLoading(true);
        try {
            const response = await postService.getAll();
            if (response.success) {
                setPosts(response.data);
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    }

    const fetchFriendsData = async () => {
        if (!userProfile?.id) return;
        try {
            const [friendList, pendingList] = await Promise.all([
                friendService.getFriends(userProfile.id),
                friendService.getPending(userProfile.id)
            ]);
            setFriends(friendList || []);
            setPending(pendingList || []);
        } catch (e) {
            console.error("Error loading friend relations:", e);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        handleFetchPost();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (userProfile?.id) {
            fetchFriendsData();
        }
    }, [userProfile?.id]);

    const friendUserIds = friends.map(f => f.userId);
    const pendingSenderIds = pending.map(p => p.sender.userId);

    const filteredPosts = posts.filter(post => {
        if (!searchQuery || searchQuery.trim() === "") return true;
        const q = searchQuery.toLowerCase();
        return (
            post.title?.toLowerCase().includes(q) ||
            post.content?.toLowerCase().includes(q) ||
            post.author?.username?.toLowerCase().includes(q)
        );
    });

    return (
        <main className="w-full relative">
            <div className={`${loading && ('fixed inset-0 z-50 bg-black/40 w-full h-screen flex justify-center items-center')}`}>
                {loading && (<Mosaic color="#3e59f8" size="large" text="" textColor="" />)}
            </div>
            <div className="w-full">
                <Navbar />
                <section className="flex justify-center gap-6 app-container pt-6 pb-10">
                    {/* Left Sidebar - Hidden on Mobile/Tablet */}
                    <aside className="hidden lg:flex w-72 flex-col gap-y-6 sticky top-24 h-fit shrink-0">
                        {/* profile */}
                        <Profile onOpenProfile={(id) => setSelectedUserId(id)} />
                        {/* side bar all item list */}
                        <Sidebar />
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 max-w-2xl w-full mx-auto flex flex-col gap-6">
                        {/* Create Post Widget */}
                        <div className="w-full bg-white rounded-2xl shadow-sm border border-zinc-100 p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/images/${userProfile?.profile}`}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full object-cover border border-zinc-100 cursor-pointer hover:opacity-90"
                                    onClick={() => userProfile?.id && setSelectedUserId(userProfile.id)}
                                />
                                <div
                                    onClick={() => setIsPostModelOpen(true)}
                                    className="flex-1 bg-zinc-100 hover:bg-zinc-200/70 transition-colors rounded-full px-4 py-2.5 cursor-pointer text-zinc-500 text-sm font-medium"
                                >
                                    What is on your mind, {userProfile?.username}?
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-zinc-50">
                                <button 
                                    onClick={() => setIsPostModelOpen(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-50 text-zinc-600 text-sm font-medium transition-colors"
                                >
                                    <span className="text-xl">🖼️</span> Photo/Video
                                </button>
                                <button
                                    onClick={() => setIsPostModelOpen(true)}
                                    className="btn px-6 py-1.5 rounded-lg font-medium text-sm transition-all"
                                >
                                    Post
                                </button>
                            </div>
                        </div>

                        {/* Posts Feed */}
                        <div className="flex flex-col gap-4">
                            {filteredPosts.map((post, i) => (
                                <PostCard
                                    key={i}
                                    profile={userProfile}
                                    id={post.id}
                                    title={post.title}
                                    content={post.content}
                                    image={post.image}
                                    author={post.author}
                                    comments={post.comments}
                                    like={post.like}
                                    likeByMe={post.likeByMe}
                                    createdAt={post.updatedAt}
                                    updatedAt={post.updatedAt}
                                    onSelectAuthor={(authorId) => setSelectedUserId(authorId)}
                                    currentUserId={userProfile?.id}
                                    isFriend={friendUserIds.includes(post.author.userId)}
                                    isPending={pendingSenderIds.includes(post.author.userId)}
                                />
                            ))}
                            {filteredPosts.length === 0 && !loading && (
                                <div className="text-center py-20 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                                    <p className="text-zinc-400 text-sm">
                                        {searchQuery ? `No posts matching "${searchQuery}"` : "No posts yet. Be the first to post!"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Sponsored & Friends */}
                    <aside className="hidden xl:flex w-80 flex-col gap-y-4 sticky top-24 h-fit shrink-0">
                        {/* Friends Component (Suggestions, Requests, Friends list) */}
                        <Friends onSelectUser={(id) => setSelectedUserId(id)} />

                        {/* Sponsor/Extras */}
                        <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 text-center">
                            <p className="text-zinc-400 text-xs font-medium mb-2">Sponsored</p>
                            <div className="w-full aspect-video bg-zinc-200 rounded-lg mb-3 overflow-hidden">
                                <img src="../../src/assets/img.png" alt="sponsored" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="font-semibold text-zinc-800 text-sm">Amazing Product</h3>
                            <p className="text-xs text-zinc-500 mt-1">Check out this incredible thing that will change your life.</p>
                        </div>

                        <div className="text-xs text-zinc-400 text-center pb-4">
                            &copy; 2026 KH SOCIAL. All rights reserved.
                        </div>
                    </aside>
                </section>
            </div>
            {isPostModelOpen && <PostModelPost onPostCreated={handleFetchPost} />}
            {selectedUserId && (
                <UserProfileModal
                    userId={selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                />
            )}
        </main>
    )
}

export default Home
