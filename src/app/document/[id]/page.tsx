import { createClient } from '../../../lib/supabase/server'
import { redirect } from 'next/navigation'
import Editor from './Editor'

export const instant = false

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !document) {
    redirect('/dashboard')
  }

  const defaultContent = '{"type":"doc","content":[{"type":"paragraph"}]}'
  const initialContent = document.content === '{}' || !document.content ? defaultContent : document.content

  return (
    <Editor 
      documentId={document.id} 
      initialContent={initialContent} 
      title={document.title} 
    />
  )
}