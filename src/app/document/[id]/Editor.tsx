'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { useState } from 'react'
import { saveDocument } from '../actions'
import { Loader2, Save, Share2, Lock, Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading2, List, ListOrdered } from 'lucide-react'
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
    editable: isEditable,
    onUpdate: ({ editor }) => {
      if (!isEditable) return
      setSaving(true)
      const json = JSON.stringify(editor.getJSON())
      saveDocument(documentId, json).then(() => {
        setSaving(false)
      })
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Barra superior de título y acciones */}
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

      {/* Barra de Herramientas de Formato (Solo si es editable) */}
      {isEditable && (
        <div className="flex flex-wrap gap-1 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-100 text-gray-700 ${editor.isActive('bold') ? 'bg-gray-200 text-blue-600 font-bold' : ''}`}
            title="Negrita"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-100 text-gray-700 ${editor.isActive('italic') ? 'bg-gray-200 text-blue-600' : ''}`}
            title="Cursiva"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-100 text-gray-700 ${editor.isActive('underline') ? 'bg-gray-200 text-blue-600' : ''}`}
            title="Subrayado"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-100 text-gray-700 ${editor.isActive('strike') ? 'bg-gray-200 text-blue-600' : ''}`}
            title="Tachado"
          >
            <Strikethrough className="h-4 w-4" />
          </button>
          <span className="w-px h-6 bg-gray-300 mx-1 self-center" />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-100 text-gray-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-blue-600' : ''}`}
            title="Título"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-100 text-gray-700 ${editor.isActive('bulletList') ? 'bg-gray-200 text-blue-600' : ''}`}
            title="Lista con viñetas"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-100 text-gray-700 ${editor.isActive('orderedList') ? 'bg-gray-200 text-blue-600' : ''}`}
            title="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Área del Editor */}
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[500px] ${!isEditable ? 'bg-gray-50 cursor-not-allowed' : ''}`}>
        <EditorContent editor={editor} />
      </div>

      {isShareOpen && (
        <ShareModal documentId={documentId} onClose={() => setIsShareOpen(false)} />
      )}
    </div>
  )
}