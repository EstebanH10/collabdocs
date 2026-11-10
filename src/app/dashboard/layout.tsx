import { connection } from 'next/server'
import { logout } from '../auth/actions'
import { createClient } from '../../lib/supabase/server'
import { LogOut, FileText } from 'lucide-react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await connection() // Solución oficial de Next.js 16 para evitar el bloqueo de Date.now()
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <FileText className="h-6 w-6" />
            <span className="font-bold text-xl text-gray-900">CollabDocs</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <form action={logout}>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}