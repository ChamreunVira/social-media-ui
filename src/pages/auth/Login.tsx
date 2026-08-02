import type React from "react";
import { useContext, useState } from "react";
import type { AuthRequest } from "../../types/auth";
import { atuhService } from "../../service/authService";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { AppContextProvider } from "../../context/AppContext";
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles } from "lucide-react";

const Login: React.FC = () => {
    const [data, setData] = useState<AuthRequest>({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { setIsLoggedIn, setUserProfile } = useContext<any>(AppContextProvider);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await atuhService.login(data);
            if (response.success) {
                setIsLoggedIn(true);
                setUserProfile(response.data);
                toast.success("Welcome back!");
                navigate("/");
            }
        } catch (e: any) {
            toast.error("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="min-h-screen w-full flex items-center justify-center bg-white p-4 relative overflow-hidden">
            {/* Ambient Background Blur Elements */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl p-8 text-white relative z-10 animate-in fade-in duration-300">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">
                        KH <span className="text-indigo-500">SOCIAL</span>
                    </h1>
                    <h2 className="font-semibold text-slate-600 mt-2">សូមស្វាគមន៍ត្រឡប់មកវិញ</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Field */}
                    <div>
                        <label className="block text-md font-semibold text-slate-600 tracking-wider mb-2">អ៊ីម៉ែល</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                onChange={handleChange}
                                name="email"
                                value={data.email}
                                required
                                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-md text-black font-semibold placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-md font-semibold text-slate-600 tracking-wider mb-2">ពាក្យសម្ងាត់</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                onChange={handleChange}
                                name="password"
                                value={data.password}
                                required
                                className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-md text-black font-semibold placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-3.5 px-4 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-6"
                    >
                        {loading ? (
                            <span className="text-sm">កុំពុងចូល...</span>
                        ) : (
                            <>
                                <span>ចូលគណនី</span>
                                <LogIn size={18} />
                            </>
                        )}
                    </button>

                    {/* Sign Up Link */}
                    <div className="text-center pt-4 border-t border-white/10">
                        <p className="text-md text-slate-400">
                            គ្មានគណនី?{" "}
                            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                                បង្កើតគណនី
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default Login;

