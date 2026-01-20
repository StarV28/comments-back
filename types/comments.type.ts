export interface WsComment {
  id: number;
  content: string;
  createdAt: string;
  parentId: number | null;
  user: User;
  files: File | null;
  replies?: WsComment[];
}

export type CommentsWs =
  | {
      type: "comment";
      payload: WsComment;
    }
  | {
      type: "replies";
      payload: WsComment;
    }
  | {
      type: "delete";
      payload: {
        id: number;
        parentId: number | null;
      };
    };

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
