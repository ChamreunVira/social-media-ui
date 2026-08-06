import type React from "react"
import { X, Send } from "lucide-react"
import type { PostResponse } from "../types/post";
import { useEffect, useState } from "react";
import type { ComemntRequest, CommentResponse } from "../types/comment";
import { commentService } from "../service/commentService";
import { getCachedComments, invalidateComments } from "../lib/postCache";
import PostMediaGallery from "./PostMediaGallery";

interface PopupPostProps {
    post: PostResponse;
    onClose: () => void;
    onCommentsChanged?: (comments: CommentResponse[]) => void;
}

const PopupPostComment: React.FC<PopupPostProps> = ({ post, onClose, onCommentsChanged }) => {
    const { id, title, content, image, images, author, createdAt, updatedAt } = post;

    const [data, setData] = useState<ComemntRequest>({
        content: "",
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [comments, setComments] = useState<CommentResponse[]>([]);

    const handlePostComment = async () => {
        if (!data.content.trim()) return;
        try {
            setIsLoading(true);
            const response = await commentService.comment(id, data);
            if (response.success) {
                setData({ content: "" });
                invalidateComments(id);
                await handleFetchComment(id, true);
            }
        } catch (e: any) {
            console.log("error posting comment", e);
        } finally {
            setIsLoading(false);
        }
    }

    const handleFetchComment = async (id: number, force = false) => {
        try {
            const nextComments = await getCachedComments(id, post.comments, force);
            setComments(nextComments);
            onCommentsChanged?.(nextComments);
        } catch (e) {
            console.log("error fetching comments", e);
        }
    }

    useEffect(() => {
        handleFetchComment(id);
    }, [id]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handlePostComment();
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 rounded-full text-zinc-600 transition-colors z-20 backdrop-blur-md"
                >
                    <X size={20} />
                </button>
                {/* Scrollable Content */}
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    <PostMediaGallery images={images} image={image} title={title} className="rounded-none border-x-0 border-t-0" />

                    <div className="p-6">
                        {/* Author Info */}
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-200 shrink-0 border border-zinc-100 flex items-center justify-center font-bold text-zinc-600">
                                {author.profile ? (
                                    <img
                                        src={author.profile}
                                        alt={author.username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    author.username?.[0]?.toUpperCase() || 'U'
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-zinc-900 leading-tight">{author.username}</h3>
                                <p className="text-xs text-zinc-500 mt-0.5">{updatedAt || createdAt}</p>
                            </div>
                        </div>

                        {/* Title & Content */}
                        <h2 className="text-2xl font-bold text-zinc-900 mb-3">{title}</h2>
                        <div className="text-zinc-700 leading-relaxed whitespace-pre-wrap mb-8 text-[0.95rem]">
                            {content}
                        </div>

                        <div className="border-t border-zinc-100 my-6"></div>

                        {/* Comments Section */}
                        <div className="space-y-6">
                            <h3 className="font-semibold text-zinc-900 flex items-center">
                                Comments
                                <span className="ml-2 px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full text-xs font-medium">
                                    {comments?.length || 0}
                                </span>
                            </h3>

                            <div className="space-y-5">
                                {comments && comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex space-x-3">
                                            {/* Avatar for commenter */}
                                            <div className="w-8 h-8 ring-1 ring-indigo-500 shrink-0 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                                                {comment.profile || comment.image ? (
                                                    <img src={comment.profile || comment.image} className="w-full h-full object-cover" />
                                                ) : (
                                                    comment.username?.[0]?.toUpperCase() || 'U'
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="bg-zinc-50 p-3 rounded-2xl rounded-tl-none border border-zinc-100">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <span className="font-semibold text-sm text-zinc-900">{comment.username}</span>
                                                    </div>
                                                    <p className="text-sm text-zinc-700 leading-relaxed">{comment.content}</p>
                                                </div>
                                                <div className="mt-1 ml-2">
                                                    <span className="text-[10px] text-zinc-400 font-medium">{comment.createAt}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
                                        <p className="text-zinc-400 text-sm">No comments yet. Be the first to comment!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comment Input Footer */}
                <div className="p-4 border-t border-zinc-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                    <div className="flex space-x-3">
                        <div className="flex-1 relative">
                            <input
                                value={data.content}
                                onChange={(e) => setData({ content: e.target.value })}
                                onKeyDown={handleKeyDown}
                                type="text"
                                placeholder="Add a comment..."
                                className="w-full bg-zinc-50 border-zinc-200 hover:bg-zinc-100 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-zinc-400 border"
                            />
                        </div>
                        <button
                            disabled={isLoading || !data.content.trim()}
                            onClick={handlePostComment}
                            className="px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center shrink-0 font-medium text-sm">
                            {isLoading ? "Posting..." : "Post"} <Send size={16} className="ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PopupPostComment
