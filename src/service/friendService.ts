import { api } from "../lib/axios";
import type { FriendResponse, FriendSenderResponse } from "../types/friend";

export const friendService = {
  sendRequest: async (receiverId: number): Promise<string> =>
    (await api.post(`/friends/request/${receiverId}`)) as unknown as string,

  accept: async (requestId: number): Promise<string> =>
    (await api.post(`/friends/accept/${requestId}`)) as unknown as string,

  reject: async (requestId: number): Promise<string> =>
    (await api.post(`/friends/reject/${requestId}`)) as unknown as string,

  getFriends: async (userId: number): Promise<FriendResponse[]> =>
    ((await api.get(`/friends/${userId}`)) as unknown as FriendResponse[]) || [],

  getPending: async (userId: number): Promise<FriendSenderResponse[]> =>
    ((await api.get(`/friends/pending/${userId}`)) as unknown as FriendSenderResponse[]) || [],

  getSuggestions: async (): Promise<FriendResponse[]> =>
    ((await api.get('/friends/suggestions')) as unknown as FriendResponse[]) || [],

  deleteFriend: async (friendId: number): Promise<string> =>
    (await api.delete(`/friends/${friendId}`)) as unknown as string,
};


