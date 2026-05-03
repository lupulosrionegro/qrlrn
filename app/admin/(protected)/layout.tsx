"use client";
import { useEffect } from 'react'
import { useSession, signOut as signOutNextAuth } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Client Component: enforce admin guard on client side
export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const status = sessionResult?.status ?? 'loading'
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/admin/login')
    }
  }, [session, status, router])

  const handleSignOut = async () => {
    await signOutNextAuth({ callbackUrl: '/admin/login' })
  }

  if (status === 'loading') return null
  if (!session) return null

  return (
    <div className="min-h-screen bg-[#0f1a0f] text-[#e8f0e8] font-sans">
      <nav className="bg-[#1a2e1a] border-b border-[#2a4a2a] px-6 py-3.5 flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🌿</span>
          <span className="font-semibold text-sm text-[#c8e8c8]">Lupulos Rio Negro</span>
          <span className="text-xs text-[#3a6a3a] bg-[#1f3a1f] px-2 py-0.5 rounded-full border border-[#2a5a2a]">Admin</span>
        </div>
        <div className="ml-auto flex items-center gap-5 text-[13px]">
          <Link href="/admin" className="text-[#6a9a6a] hover:text-[#8aba8a] transition-colors">Lotes</Link>
          <Link href="/admin/nuevo" className="text-[#6a9a6a] hover:text-[#8aba8a] transition-colors">Nuevo lote</Link>
          <Link href="/admin/variedades" className="text-[#6a9a6a] hover:text-[#8aba8a] transition-colors">Variedades</Link>
          <Link href="/admin/cargar" className="text-[#6a9a6a] hover:text-[#8aba8a] transition-colors">Cargar archivos</Link>
          <button onClick={handleSignOut} className="text-[#6a9a6a] hover:text-red-400 transition-colors">Salir</button>
        </div>
      </nav>
      <div className="max-w-[960px] mx-auto px-6 py-8">{children}</div>
    </div>
  )
}
