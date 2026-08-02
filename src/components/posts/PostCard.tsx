import { AlertTriangle, Heart, MessageCircleMore, MoreVertical, UserPlus2, UserCheck, Clock } from "lucide-react"
import type React from "react"
import type { PostResponse } from "../../types/post";
import { useState } from "react";
import { postService } from "../../service/PostService";
import { toast } from "react-toastify";
import PopupPostComment from "./CommentModal.";
import { friendService } from "../../service/friendService";
import { useNavigate } from "react-router-dom";

interface PostCardProps extends PostResponse {
    onSelectAuthor?: (authorId: number) => void;
    isFriend?: boolean;
    isPending?: boolean;
    currentUserId?: number;
}

const PostCard: React.FC<PostCardProps> = ({ id, profile, title, content, image, author, comments, like, likeByMe, createdAt, updatedAt, onSelectAuthor, isFriend, isPending, currentUserId }) => {

    const [isLike, setIsLike] = useState<boolean | undefined>(likeByMe);
    const [likeCount, setLikeCount] = useState<number>(like);
    const [comment, setComment] = useState<boolean>(false);
    const [commentCount, setCommentCount] = useState<number>(comments?.length || 0);
    const navigate = useNavigate();

    const handleDeletePost = async (id: number) => {
        try {
            const response = await postService.delete(id);
            if (response.success) {
                toast.success("Post deleted successfully.");
            } else {
                toast.error("You don't have permission to delete this post.");
            }
        } catch (e) {
            console.log(e);
        }
    }

    const handleLike = async (id: number) => {
        const prevIsLike: boolean | undefined = isLike;
        const prevLikeCount: number | undefined = likeCount;
        setLikeCount(prev => prevIsLike ? prev - 1 : prev + 1);
        setIsLike(!isLike);
        try {
            postService.toggleLike(id);
        } catch (e) {
            setIsLike(prevIsLike);
            setLikeCount(prevLikeCount);
            console.log(e);
        }
    }

    const handleSendFriendRequest = async (id: number) => {
        try {
            const message = await friendService.sendRequest(id);
            toast.success(message || "Friend request sent successfully.");
        } catch (e: any) {
            toast.error(e.response?.data?.message || e.response?.data || e.message || "Could not send friend request");
        }
    }

    const isSelf = currentUserId ? author?.userId === currentUserId : author?.userId === profile?.id;

    return (
        <>
            <div className="w-full flex flex-col *:mb-4 z-0 bg-white border border-zinc-100 hover:shadow-md transition-shadow rounded-md p-6 mb-4">
                <div className="flex items-center justify-between">
                    <div
                        onClick={() => navigate(`/${author?.nickname}`)}
                        className="flex space-x-3 items-center cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-200 shrink-0 border border-zinc-100 flex items-center justify-center font-bold text-zinc-600">
                            {author?.profile ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/images/${author.profile}`}
                                    alt={author.username}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                            ) : (
                                author?.username?.[0]?.toUpperCase() || 'U'
                            )}
                        </div>
                        <div className="leading-tight">
                            <h4 className="text-zinc-900 font-semibold text-sm group-hover:underline">{author?.username}</h4>
                            <p className="text-zinc-400 text-xs mt-0.5">{updatedAt ? updatedAt : createdAt}</p>
                        </div>
                    </div>

                    {isSelf ? (
                        <button
                            onClick={() => handleDeletePost(id)}
                            className="rounded-full text-zinc-500 p-1.5 hover:bg-zinc-100 transition-colors"
                            title="Delete Post"
                        >
                            <MoreVertical size={18} />
                        </button>
                    ) : isFriend ? (
                        <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-600 rounded-full flex items-center gap-1 border border-emerald-100">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Friend</span>
                        </span>
                    ) : isPending ? (
                        <span className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-600 rounded-full flex items-center gap-1 border border-amber-100">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending</span>
                        </span>
                    ) : (
                        <button
                            onClick={() => handleSendFriendRequest(author.userId)}
                            className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1"
                            title="Add Friend"
                        >
                            <UserPlus2 size={15} />
                            <span>Add</span>
                        </button>
                    )}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 mb-1">{title}</h2>
                    <p className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
                </div>
                {image && (
                    <div className="max-h-96 bg-zinc-900/5 rounded-xl overflow-hidden border border-zinc-100 flex items-center justify-center">
                        {image.endsWith(".mp4") ? (
                            <video
                                controls
                                className="w-full max-h-96 object-contain"
                                preload="metadata"
                            >
                                <source src={`${import.meta.env.VITE_API_URL}/images/${image}`} type="video/mp4" />
                            </video>
                        ) : (
                            <img
                                src={`${import.meta.env.VITE_API_URL}/images/${image}`}
                                alt={title}
                                className="w-full max-h-96 object-contain hover:scale-102 transition-transform duration-200 cursor-pointer"
                            />
                        )}
                    </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-zinc-50">
                    <button
                        onClick={() => handleLike(id)}
                        className={`${isLike ? "text-rose-500 font-semibold" : "text-zinc-600"} hover:text-rose-500 flex items-center gap-1.5 transition-colors text-sm`}>
                        <Heart size={20} className={isLike ? "fill-rose-500" : ""} />
                        <span>{likeCount}</span>
                    </button>
                    <button
                        onClick={() => setComment(true)}
                        className="text-zinc-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors text-sm">
                        <MessageCircleMore size={20} />
                        <span>{commentCount}</span>
                    </button>
                    <button className="text-zinc-400 hover:text-amber-500 transition-colors">
                        <AlertTriangle size={18} />
                    </button>
                </div>
            </div>

            {comment && (
                <PopupPostComment
                    post={{ id, profile, title, content, image, author, like: likeCount, likeByMe: !!isLike, createdAt, updatedAt }}
                    onClose={() => {
                        setComment(false);
                    }}
                />
            )}
        </>
    )
}

export default PostCard
