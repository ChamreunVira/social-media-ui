import { api } from "../lib/axios";
import type { ApiResponse } from "../types/api";
import type { UpdateProfileRequest, UserResponse } from "../types/auth";

class UserService {
  private endpoint: string = "/users";

  public async getProfile(): Promise<ApiResponse<UserResponse>> {
    return api.get(`${this.endpoint}/profile`);
  }

  public async getByNickname(
    nickname: string,
  ): Promise<ApiResponse<UserResponse>> {
    const cleanNickname = nickname.startsWith("@")
      ? nickname.slice(1)
      : nickname;
    return api.get(`${this.endpoint}/by-nickname/${cleanNickname}`);
  }

  public async updateProfile(data: UpdateProfileRequest) {
    console.log("Sending data:", data);

    const response = await api.put(`${this.endpoint}/profile`, data);

    console.log("Response:", response);

    return response.data;
  }
}

export const userService = new UserService();
