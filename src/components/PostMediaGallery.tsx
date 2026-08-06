import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

interface PostMediaGalleryProps {
    postId?: number;
    images?: string[];
    image?: string;
    title: string;
    className?: string;
}

const isVideo = (source: string) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(source);

const PostMediaGallery: React.FC<PostMediaGalleryProps> = ({ postId, images, image, title, className = "" }) => {
    const media = useMemo(() => images?.length ? images : image ? [image] : [], [images, image]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const navigate = useNavigate();

    if (media.length === 0) return null;

    const showPrevious = () => setActiveIndex((index) => index === null ? null : (index - 1 + media.length) % media.length);
    const showNext = () => setActiveIndex((index) => index === null ? null : (index + 1) % media.length);
    const visibleMedia = media.slice(0, 4);

    return (
        <>
            <div className={`overflow-hidden rounded-xl border border-zinc-100 bg-zinc-100 ${className}`}>
                <div className={media.length === 1 ? "" : "grid grid-cols-2 gap-0.5"}>
                    {visibleMedia.map((source, index) => {
                        const isLastVisible = index === 3 && media.length > 4;
                        return (
                            <button
                                type="button"
                                key={source}
                                onClick={() => navigate(`/posts/${postId}`)}
                                // onClick={() => setActiveIndex(index)}
                                className={`relative block overflow-hidden bg-zinc-900 ${media.length === 3 && index === 0 ? "row-span-2" : ""} ${media.length === 1 ? "w-full" : "aspect-square"}`}
                                aria-label={`Open media ${index + 1} of ${media.length}`}
                            >
                                {isVideo(source) ? (
                                    <video className="h-full w-full object-cover" preload="metadata" muted>
                                        <source src={source} />
                                    </video>
                                ) : (
                                    <img src={source} alt={`${title} ${index + 1}`} className={`h-full w-full object-cover ${media.length === 1 ? "max-h-128" : ""}`} />
                                )}
                                {isLastVisible && (
                                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-3xl font-semibold text-white">
                                        +{media.length - 4}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {activeIndex !== null && (
                <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Post media viewer">
                    <button type="button" onClick={() => setActiveIndex(null)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Close media viewer">
                        <X className="h-6 w-6" />
                    </button>
                    {media.length > 1 && (
                        <button type="button" onClick={showPrevious} className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-6" aria-label="Previous media">
                            <ChevronLeft className="h-7 w-7" />
                        </button>
                    )}
                    {isVideo(media[activeIndex]) ? (
                        <video controls autoPlay className="max-h-[85vh] max-w-full rounded-lg">
                            <source src={media[activeIndex]} />
                        </video>
                    ) : (
                        <img src={media[activeIndex]} alt={`${title} ${activeIndex + 1}`} className="max-h-[85vh] max-w-full rounded-lg object-contain" />
                    )}
                    {media.length > 1 && (
                        <button type="button" onClick={showNext} className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-6" aria-label="Next media">
                            <ChevronRight className="h-7 w-7" />
                        </button>
                    )}
                </div>
            )}
        </>
    );
};

export default PostMediaGallery;
