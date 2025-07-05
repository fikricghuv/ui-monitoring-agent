export interface CustomerModel {
  customer_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  customer_type: string;
  registration_date: string;
  last_activity_at?: string;
  address?: string;
  city?: string;
  country?: string;
  metadata?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  conversation_id?: string;
  sender_id?: string;
  source_message?: string;
  other_info?: any;
}
