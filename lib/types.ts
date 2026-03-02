export type CheckFrequency = 'hourly' | 'daily' | 'weekly'
export type PageStatus = 'active' | 'paused' | 'error'
export type AlertType = 'email' | 'webhook'
export type ChangeStatus = 'unread' | 'read'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  plan: 'free' | 'starter' | 'pro' | 'business'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  pages_limit: number
  created_at: string
}

export interface MonitoredPage {
  id: string
  user_id: string
  url: string
  name: string
  check_frequency: CheckFrequency
  status: PageStatus
  css_selector: string | null
  ignore_patterns: string[] | null
  last_checked_at: string | null
  last_changed_at: string | null
  content_hash: string | null
  check_count: number
  change_count: number
  error_message: string | null
  created_at: string
}

export interface PageSnapshot {
  id: string
  page_id: string
  content_hash: string
  content_text: string | null
  content_length: number
  created_at: string
}

export interface PageChange {
  id: string
  page_id: string
  old_snapshot_id: string | null
  new_snapshot_id: string
  diff_summary: string | null
  lines_added: number
  lines_removed: number
  status: ChangeStatus
  detected_at: string
  page?: MonitoredPage
}

export interface AlertConfig {
  id: string
  user_id: string
  page_id: string | null
  type: AlertType
  email: string | null
  webhook_url: string | null
  is_active: boolean
  created_at: string
}
