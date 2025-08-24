
export interface Prompt {
  id?: string; 
  name: string;
  name_agent: string;
  description_agent: string;
  style_communication: string;
  prompt_system: string;
  goal?: string;
  expected_output?: string;
  created_at?: string;
  updated_at?: string;
}
