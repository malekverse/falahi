import Link from 'next/link'
import { ListingCard } from '@/components/marketplace/ListingCard'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const { data: featured } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(4)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-cream-100">
        <div className="zellij-pattern absolute inset-0 opacity-[0.06]" />
        <div className="relative px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            <p className="font-display text-sm font-medium uppercase tracking-[0.15em] text-gold-500">
              فلاحي — Filahi
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-olive-900 sm:text-5xl sm:leading-tight">
              Du champ à votre table.{' '}
              <span className="text-olive-600">Sans intermédiaire.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-600 sm:text-lg">
              Les producteurs tunisiens vendent leurs récoltes au juste prix. 
              Vous commandez en ligne, un chauffeur livre. Tout le monde y gagne.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link href="/marketplace" className="btn-primary text-base">
                Voir le marché
              </Link>
              <Link href="/how-it-works" className="btn-secondary text-base">
                Comment ça marche
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="rounded-xl border border-cream-200 bg-cream-100">
        <div className="mx-auto max-w-app px-4 py-8 sm:px-6">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: '100%', label: 'Prix justes' },
              { value: '0', label: 'Intermédiaires' },
              { value: '24h', label: 'De la ferme au hub' },
              { value: '100%', label: 'Traçable' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-bold text-olive-700">{stat.value}</p>
                <p className="mt-1 text-sm text-ink-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title">Produits du moment</h2>
            <p className="mt-1 text-sm text-ink-500">Les dernières récoltes disponibles</p>
          </div>
          <Link href="/marketplace" className="btn-ghost text-sm">
            Tout voir →
          </Link>
        </div>

        {featured && featured.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-cream-200 p-12 text-center">
            <p className="text-ink-500">Aucun produit pour le moment.</p>
            <p className="mt-1 text-sm text-ink-500">Les agriculteurs commencent à publier leurs récoltes.</p>
          </div>
        )}
      </section>

      {/* How it works teaser */}
      <section className="rounded-2xl bg-olive-900 px-8 py-16 text-center sm:px-16">
        <p className="font-display text-sm font-medium uppercase tracking-[0.15em] text-gold-400">
          En trois étapes
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          Comment acheter sur Filahi
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            { step: '01', title: 'Parcourez', desc: 'Explorez les produits des agriculteurs près de chez vous.' },
            { step: '02', title: 'Commandez', desc: 'Choisissez vos produits et passez commande en ligne.' },
            { step: '03', title: 'Recevez', desc: 'Un chauffeur livre votre panier directement à votre porte.' },
          ].map((item) => (
            <div key={item.step}>
              <p className="font-display text-4xl font-bold text-gold-400">{item.step}</p>
              <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-olive-200">{item.desc}</p>
            </div>
          ))}
        </div>
        <Link href="/marketplace" className="btn-primary mt-10 inline-block bg-white text-olive-900 hover:bg-cream-50">
          Commencer mes achats
        </Link>
      </section>
    </>
  )
}
