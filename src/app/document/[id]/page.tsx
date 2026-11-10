import { connection } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { redirect } from 'next/navigation'
import Editor from './Editor'

export const instant = false

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  await connection()
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Buscamos el documento
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !document) {
    redirect('/dashboard')
  }

  // 2. Determinamos si el usuario es el dueño
  let permission = 'editor' // Por defecto si es el dueño
  if (document.owner_id !== user.id) {
    // Si no es el dueño, buscamos el permiso en document_shares
    const { data: shareData } = await supabase
      .from('document_shares')
      .select('permission, role')
      .eq('document_id', id)
      .eq('user_id', user.id)
      .single()

    if (!shareData) {
      // Si no es dueño ni tiene acceso compartido, fuera
      redirect('/dashboard')
    }
    permission = shareData.permission || shareData.role || 'viewer'
  }

  const defaultContent = '{"type":"doc","content":[{"type":"paragraph"}]}'
  const initialContent = document.content === '{}' || !document.content ? defaultContent : document.content

  const isEditable = permission !== 'viewer'

  return (
    <Editor 
      documentId={document.id} 
      initialContent={initialContent} 
      title={document.title} 
      isEditable={isEditable}
    />
  )
}