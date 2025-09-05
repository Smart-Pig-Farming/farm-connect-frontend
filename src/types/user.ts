export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  role: string;
  permissions: string[];
  organization?: string;
  province?: string;
  district?: string;
  sector?: string;
  points: number;
  level_id: number;
  is_verified: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}
