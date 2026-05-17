'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

async function verifyAdmin() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.role !== 'ADMIN') throw new Error('Forbidden')

  return supabase
}

export async function freezeUser(userId: number) {
  const supabase = await verifyAdmin()
  const { error } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
}

export async function unfreezeUser(userId: number) {
  const supabase = await verifyAdmin()
  const { error } = await supabase
    .from('users')
    .update({ is_active: true })
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
}

export async function changeUserRole(userId: number, role: 'USER' | 'ADMIN') {
  const supabase = await verifyAdmin()
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('user_id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
}

export async function softDeleteUser(userId: number) {
  const supabase = await verifyAdmin()
  const now = new Date().toISOString()

  // Soft-delete user
  await supabase
    .from('users')
    .update({ is_deleted: true, deleted_at: now })
    .eq('user_id', userId)

  // Soft-delete connections (sender OR receiver)
  await supabase
    .from('connections')
    .update({ is_deleted: true })
    .or(`sender_user_id.eq.${userId},receiver_user_id.eq.${userId}`)

  // Soft-delete user_introductions (writer OR target)
  await supabase
    .from('user_introductions')
    .update({ is_deleted: true })
    .or(`writer_user_id.eq.${userId},target_user_id.eq.${userId}`)

  // Soft-delete arigatou (sender OR receiver)
  await supabase
    .from('arigatou')
    .update({ is_deleted: true })
    .or(`sender_user_id.eq.${userId},receiver_user_id.eq.${userId}`)

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
}

export async function updateInquiryStatus(
  inquiryId: number,
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
) {
  const supabase = await verifyAdmin()
  const { error } = await supabase
    .from('inquiry')
    .update({ status })
    .eq('inquiry_id', inquiryId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/inquiries')
}
