'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveDocument(id: string, content: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('documents')
    .update({ 
      content, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function shareDocument(documentId: string, email: string, role: string) {
  const supabase = await createClient()
  
  // 1. Buscamos el ID en la tabla profiles
  let { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  // Si el perfil no existe en la tabla pública profiles, intentamos buscarlo o informamos
  if (!profile) {
    return { error: 'El usuario con ese correo no ha iniciado sesión o no tiene perfil registrado en la base de datos.' }
  }

  // 2. Insertamos el permiso
  const { error: shareError } = await supabase
    .from('document_shares')
    .insert([
      { document_id: documentId, user_id: profile.id, permission: role }
    ])

  if (shareError) {
    if (shareError.code === '23505') return { error: 'El documento ya está compartido con este usuario.' }
    return { error: shareError.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}