export interface UserModel {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserUpdateModel {
  email?: string;
  full_name?: string;
  is_active?: boolean;
}

export interface UserChangePasswordModel {
    current_password: string;
    new_password: string;
}