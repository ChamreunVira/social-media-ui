import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { friendService } from "../service/friendService";
import type { FriendResponse, FriendSenderResponse } from "../types/friend";
import { AppContextProvider } from "../context/AppContext";
import { UserPlus, UserCheck, Trash2, Users, Check } from "lucide-react";

interface FriendsProps {
    onSelectUser?: (userId: number) => void;
}

const Friends: React.FC<FriendsProps> = ({ onSelectUser }) => {
    const { userProfile } = useContext<any>(AppContextProvider);
    const [friends, setFriends] = useState<FriendResponse[]>([]);
    const [pending, setPending] = useState<FriendSenderResponse[]>([]);
    const [suggestions, setSuggestions] = useState<FriendResponse[]>([]);
    const [sentRequests, setSentRequests] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAllSuggestions, setShowAllSuggestions] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchFriendsData = async () => {
        if (!userProfile?.id) return;
        try {
            const [friendList, pendingList, suggestionList] = await Promise.all([
                friendService.getFriends(userProfile.id),
                friendService.getPending(userProfile.id),
                friendService.getSuggestions(),
            ]);
            setFriends(friendList ?? []);
            setPending((pendingList ?? []).filter(p => p.status === "PENDING"));
            setSuggestions(suggestionList ?? []);
        } catch (e: any) {
            console.error("Error fetching friend data:", e);
            setFriends([]);
            setPending([]);
            setSuggestions([]);
        }
    };

    useEffect(() => {
        fetchFriendsData();
    }, [userProfile?.id]);

    const handleAccept = async (requestId: number) => {
        setLoading(true);
        try {
            await friendService.accept(requestId);
            toast.success("Friend request accepted!");
            fetchFriendsData();
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.response?.data || e.message || "Failed to accept request";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (requestId: number) => {
        setLoading(true);
        try {
            await friendService.reject(requestId);
            toast.success("Friend request rejected");
            setPending(prev => prev.filter(p => p.id !== requestId));
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.response?.data || e.message || "Failed to reject request";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptAll = async () => {
        if (pending.length === 0) return;
        setLoading(true);
        try {
            await Promise.all(pending.map(p => friendService.accept(p.id)));
            toast.success("Accepted all friend requests!");
            fetchFriendsData();
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.response?.data || e.message || "Failed to accept all requests";
            toast.error(errorMsg);
            fetchFriendsData();
        } finally {
            setLoading(false);
        }
    };

    const handleRejectAll = async () => {
        if (pending.length === 0) return;
        setLoading(true);
        try {
            await Promise.all(pending.map(p => friendService.reject(p.id)));
            toast.success("Rejected all friend requests");
            fetchFriendsData();
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.response?.data || e.message || "Failed to reject all requests";
            toast.error(errorMsg);
            fetchFriendsData();
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (receiverId: number) => {
        try {
            await friendService.sendRequest(receiverId);
            toast.success("Friend request sent!");
            setSentRequests(prev => [...prev, receiverId]);
            setTimeout(() => {
                setSuggestions(prev => prev.filter(s => s.userId !== receiverId));
                setSentRequests(prev => prev.filter(id => id !== receiverId));
            }, 1000);
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.response?.data || e.message || "Failed to send request";
            toast.error(errorMsg);
        }
    };

    const handleRemoveFriend = async (friendId: number) => {
        try {
            await friendService.deleteFriend(friendId);
            toast.info("Friend removed");
            setFriends(prev => prev.filter(f => f.userId !== friendId));
            fetchFriendsData();
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.response?.data || e.message || "Failed to remove friend";
            toast.error(errorMsg);
        }
    };

    const displayedSuggestions = showAllSuggestions ? suggestions : suggestions.slice(0, 5);

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Pending Friend Requests */}
            {pending.length > 0 && (
                <div className="bg-white rounded-md p-4 border border-zinc-100">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-zinc-800 text-sm flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-indigo-600" /> Friend Requests
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={loading}
                                onClick={handleAcceptAll}
                                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition-colors disabled:opacity-50"
                            >
                                Accept All
                            </button>
                            <button
                                disabled={loading}
                                onClick={handleRejectAll}
                                className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-2 py-0.5 rounded-md transition-colors disabled:opacity-50"
                            >
                                Reject All
                            </button>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                                {pending.length}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        {pending.map((req) => (
                            <div key={req.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 transition-colors">
                                <div 
                                    onClick={() => onSelectUser?.(req.sender.userId)}
                                    className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 text-sm font-semibold shrink-0 cursor-pointer overflow-hidden border border-zinc-100"
                                >
                                    {req.sender.profile ? (
                                        <img src={`${apiUrl}/images/${req.sender.profile}`} alt={req.sender.username} className="w-full h-full object-cover" />
                                    ) : (
                                        req.sender.username?.[0]?.toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p 
                                        onClick={() => onSelectUser?.(req.sender.userId)}
                                        className="text-sm font-medium text-zinc-800 truncate cursor-pointer hover:underline"
                                    >
                                        {req.sender.username}
                                    </p>
                                    <div className="flex gap-2 mt-1">
                                        <button
                                            disabled={loading}
                                            onClick={() => handleAccept(req.id)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1 rounded-lg font-medium transition-colors disabled:opacity-50"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            disabled={loading}
                                            onClick={() => handleReject(req.id)}
                                            className="text-xs px-3 py-1 rounded-lg font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Friend Suggestions (Showing at least 5 users) */}
            <div className="bg-white rounded-md p-4 border border-zinc-100">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-zinc-800 text-sm flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-indigo-500" /> Suggested Friends
                    </h3>
                    {suggestions.length > 5 && (
                        <button
                            onClick={() => setShowAllSuggestions(!showAllSuggestions)}
                            className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-0.5"
                        >
                            {showAllSuggestions ? "Less" : `See All (${suggestions.length})`}
                        </button>
                    )}
                </div>

                {suggestions.length === 0 ? (
                    <div className="text-center py-4 px-2">
                        <Users className="w-8 h-8 text-zinc-300 mx-auto mb-1" />
                        <p className="text-zinc-400 text-xs font-medium">No suggestions available right now.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {displayedSuggestions.map((user) => {
                            const isSent = sentRequests.includes(user.userId);
                            return (
                                <div key={user.userId} className="flex items-center justify-between gap-3 p-1.5 rounded-md hover:bg-zinc-50 transition-colors">
                                    <div 
                                        onClick={() => onSelectUser?.(user.userId)}
                                        className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden border border-zinc-100">
                                            {user.profile ? (
                                                <img src={`${apiUrl}/images/${user.profile}`} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                user.username?.[0]?.toUpperCase()
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-zinc-800 truncate hover:text-indigo-600 transition-colors">{user.username}</p>
                                            <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        disabled={isSent}
                                        onClick={() => handleSendRequest(user.userId)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 shrink-0 ${
                                            isSent 
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
                                        }`}
                                        title="Add Friend"
                                    >
                                        {isSent ? (
                                            <>
                                                <Check className="w-3 h-3" />
                                                <span>Sent</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-3 h-3" />
                                                <span>Add</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Friends List */}
            <div className="bg-white rounded-md p-4 border border-zinc-100">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-zinc-800 text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-500" /> Friends
                    </h3>
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs font-semibold rounded-full">
                        {friends.length}
                    </span>
                </div>
                {friends.length === 0 ? (
                    <p className="text-zinc-400 text-xs text-center py-3">No friends yet.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {friends.map((friend) => (
                            <div key={friend.userId} className="flex items-center justify-between gap-3 p-1.5 rounded-md hover:bg-zinc-50 transition-colors group">
                                <div 
                                    onClick={() => onSelectUser?.(friend.userId)}
                                    className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
                                >
                                    <div className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden border border-zinc-100">
                                        {friend.profile ? (
                                            <img src={`${apiUrl}/images/${friend.profile}`} alt={friend.username} className="w-full h-full object-cover" />
                                        ) : (
                                            friend.username?.[0]?.toUpperCase()
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-zinc-800 truncate group-hover:text-indigo-600 transition-colors">{friend.username}</p>
                                </div>
                                <button
                                    onClick={() => handleRemoveFriend(friend.userId)}
                                    className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-rose-500 p-1.5 transition-all rounded-lg hover:bg-rose-50"
                                    title="Remove Friend"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Friends;