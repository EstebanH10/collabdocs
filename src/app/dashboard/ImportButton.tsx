'use client'

import { useState, useTransition } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { importDocument } from './actions'

export default function ImportButton() {
  const [isPending, startTransition] = useTransition()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Usamos el método nativo moderno file.text()
      const text = await file.text()
      
      if (!text.trim()) {
        alert('El archivo está vacío o no contiene texto legible.')
        return
      }

      // Convertimos el contenido a líneas para Tiptap
      const paragraphs = text.split('\n').map(line => ({
        type: 'paragraph',
        content: line.trim() ? [{ type: 'text', text: line }] : []
      }))

      const tiptapJson = JSON.stringify({
        type: 'doc',
        content: paragraphs
      })

      const title = file.name.replace(/\.[^/.]+$/, "")

      startTransition(async () => {
        await importDocument(title, tiptapJson)
      })
    } catch (err: any) {
      console.error('Error al leer el archivo:', err)
      alert('No se pudo leer el archivo local.')
    }
  }

  return (
    <label className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors cursor-pointer border border-gray-300">
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      <span>Importar TXT / MD</span>
      <input type="file" accept=".txt,.md" onChange={handleFileChange} className="hidden" disabled={isPending} />
    </label>
  )
}