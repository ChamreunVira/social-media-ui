import React, { useContext } from 'react'
import { AppContextProvider } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface ProfileProps {
    onOpenProfile?: (userId: number) => void;
}

const Profile: React.FC<ProfileProps> = () => {
    const { userProfile } = useContext<any>(AppContextProvider);
    const navigate = useNavigate();
    const handleProfileClick = () => {
        navigate(`/${userProfile?.nickname}`, { replace: true })
    }
    return (
        <>
            <div
                onClick={handleProfileClick}
                className="w-full flex items-center space-x-3 bg-white border border-zinc-100 hover:border-indigo-100 rounded-md p-4 cursor-pointer transition-all hover:shadow-md group"
            >
                <div className="w-12 h-12 ring-1 ringh--indigo-500 rounded-full overflow-hidden bg-zinc-100 shrink-0 border border-zinc-100 flex items-center justify-center font-bold text-zinc-600">
                    {userProfile?.profile ? (
                        <img
                            src={`${import.meta.env.VITE_API_URL}/images/${userProfile.profile}`}
                            alt={userProfile.username}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                    ) : (
                        userProfile?.username?.[0]?.toUpperCase() || 'U'
                    )}
                </div>
                <div className="overflow-hidden leading-tight">
                    <h4 className="text-base font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors truncate">{userProfile?.username}</h4>
                    <p className="text-zinc-500 text-xs truncate mt-0.5">{userProfile?.email}</p>
                </div>
            </div>
        </>
    )
}

export default Profile