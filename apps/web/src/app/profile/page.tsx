import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatTND } from '@filahi/types'

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/profile')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('buyer_id', user.id)

  const { count: disputeCount } = await supabase
    .from('disputes')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', user.id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p className="font-display text-xs font-medium uppercase tracking-[0.15em] text-gold-500">
        حسابي — Mon profil
      </p>
      <h1 className="section-title mt-1">Profil</h1>

      <div className="card mt-8 p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-olive-100 text-2xl font-bold text-olive-700">
            {(profile?.full_name || user.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink-900">
              {profile?.full_name || user.email || 'Utilisateur'}
            </h2>
            <p className="text-sm text-ink-500 capitalize">{profile?.role || 'buyer'}</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-cream-50 p-4 text-center">
            <p className="font-display text-2xl font-black text-ink-900">{orderCount ?? 0}</p>
            <p className="text-xs text-ink-500">Commandes</p>
          </div>
          <div className="rounded-lg bg-cream-50 p-4 text-center">
            <p className="font-display text-2xl font-black text-ink-900">{disputeCount ?? 0}</p>
            <p className="text-xs text-ink-500">Litiges</p>
          </div>
        </div>

        {profile?.phone && (
          <div className="mb-3 flex items-center justify-between border-b border-cream-100 pb-3">
            <span className="text-sm text-ink-500">Téléphone</span>
            <span className="text-sm text-ink-700">{profile.phone}</span>
          </div>
        )}

        <div className="mb-3 flex items-center justify-between border-b border-cream-100 pb-3">
          <span className="text-sm text-ink-500">Email</span>
          <span className="text-sm text-ink-700">{user.email || '—'}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-500">Membre depuis</span>
          <span className="text-sm text-ink-700">
            {new Date(user.created_at).toLocaleDateString('fr-TN', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <Link href="/orders" className="card flex items-center justify-between p-4 transition-colors hover:bg-cream-50">
          <span className="text-sm font-medium text-ink-700">Mes commandes</span>
          <span className="text-sm text-ink-400">→</span>
        </Link>
        <Link href="/b2b" className="card flex items-center justify-between p-4 transition-colors hover:bg-cream-50">
          <span className="text-sm font-medium text-ink-700">Commandes récurrentes</span>
          <span className="text-sm text-ink-400">→</span>
        </Link>
        <Link href="/disputes" className="card flex items-center justify-between p-4 transition-colors hover:bg-cream-50">
          <span className="text-sm font-medium text-ink-700">Litiges</span>
          <span className="text-sm text-ink-400">→</span>
        </Link>
      </div>
    </div>
  )
}
