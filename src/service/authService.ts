import { api } from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { AuthRequest, UserRequest, UserResponse } from "../types/auth";

class AuthService {
    private endpoint: string;
    public constructor(endpoint : string) {
        this.endpoint = endpoint;
    }
    public register(data: any): Promise<ApiResponse<UserResponse>> {
        return api.post(`${this.endpoint}/register` , data);
    }

    public login(data: AuthRequest): Promise<ApiResponse<UserRequest>> {
        return api.post(`${this.endpoint}/login` , data);
    }

    public logout(): Promise<null> {
        return api.post(`${this.endpoint}/logout`);
    }

    public getProfile(): Promise<ApiResponse<UserResponse>> {
        return api.get(`${this.endpoint}/profile`);
    }

    public getUserById(userId: number): Promise<ApiResponse<UserResponse>> {
        return api.get(`${this.endpoint}/user/${userId}`);
    }
    
    public isAuthenticated(): Promise<boolean> {
        return api.get(`${this.endpoint}/is-authenticated`);
    }
}

export const atuhService = new AuthService("/auth");