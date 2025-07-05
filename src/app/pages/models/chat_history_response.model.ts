export interface ChatHistoryResponseModel {
  id: string;
  room_conversation_id: string; 
  sender_id: string; 
  message: string; 
  created_at: string; 
  agent_response_category: string | null; 
  agent_response_latency: string | null;
  agent_total_tokens: number | null; 
  agent_input_tokens: number | null; 
  agent_output_tokens: number | null; 
  agent_other_metrics: { [key: string]: any } | null; 
  agent_tools_call: string[] | null;
  role: 'user' | 'admin' | 'chatbot';
}

/**
 * Model untuk respons riwayat chat user dari server.
 * Sesuai dengan schema UserHistoryResponse dari FastAPI.
 */
export interface UserHistoryResponseModel {
  success: boolean;
  room_id: string; 
  user_id: string;
  total: number;
  history: ChatHistoryResponseModel[]; 
}

export interface PaginatedChatHistoryResponse {
  data: ChatHistoryResponseModel[];
  total: number;
}
