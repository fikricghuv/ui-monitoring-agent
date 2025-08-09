export interface WebsiteKBInfo {
  id: string;
  url: string;
  status: string;
  created_at: string;
}

export interface WebsiteKBCreateResponse {
  message: string;
  urls: string[];
}