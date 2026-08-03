export type FriendRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface FriendResponse {
    userId: number;
    username: string;
    nickname?: string;
    email?: string;
    profile?: string;
}

export interface FriendSenderResponse {
    id: number;
    sender: FriendResponse;
    status: FriendRequestStatus;
}