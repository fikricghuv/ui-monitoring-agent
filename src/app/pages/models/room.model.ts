
export interface RoomConversationModel {
  id: string; 
  name: string | null; 
  description: string | null; 
  status: string;
  created_at: string; 
  updated_at: string | null; 
  agent_active: boolean;

  lastMessage?: string;
  lastTimeMessage?: string; 
}
