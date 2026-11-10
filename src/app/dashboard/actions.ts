'use server'

import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createDocument() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from('documents')
    .insert([{ title: 'Untitled Document', owner_id: user.id, content: '{}' }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard')
  redirect(`/document/${data.id}`)
}

export async function importDocument(title: string, contentJson: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error("Error: Usuario no autenticado en Server Action")
    throw new Error("Unauthorized")
  }

  console.log('Insertando documento en Supabase para el usuario:', user.id)

  const { data, error } = await supabase
    .from('documents')
    .insert([{ title, owner_id: user.id, content: contentJson }])
    .select()
    .single()

  if (error) {
    console.error("Error detallado de Supabase al importar:", error)
    throw new Error(error.message)
  }

  console.log('Documento importado con éxito, redirigiendo a:', data.id)
  revalidatePath('/dashboard')
  redirect(`/document/${data.id}`)
}

export async function renameDocument(id: string, formData: FormData) {
  const title = formData.get('title') as string
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('documents')
    .update({ title })
    .eq('id', id)

  if (!error) revalidatePath('/dashboard')
}

export async function deleteDocument(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (!error) revalidatePath('/dashboard')
}