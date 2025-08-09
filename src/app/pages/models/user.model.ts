export interface UserModel {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserCreateModel {
  email: string;
  password: string;
  full_name?: string;
  role?: string;
}

export interface UserUpdateModel {
  email?: string;
  full_name?: string;
  is_active?: boolean;
  role?: string;
}

export interface UserChangePasswordModel {
    current_password: string;
    new_password: string;
}

export interface UserListResponse {
  data: UserModel[];
  total_users: number;
}