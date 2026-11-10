'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { useState, useRef } from 'react'
import { saveDocument, shareDocument } from '../actions'
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  Heading1, Heading2, List, ListOrdered, 
  Check, Loader2, ArrowLeft, Share2, X
} from 'lucide-react'
import Link from 'next/link'

export default function Editor({ documentId, initialContent, title }: { documentId: string, initialContent: string, title: string }) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: initialContent ? JSON.parse(initialContent) : {},
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[700px] p-6',
      },
    },
    onUpdate: ({ editor }) => {
      setSaveStatus('unsaved')
      if (timeoutRef.current) clearTimeout(timeoutRef.current)

      timeoutRef.current = setTimeout(async () => {
        setSaveStatus('saving')
        const json = editor.getJSON()
        try {
          await saveDocument(documentId, JSON.stringify(json))
          setSaveStatus('saved')
        } catch (error) {
          console.error('Error guardando documento:', error)
          setSaveStatus('unsaved')
        }
      }, 1500)
    },
  })

  // Función para manejar el formulario de compartir
  const handleShare = async (formData: FormData) => {
    const email = formData.get('email') as string
    const role = formData.get('role') as string
    
    const result = await shareDocument(documentId, email, role)
    
    if (result?.error) {
      alert(result.error)
    } else {
      alert('¡Documento compartido exitosamente!')
      setIsShareModalOpen(false)
    }
  }

  if (!editor) return null

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900 truncate max-w-xs">{title}</h1>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
          <div className="flex items-center">
            {saveStatus === 'saving' && <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Guardando...</>}
            {saveStatus === 'saved' && <><Check className="h-4 w-4 mr-2 text-green-500" /> Guardado</>}
            {saveStatus === 'unsaved' && 'Sin guardar'}
          </div>
          
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Share2 className="h-4 w-4" /> Compartir
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b px-4 py-2 flex items-center gap-1 overflow-x-auto sticky top-[60px] z-10">
        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} icon={<Bold className="h-4 w-4" />} />
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} icon={<Italic className="h-4 w-4" />} />
        <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} icon={<UnderlineIcon className="h-4 w-4" />} />
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} icon={<Heading1 className="h-4 w-4" />} />
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} icon={<Heading2 className="h-4 w-4" />} />
        <div className="w-px h-6 bg-gray-300 mx-2" />
        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} icon={<List className="h-4 w-4" />} />
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} icon={<ListOrdered className="h-4 w-4" />} />
      </div>

      {/* Editor Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-6 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_p]:mb-4 [&_p]:leading-relaxed">
          <EditorContent editor={editor} />
        </div>
      </main>

      {/* Modal de Compartir */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Compartir Documento</h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form action={handleShare} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                <input type="email" name="email" required placeholder="usuario@ejemplo.com"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permisos</label>
                <select name="role" className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="viewer">Lector (Solo ver)</option>
                  <option value="editor">Editor (Puede modificar)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700">
                Enviar invitación
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuButton({ onClick, isActive, icon }: { onClick: () => void, isActive: boolean, icon: React.ReactNode }) {
  return (
    <button onClick={onClick} type="button"
      className={`p-2 rounded-md transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
      {icon}
    </button>
  )
}