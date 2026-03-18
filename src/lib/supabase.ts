import { createClient, SupabaseClient } from '@supabase/supabase-js'

// =====================================================
// DATABASE TYPES
// =====================================================

export type SubscriptionTier = 'free' | 'starter' | 'agency' | 'scale' | 'white_label'
export type ReportStatus = 'processing' | 'completed' | 'failed'
export type PlatformType = 'google' | 'meta' | 'both'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  agency_name: string | null
  avatar_url: string | null
  logo_url: string | null
  subscription_tier: SubscriptionTier
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: string
  subscription_period_end: string | null
  credits_used: number
  credits_limit: number
  credits_reset_at: string
  created_at: string
  updated_at: string
}

export interface CampaignData {
  campaign: string
  impressions: number
  clicks: number
  ctr: string
  cpc: string
  cost: number
  conversions: number
  convRate: string
  costPerConv: string
}

export interface MetaCampaignData {
  campaignName: string
  reach: number
  impressions: number
  clicks: number
  ctr: string
  cpc: string
  amountSpent: number
  results: number
  costPerResult: string
  cpm: string
}

export interface Report {
  id: string
  user_id: string
  client_name: string
  agency_name: string
  period: string
  platform: PlatformType
  google_ads_data: CampaignData[] | null
  meta_ads_data: MetaCampaignData[] | null
  report_text: string
  status: ReportStatus
  pdf_path: string | null
  created_at: string
  updated_at: string
}

export interface UsageLog {
  id: string
  user_id: string
  report_id: string | null
  action: string
  tokens_used: number
  metadata: Record<string, unknown>
  created_at: string
}

export interface UserStats {
  user_id: string
  credits_used: number
  credits_limit: number
  subscription_tier: SubscriptionTier
  total_reports: number
  reports_this_month: number
}

// =====================================================
// SUPABASE CLIENTS
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables')
}

// Client for browser (uses anon key, respects RLS)
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

// Server client factory (for server components/API routes)
export function createServerClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}

// =====================================================
// AUTH HELPERS
// =====================================================

export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// =====================================================
// PROFILE HELPERS
// =====================================================

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data as Profile
}

export async function updateProfile(
  userId: string,
  updates: {
    full_name?: string | null
    agency_name?: string | null
    avatar_url?: string | null
  }
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as Profile
}

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as UserStats
}

// =====================================================
// REPORT HELPERS
// =====================================================

export interface SaveReportInput {
  user_id: string
  client_name: string
  agency_name: string
  period: string
  platform: PlatformType
  google_ads_data?: CampaignData[] | null
  meta_ads_data?: MetaCampaignData[] | null
  report_text: string
  status?: ReportStatus
}

export async function saveReport(input: SaveReportInput): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: input.user_id,
      client_name: input.client_name,
      agency_name: input.agency_name,
      period: input.period,
      platform: input.platform,
      google_ads_data: input.google_ads_data || null,
      meta_ads_data: input.meta_ads_data || null,
      report_text: input.report_text,
      status: input.status || 'completed',
    })
    .select()
    .single()

  if (error) throw error

  // Increment user's credits used
  try {
    await supabase.rpc('increment_credits', { p_user_id: input.user_id })
  } catch (e) {
    console.error('Failed to increment credits:', e)
  }

  // Log usage
  await logUsage(input.user_id, 'report_generated', data.id)

  return data as Report
}

export async function getReports(userId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as Report[]
}

export async function getReport(reportId: string): Promise<Report | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as Report
}

export async function updateReport(
  reportId: string,
  updates: {
    report_text?: string
    status?: ReportStatus
    pdf_path?: string | null
  }
): Promise<Report> {
  const { data, error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', reportId)
    .select()
    .single()

  if (error) throw error
  return data as Report
}

export async function deleteReport(reportId: string): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId)

  if (error) throw error
}

// =====================================================
// USAGE LOGGING
// =====================================================

export async function logUsage(
  userId: string,
  action: string,
  reportId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from('usage_logs').insert({
      user_id: userId,
      action,
      report_id: reportId || null,
      metadata: metadata || {},
      tokens_used: 0,
    })
  } catch (error) {
    console.error('Failed to log usage:', error)
  }
}

// =====================================================
// CREDITS CHECK
// =====================================================

export async function checkUserCredits(userId: string): Promise<{
  hasCredits: boolean
  used: number
  limit: number
}> {
  const profile = await getProfile(userId)
  
  if (!profile) {
    return { hasCredits: false, used: 0, limit: 0 }
  }

  return {
    hasCredits: profile.credits_used < profile.credits_limit,
    used: profile.credits_used,
    limit: profile.credits_limit,
  }
}

// =====================================================
// FILE STORAGE (Avatars, Logos, PDFs)
// =====================================================

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `avatar.${fileExt}`
  const filePath = `${userId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) throw uploadError

  // Get public URL
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  
  // Update profile with avatar URL
  await supabase
    .from('profiles')
    .update({ avatar_url: data.publicUrl })
    .eq('id', userId)

  return data.publicUrl
}

export async function uploadLogo(
  userId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `logo.${fileExt}`
  const filePath = `${userId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) throw uploadError

  // Get public URL
  const { data } = supabase.storage.from('logos').getPublicUrl(filePath)
  
  // Update profile with logo URL
  await supabase
    .from('profiles')
    .update({ logo_url: data.publicUrl })
    .eq('id', userId)

  return data.publicUrl
}

export async function deleteAvatar(userId: string): Promise<void> {
  // List all files in user's avatar folder
  const { data: files } = await supabase.storage
    .from('avatars')
    .list(userId)

  if (files && files.length > 0) {
    const filesToDelete = files.map(f => `${userId}/${f.name}`)
    await supabase.storage.from('avatars').remove(filesToDelete)
  }

  // Clear avatar_url in profile
  await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', userId)
}

export async function deleteLogo(userId: string): Promise<void> {
  // List all files in user's logo folder
  const { data: files } = await supabase.storage
    .from('logos')
    .list(userId)

  if (files && files.length > 0) {
    const filesToDelete = files.map(f => `${userId}/${f.name}`)
    await supabase.storage.from('logos').remove(filesToDelete)
  }

  // Clear logo_url in profile
  await supabase
    .from('profiles')
    .update({ logo_url: null })
    .eq('id', userId)
}

export async function uploadPDF(
  userId: string,
  reportId: string,
  pdfBlob: Blob,
  fileName: string
): Promise<string> {
  const filePath = `${userId}/${reportId}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('reports')
    .upload(filePath, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) throw uploadError

  // Update report with PDF path
  await updateReport(reportId, { pdf_path: filePath })

  // Log usage
  await logUsage(userId, 'pdf_exported', reportId)

  return filePath
}

export async function getPDFUrl(pdfPath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('reports')
    .createSignedUrl(pdfPath, 60 * 60) // 1 hour expiry

  if (error) throw error
  return data.signedUrl
}

export async function deletePDF(pdfPath: string): Promise<void> {
  const { error } = await supabase.storage
    .from('reports')
    .remove([pdfPath])

  if (error) throw error
}

// =====================================================
// SUBSCRIPTION HELPERS
// =====================================================

export function getTierCredits(tier: SubscriptionTier): number {
  const limits: Record<SubscriptionTier, number> = {
    free: 3,
    starter: 25,
    agency: 100,
    scale: 500,
    white_label: 999999,
  }
  return limits[tier]
}

export function getTierPrice(tier: SubscriptionTier): number {
  const prices: Record<SubscriptionTier, number> = {
    free: 0,
    starter: 49,
    agency: 99,
    scale: 199,
    white_label: 399,
  }
  return prices[tier]
}
