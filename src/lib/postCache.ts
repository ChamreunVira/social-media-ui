import type { CommentResponse } from "../types/comment";
import type { PostResponse } from "../types/post";
import { commentService } from "../service/commentService";
import { postService } from "../service/PostService";

const FEED_STALE_TIME = 2 * 60 * 1000;

let feed: PostResponse[] | null = null;
let feedFetchedAt = 0;
let feedRequest: Promise<PostResponse[]> | null = null;
const commentsByPost = new Map<number, CommentResponse[]>();
const commentRequests = new Map<number, Promise<CommentResponse[]>>();

export const getCachedFeed = async (force = false): Promise<PostResponse[]> => {
    if (!force && feed && Date.now() - feedFetchedAt < FEED_STALE_TIME) return feed;
    if (!force && feedRequest) return feedRequest;

    feedRequest = postService.getAll()
        .then((response) => {
            if (!response.success) throw new Error(response.message || "Unable to load posts");
            feed = response.data ?? [];
            feedFetchedAt = Date.now();
            feed.forEach((post) => {
                if (post.comments) commentsByPost.set(post.id, post.comments);
            });
            return feed;
        })
        .finally(() => {
            feedRequest = null;
        });

    return feedRequest;
};

export const getCachedPost = async (postId: number): Promise<PostResponse> => {
    const cachedPost = feed?.find((post) => post.id === postId);
    if (cachedPost) return cachedPost;

    const response = await postService.getById(postId);
    if (!response.success || !response.data) throw new Error(response.message || "Post not found");
    if (response.data.comments) commentsByPost.set(postId, response.data.comments);
    return response.data;
};

export const getCachedComments = async (
    postId: number,
    initialComments?: CommentResponse[],
    force = false,
): Promise<CommentResponse[]> => {
    if (initialComments && !commentsByPost.has(postId)) {
        commentsByPost.set(postId, initialComments);
    }
    const cachedComments = commentsByPost.get(postId);
    if (!force && cachedComments) return cachedComments;
    const pendingRequest = commentRequests.get(postId);
    if (!force && pendingRequest) return pendingRequest;

    const request = commentService.allComment(postId)
        .then((response) => {
            if (!response.success) throw new Error(response.message || "Unable to load comments");
            const nextComments = response.data ?? [];
            commentsByPost.set(postId, nextComments);
            updateCachedPost(postId, { comments: nextComments });
            return nextComments;
        })
        .finally(() => {
            commentRequests.delete(postId);
        });

    commentRequests.set(postId, request);
    return request;
};

export const updateCachedPost = (postId: number, changes: Partial<PostResponse>) => {
    if (!feed) return;
    feed = feed.map((post) => post.id === postId ? { ...post, ...changes } : post);
};

export const removeCachedPost = (postId: number) => {
    if (feed) feed = feed.filter((post) => post.id !== postId);
    commentsByPost.delete(postId);
};

export const invalidateFeed = () => {
    feedFetchedAt = 0;
};

export const invalidateComments = (postId: number) => {
    commentsByPost.delete(postId);
};
