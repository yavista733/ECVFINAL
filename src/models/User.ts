export interface User {
  id: number;
  email: string;
  displayName: string;
  department: string;
  role: string;
  avatarUrl: string;
  coverUrl: string;
  followersCount: number;
  followingCount: number;
  communitiesCount: number;
  remoteId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  email: string;
  displayName: string;
  department?: string;
  role?: string;
}

export interface UpdateUserDTO {
  id: number;
  displayName?: string;
  department?: string;
  role?: string;
  avatarUrl?: string;
  coverUrl?: string;
}
