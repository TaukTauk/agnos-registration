import { supabase } from './supabase'

export async function markSessionExpired(sessionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('patient_sessions')
    .update({
      status: 'expired',
      last_activity_at: new Date().toISOString(),
    })
    .eq('session_id', sessionId)

  return !error
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const { error, data } = await supabase
    .from('patient_sessions')
    .delete()
    .eq('session_id', sessionId)
    .select()

  if (error) {
    return false
  }
  return true
}