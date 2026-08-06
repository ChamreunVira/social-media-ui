import React, { useContext, useEffect, useMemo, useRef, useState } from "react"
import type { PostRequest } from "../types/post"
import { X, Loader2, Send } from "lucide-react"
import { AppContextProvider } from "../context/AppContext"
import FileDropzone from "./FileDropzone"
import { useClickOutside } from "../hooks/useClickOutside"
import { toast } from "react-toastify"
import { postService } from "../service/PostService"

interface PostModelProps {
  onPostCreated?: () => void;
}

const PostModelPost: React.FC<PostModelProps> = ({ onPostCreated }) => {

  const [data, setData] = useState<PostRequest>({
    title: "",
    content: "",
  });

  const { setIsPostModelOpen } = useContext<any>(AppContextProvider);
  const modelRef = useRef<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);

  useEffect(() => () => previews.forEach(({ url }) => URL.revokeObjectURL(url)), [previews]);

  const handleFilesUpload = (newFiles: File[]) => {
    setFiles((currentFiles) => [...currentFiles, ...newFiles]);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  }

  const removeFile = (index: number) => {
    setFiles((currentFiles) => currentFiles.filter((_, fileIndex) => fileIndex !== index));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.title.trim() && !data.content.trim() && files.length === 0) return;

    setIsLoading(true);
    const form = new FormData();
    form.append("title", data.title);
    form.append("content", data.content);
    files.forEach((file) => form.append("files", file));

    try {
      const response = await postService.create(form);
      if (response.success) {
        setIsPostModelOpen(false);
        toast.success("Post create successfully.");
        if (onPostCreated) {
          onPostCreated();
        }
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  useClickOutside(modelRef, () => {
    setIsPostModelOpen(false);
  })

  return (
    <section className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        ref={modelRef}
        className="w-full max-w-xl p-6 bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-zinc-100 bg-zinc-50/50">
          <h1 className="text-xl font-bold text-indigo-500">Create Post</h1>
          <button
            onClick={() => setIsPostModelOpen(false)}
            className="p-2 rounded-full hover:bg-zinc-200 text-zinc-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-0">

          <div className="p-6 pb-2 space-y-4">
            {/* Title Input */}
            <div className="group">
              <input
                type="text"
                name="title"
                value={data.title}
                onChange={handleChange}
                placeholder="ចំណងជើង..."
                className="w-full px-3 py-1.5 text-lg placeholder:text-zinc-400 border-none focus:ring-0 p-0 bg-transparent text-zinc-800"
              />
            </div>

            {/* Content Textarea */}
            <div className="min-h-50">
              <textarea
                name="content"
                value={data.content}
                onChange={handleChange}
                placeholder="អត្ថបទអំពីអ្វីដែលអ្នកចង់ចែករំលែក..."
                className="w-full h-full min-h-50 p-3 resize-none text-base text-zinc-600 placeholder:text-zinc-400 border-none focus:ring-0 bg-transparent"
              ></textarea>
            </div>

            {previews.length > 0 && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {previews.map(({ file, url }, index) => (
                  <div key={url} className="relative aspect-square overflow-hidden rounded-md border border-zinc-100 bg-zinc-100 group">
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 z-10 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={16} />
                    </button>
                    {file.type.startsWith("video/") ? (
                      <video controls className="h-full w-full object-cover bg-black" src={url} />
                    ) : (
                      <img className="h-full w-full object-cover" src={url} alt={file.name} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="border-2 border-dashed border-zinc-200 rounded-md hover:border-indigo-400/50 hover:bg-indigo-50/30 transition-colors">
              <FileDropzone sendFiles={handleFilesUpload} isMinimal={true} />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-xs text-zinc-400 font-medium px-2 py-1 bg-zinc-100 rounded-md">
                បន្ថែមទៅក្នុង post របស់អ្នក
              </div>
            </div>

            <button
              type="submit"
              disabled={(!data.title && !data.content && files.length === 0) || isLoading}
              className={`
                    flex items-center space-x-2 px-6 py-2.5 rounded-md font-medium text-sm transition-all
                    ${(!data.title && !data.content && files.length === 0) || isLoading
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-200 hover:shadow-xl'}
                `}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>កុំពុងបង្ហោះ...</span>
                </>
              ) : (
                <>
                  <span className="text-md font-semibold">បង្ហោះ</span>
                  <Send size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default PostModelPost
