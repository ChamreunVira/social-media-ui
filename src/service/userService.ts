import { api } from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { UpdateProfileRequest, UserResponse } from "../types/auth";

class UserService {
    private endpoint: string = "/users";

    public getProfile(): Promise<ApiResponse<UserResponse>> {
        return api.get(`${this.endpoint}/profile`);
    }

    public getByNickname(nickname: string): Promise<ApiResponse<UserResponse>> {
        const cleanNickname = nickname.startsWith("@") ? nickname.slice(1) : nickname;
        return api.get(`${this.endpoint}/by-nickname/${cleanNickname}`);
    }

    public updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserResponse>> {
        return api.put(`${this.endpoint}/profile`, data);
    }
}

export const userService = new UserService();
