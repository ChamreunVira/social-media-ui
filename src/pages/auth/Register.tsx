import type React from "react";
import { useRef, useState } from "react";
import type { UserRequest } from "../../types/auth";
import { atuhService } from "../../service/authService";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import defaultProfile from "../../../src/assets/default-profile.jpg";
import { User, Mail, Lock, Eye, EyeOff, Camera, UserPlus, Sparkles } from "lucide-react";

const Register: React.FC = () => {
    const [data, setData] = useState<UserRequest>({
        username: "",
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [image, setImage] = useState<any>(defaultProfile);
    const uploadImageRef = useRef<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleUploadImage = () => {
        if (uploadImageRef.current?.files?.[0]) {
            const file = uploadImageRef.current.files[0];
            const cacheURL = URL.createObjectURL(file);
            setImage(cacheURL);
        }
    };

    const handleRefToFileUpload = (e: React.FormEvent) => {
        e.preventDefault();
        uploadImageRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const form = new FormData();
        form.append("username", data.username);
        form.append("email", data.email);
        if (uploadImageRef.current?.files?.[0]) {
            form.append("profile", uploadImageRef.current.files[0]);
        }
        form.append("password", data.password);

        try {
            const response = await atuhService.register(form);
            if (response.success) {
                toast.success("Account created! Please sign in.");
                navigate("/login");
            }
        } catch (e: any) {
            toast.error("Registration failed. Please check your information.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 relative overflow-hidden">
            {/* Ambient Background Blur Elements */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-white relative z-10 animate-in fade-in duration-300">
                {/* Brand Header */}
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-indigo-500/30">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                        Create Account
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Join our social community today</p>
                </div>

                {/* Profile Image Selector */}
                <div className="mb-6 flex justify-center">
                    <div className="relative group cursor-pointer" onClick={handleRefToFileUpload}>
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 shadow-xl bg-white/10 p-0.5">
                            <img src={image} alt="Profile preview" className="w-full h-full object-cover rounded-full" />
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                        <button
                            type="button"
                            onClick={handleRefToFileUpload}
                            className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg border-2 border-slate-900 transition-colors"
                        >
                            <Camera size={14} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
                    <input ref={uploadImageRef} onChange={handleUploadImage} type="file" hidden accept="image/*" />

                    {/* Username Field */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Username</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="johndoe"
                                onChange={handleChange}
                                name="username"
                                value={data.username}
                                required
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                onChange={handleChange}
                                name="email"
                                value={data.email}
                                required
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                onChange={handleChange}
                                name="password"
                                value={data.password}
                                required
                                className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-6 text-sm"
                    >
                        {loading ? (
                            <span>Creating Account...</span>
                        ) : (
                            <>
                                <span>Sign Up</span>
                                <UserPlus size={18} />
                            </>
                        )}
                    </button>

                    {/* Sign In Link */}
                    <div className="text-center pt-3 border-t border-white/10">
                        <p className="text-xs text-slate-400">
                            Already registered?{" "}
                            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default Register;

