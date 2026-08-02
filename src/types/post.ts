import type { UserResponse } from "./auth";
import type { CommentResponse } from "./comment";

export interface PostResponse {
    id: number,
    title: string,
    profile: UserResponse,
    content: string,
    image: string,
    author: {
        userId: number,
        username: string,
        profile: string
    },
    comments?: CommentResponse[],
    like: number,
    likeByMe: boolean
    createdAt: string,
    updatedAt: string
};



export type Posts = Partial<PostResponse>;

export type PostRequest = Pick<PostResponse , "title" | "content">;

export type PostUpdate = Partial<PostRequest>;