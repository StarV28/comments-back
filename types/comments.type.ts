export interface CommentsWs {
  type: string;
  payload: {
    id: number;
    content: string;
    createdAt: string;
    userId: number;
    parentId: number | null;
    user: User;
    files: File | null;
    replies?: Comment[];
  };
}

export type File = {
  id: number;
  type: string;
  path: string;
  url: string;
  originalName: string;
  size: number;
  width: number | null;
  height: number | null;
  commentId: number;
};

export type User = {
  id: number;
  username: string;
  email: string;
};

export type Comment = {
  id: number;
  content: string;
  createdAt: string;
  userId: number;
  parentId: number | null;
  user: User;
  file: File | null;
};
