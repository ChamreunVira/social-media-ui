export type FriendRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface FriendResponse {
    userId: number;
    username: string;
    email?: string;
    profile?: string;
}

export interface FriendSenderResponse {
    id: number; // this is the friend REQUEST id — use this for accept/reject
    sender: FriendResponse;
    status: FriendRequestStatus;
}