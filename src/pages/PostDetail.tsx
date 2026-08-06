import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";
import { AppContextProvider } from "../context/AppContext";
import { getCachedPost } from "../lib/postCache";
import type { PostResponse } from "../types/post";

const PostDetail = () => {
    const { id } = useParams();
    const { userProfile } = useContext<any>(AppContextProvider);
    const [post, setPost] = useState<PostResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const postId = Number(id);
        if (!Number.isInteger(postId) || postId <= 0) {
            setError("This post link is not valid.");
            setLoading(false);
            return;
        }

        let active = true;
        getCachedPost(postId)
            .then((nextPost) => active && setPost(nextPost))
            .catch((requestError: Error) => active && setError(requestError.message || "Unable to load this post."))
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, [id]);

    return (
        <main className="min-h-screen">
            <Navbar />
            <section className="app-container mx-auto max-w-4xl py-4 sm:py-8">
                <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-indigo-600">
                    <ArrowLeft className="h-4 w-4" /> Back to feed
                </Link>

                {loading && (
                    <div className="flex min-h-64 items-center justify-center text-indigo-600">
                        <LoaderCircle className="h-7 w-7 animate-spin" />
                    </div>
                )}
                {error && !loading && (
                    <div className="rounded-xl border border-rose-100 bg-white p-8 text-center text-sm text-rose-600">{error}</div>
                )}
                {post && !loading && (
                    <PostCard {...post} profile={userProfile} currentUserId={userProfile?.id} />
                )}
            </section>
        </main>
    );
};

export default PostDetail;
