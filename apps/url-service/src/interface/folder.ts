export interface CreateFolderRequest {
  name: string;
}

export interface UpdateFolderRequest {
  name: string;
}

export interface AddUrlToFolderRequest {
  urlId: number;
}

export interface RemoveUrlFromFolderRequest {
  urlId: number;
}

export interface FolderResponse {
  id: string;
  name: string;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface FolderWithUrlsResponse {
  id: string;
  name: string;
  createdAt: Date;
  urls: {
    id: number;
    name: string;
    originalUrl: string;
    shortUrl: string;
    createdAt: Date;
  }[];
}
