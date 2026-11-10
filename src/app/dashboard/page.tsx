import { connection } from 'next/server'
import { createClient } from '../../lib/supabase/server'
import { createDocument, renameDocument, deleteDocument } from './actions'
import { FileText, Plus, Trash2, Edit2 } from 'lucide-react'
import Link from 'next/link'
import ImportButton from './ImportButton'

export const instant = false

export default async function DashboardPage() {
  await connection() // Solución definitiva para el error de prerendering de Next.js 16

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Documentos propios
  const { data: ownedDocs } = await supabase
    .from('documents')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  // Consulta de compartidos
  const { data: sharedRows } = await supabase
    .from('document_shares')
    .select('*')
    .eq('user_id', user.id)

  let sharedDocsList: any[] = []
  if (sharedRows && sharedRows.length > 0) {
    const docIds = sharedRows.map((s: any) => s.document_id)

    const { data: docsData } = await supabase
      .from('documents')
      .select('id, title, updated_at')
      .in('id', docIds)

    if (docsData) {
      sharedDocsList = docsData.map(doc => {
        const shareInfo = sharedRows.find((s: any) => s.document_id === doc.id)
        return {
          ...doc,
          permission: shareInfo?.permission || shareInfo?.role || 'viewer'
        }
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Documents</h1>
        <div className="flex items-center gap-3">
          <ImportButton />
          <form action={createDocument}>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" /> New Document
            </button>
          </form>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Owned by me</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ownedDocs?.map((doc) => (
            <div key={doc.id} className="group relative bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <Link href={`/document/${doc.id}`} className="block mb-4">
                <FileText className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-medium text-gray-900 truncate" title={doc.title}>{doc.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Updated {new Date(doc.updated_at || doc.created_at).toLocaleDateString()}
                </p>
              </Link>
              
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <form action={renameDocument.bind(null, doc.id)} className="flex items-center gap-1 bg-white p-1 rounded shadow-sm border">
                  <input type="text" name="title" defaultValue={doc.title} 
                    className="w-24 px-1 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500" 
                    placeholder="Nuevo nombre" required />
                  <button type="submit" className="p-1 text-gray-500 hover:text-blue-600 rounded bg-gray-50 hover:bg-blue-50">
                    <Edit2 className="h-4 w-4" />
                  </button>
                </form>
                <form action={deleteDocument.bind(null, doc.id)} className="flex items-center">
                  <button type="submit" className="p-1.5 text-gray-500 hover:text-red-600 rounded bg-white shadow-sm border hover:bg-red-50 h-full">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          ))}
          {ownedDocs?.length === 0 && <p className="text-sm text-gray-500 col-span-full">No documents yet. Create one to get started!</p>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Shared with me</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sharedDocsList.map((doc: any) => (
            <Link href={`/document/${doc.id}`} key={doc.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <FileText className="h-8 w-8 text-green-500 mb-2" />
              <h3 className="font-medium text-gray-900 truncate">{doc.title}</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 capitalize">{doc.permission}</span>
              </div>
            </Link>
          ))}
          {sharedDocsList.length === 0 && <p className="text-sm text-gray-500 col-span-full">No documents shared with you yet.</p>}
        </div>
      </section>
    </div>
  )
}