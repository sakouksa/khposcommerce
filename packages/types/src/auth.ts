// ─── Authentication, Users, Roles & Permissions ─────────────────────────

export interface Permission {
  id: number
  name: string
  guard_name?: string
  group?: string
}

export interface Role {
  id: number
  name: string
  display_name?: string
  description?: string
  permissions?: Permission[]
}

export interface User {
  id: number
  name: string
  email: string
  phone?: string | null
  avatar?: string | null
  status?: 'active' | 'inactive' | 'suspended'
  roles?: (Role | string)[]
  permissions?: string[]
  company_id?: number | null
  branch_id?: number | null
  branch?: {
    id: number
    name: string
  } | null
  created_at?: string
  updated_at?: string
}

export interface AuthTokens {
  access_token: string
  token_type?: string
  expires_in?: number
  refresh_token?: string
}

export interface LoginResponse {
  user: User
  token: string
  tokens?: AuthTokens
  permissions?: string[]
}
