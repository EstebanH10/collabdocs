'use client'

import { useState, useTransition } from 'react'
import { X, Loader2, UserPlus, CheckCircle2 } from 'lucide-react'
import { shareDocument } from '../actions'

export default function ShareModal({ documentId, onClose }: { documentId: string, onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('viewer')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    startTransition(async () => {
      const result = await shareDocument(documentId, email, role)
      if (result?.error) {
        setErrorMsg(result.error)
      } else {
        setSuccessMsg('¡Documento compartido exitosamente!')
        setEmail('')
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-blue-600" /> Compartir Documento
        </h2>

        <form onSubmit={handleShare} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="usuario@collabdocs.com" 
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Permisos</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="viewer">Lector (Solo lectura)</option>
              <option value="editor">Editor (Puede modificar)</option>
            </select>
          </div>

          {errorMsg && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">{errorMsg}</p>
          )}

          {successMsg && (
            <p className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> {successMsg}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar invitación
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}