// TODO: show more detail about user post

import React, { createContext, useEffect, useState } from 'react'
import type { UserResponse } from '../types/auth';
import { atuhService } from '../service/authService';
import { useNavigate } from 'react-router-dom';

export const AppContextProvider = createContext<any | null>(null);
const AppContext: React.FC<React.PropsWithChildren> = ({ children }) => {

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [userProfile, setUserProfile] = useState<UserResponse | null>(null);
    const [isPostModelOpen , setIsPostModelOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const navigate = useNavigate();



    const handleUserProfile = async () => {
        try {
            const response = await atuhService.getProfile();
            if (response.success) {
                console.log(response.data)
                setUserProfile(response.data);
            }
        } catch (e: any) {
            console.log(e);
        }
    }

    const HandleIsUserAuthenticated = async () => {
        const isAuthenticated = await atuhService.isAuthenticated();
        if (isAuthenticated) {
            handleUserProfile();
            setIsLoggedIn(true);
        } else {
            navigate("/login");
        }
    }

    useEffect(() => {
        const abord = new AbortController();
        HandleIsUserAuthenticated();
        return abord.abort();
    }, [isLoggedIn]);

    const contextValue = {
        isLoggedIn, setIsLoggedIn,
        userProfile, setUserProfile,
        isPostModelOpen , setIsPostModelOpen,
        searchQuery, setSearchQuery
    }

    return (
        <AppContextProvider.Provider value={contextValue}>
            {children}
        </AppContextProvider.Provider>
    )
}

export default AppContext
