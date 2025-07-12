export interface UserActivityLogModel {
  id: string;
  user_id: string;
  endpoint: string;
  method: string;
  request_data: any;
  response_data: any;
  status_code: number;
  timestamp: string;
}
