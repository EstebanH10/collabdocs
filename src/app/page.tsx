
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '../lib/supabase/server'

async function HomeRedirect(): Promise<React.ReactNode> {
  await connection()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  redirect('/login')
}

export default function HomePage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50" />}>
      <HomeRedirect />
    </Suspense>
  )
}
