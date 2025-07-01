export interface CustomerInteraction {
  id: string;
  conversation_id: string;
  customer_id?: string;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  channel: string;
  initial_query?: string;
  total_messages?: number;
  is_handoff_to_agent?: boolean;
  agent_id?: string;
  agent_name?: string;
  conversation_status?: string;
  detected_intent?: string;
  main_topic?: string;
  keywords_extracted?: string[];
  sentiment_score?: number;
  product_involved?: string;
  customer_feedback_id?: number;
  customer_feedback_score?: number;
  customer_feedback_comment?: string;
  feedback_submitted?: boolean;
  others_information?: any;
  created_at: string;
  updated_at: string;
}

export interface PaginatedCustomerInteractionResponse {
  total: number;
  data: CustomerInteraction[];
}

export interface CustomerInteractionModel {
  id: string;
  customer_id?: string;
  start_time: string;
  end_time?: string;
  channel: string;
  total_messages: number;
  conversation_status?: string;
  sentiment_score?: number;
  product_involved?: string;
  created_at: string;
  updated_at: string;
}

