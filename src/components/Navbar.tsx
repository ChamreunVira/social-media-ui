import { Search, LogOut, Users } from "lucide-react"
import type React from "react"
import { useContext, useRef, useState } from "react"
import { AppContextProvider } from "../context/AppContext"
import { Link, useNavigate } from "react-router-dom"
import { useClickOutside } from "../hooks/useClickOutside"
import { removeToken } from "../utils/tokenManager"

interface NavbarProps {
    onOpenFriends?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenFriends }) => {
    const { userProfile, isLoggedIn, searchQuery, setSearchQuery } = useContext<any>(AppContextProvider);
    const [isDropDownOpen, setIsDropDownOpen] = useState<boolean>(false);
    const dropDownRef = useRef<any>(null);
    const navigate = useNavigate();

    useClickOutside(dropDownRef, () => setIsDropDownOpen(false));

    const handleLogout = async () => {
        removeToken();
        navigate("/login");
        // try {
        //     await atuhService.logout();
        // } catch (e: any) {
        //     console.error("Logout request error:", e);
        // } finally {
        //     localStorage.removeItem("token");
        //     setIsLoggedIn(false);
        //     setUserProfile(null);
        //     setIsDropDownOpen(false);
        //     navigate("/login");
        // }
    }


    return (
        <header className="sticky top-0 left-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
            <nav className="flex app-container justify-between items-center gap-2 py-3">
                <Link to="/" className="font-bold text-xl shrink-0 mr-2 sm:mr-4 tracking-tight">
                    KH <span className="text-indigo-600">SOCIAL</span>
                </Link>

                <div className="relative hidden md:block w-1/3 max-w-md">
                    <div className="text-zinc-400 absolute top-1/2 left-3.5 -translate-y-1/2 pointer-events-none">
                        <Search size={16} />
                    </div>
                    <input 
                        type="text" 
                        value={searchQuery || ""}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-9 pr-4 bg-zinc-100 /80 border border-transparent rounded-full text-xs font-medium focus:bg-white focus:border-indigo-200 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none" 
                        placeholder="Search posts or creators..." 
                    />
                </div>

                {userProfile && isLoggedIn ? (
                    <div className="flex gap-2 sm:gap-3 items-center">
                        {onOpenFriends && (
                            <button
                                type="button"
                                onClick={onOpenFriends}
                                className="xl:hidden inline-flex h-9 items-center gap-2 rounded-full bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                                aria-label="Open friends"
                            >
                                <Users size={16} />
                                <span className="hidden sm:inline">Friends</span>
                            </button>
                        )}
                        <div className="relative" ref={dropDownRef}>
                            <img
                                onClick={() => setIsDropDownOpen(!isDropDownOpen)}
                                src={userProfile.profile}
                                alt="Avatar" 
                                className="w-9 h-9 rounded-full ring-1 ring-indigo-500 object-cover cursor-pointer border border-zinc-200 hover:ring-2 hover:ring-indigo-500/20 transition-all" 
                            />
                            {isDropDownOpen && (
                                <div className="absolute right-0 mt-2 w-48 shadow-lg rounded-2xl bg-white border border-zinc-100 p-2 z-50">
                                    <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                                        <p className="text-xs font-semibold text-zinc-800 truncate">{userProfile.username}</p>
                                        <p className="text-[10px] text-zinc-400 truncate">{userProfile.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                    >
                                        <LogOut size={14} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <Link to="/login">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors">
                            Login
                        </button>
                    </Link>
                )}
            </nav>
        </header>
    )
}

export default Navbar
