export interface UserRow {
  id: string;
  user_name: string;
  user_email: string;
  user_password_hash?: string;
  user_created_at: string;
  user_updated_at?: string;
}
