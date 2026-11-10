'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { useState, useEffect } from 'react'
import { saveDocument } from '../actions'
import { Loader2, Save, Share2, Lock } from 'lucide-react'
import ShareModal from './ShareModal'

export default function Editor({ 
  documentId, 
  initialContent, 
  title, 
  isEditable = true 
}: { 
  documentId: string, 
  initialContent: string, 
  title: string,
  isEditable?: boolean 
}) {
  const [saving, setSaving] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: JSON.parse(initialContent),
    editable: isEditable, // <--- AQUÍ BLOQUEAMOS O PERMITIMOS LA EDICIÓN
    onUpdate: ({ editor }) => {
      if (!isEditable) return
      setSaving(true)
      const json = JSON.stringify(editor.getJSON())
      saveDocument(documentId, json).then(() => {
        setSaving(false)
      })
    },
  })

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {!isEditable && (
            <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
              <Lock className="h-3 w-3" /> Solo lectura (Lector)
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isEditable && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              {saving ? 'Guardando...' : 'Guardado'}
            </span>
          )}
          
          <button 
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            <Share2 className="h-4 w-4" /> Compartir
          </button>
        </div>
      </div>

      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[500px] ${!isEditable ? 'bg-gray-50 cursor-not-allowed' : ''}`}>
        <EditorContent editor={editor} />
      </div>

      {isShareOpen && (
        <ShareModal documentId={documentId} onClose={() => setIsShareOpen(false)} />
      )}
    </div>
  )
}