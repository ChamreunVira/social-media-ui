export interface UserRequest {
    username: string,
    email: string,
    password: string 
}

export type AuthRequest = Omit<UserRequest , "username" | "profile">;

export interface UserResponse extends Omit<UserRequest , "password"> {
    id: number;
    token?: string;
    profile?: string;
    nickname?: string;
    bio?: string;
    dob?: string;
    phone?: string;
    gender?: string;
    address?: string;
    roles?: Array<string>;
    createdAt?: string;
    updatedAt?: string;
}

export type ProfileResponse = Omit<UserResponse , "password" | "token">;

export interface UpdateProfileRequest {
    username?: string;
    nickname?: string;
    bio?: string;
    dob?: string;
    phone?: string;
    gender?: string;
    address?: string;
}