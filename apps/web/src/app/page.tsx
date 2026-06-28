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
      {/* Hero — bold Arabic-first */}
      <section className="hero-gradient zellij-bg-solid relative overflow-hidden rounded-3xl">
        <div className="relative px-8 py-20 sm:px-16 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 font-display text-5xl font-black tracking-tight text-white/90 sm:text-7xl">
              فلاحي
            </p>
            <p className="mb-2 font-display text-base font-medium uppercase tracking-[0.25em] text-gold-400">
              Filahi — Le Marché des Producteurs
            </p>
            <h1 className="mt-6 text-3xl font-bold leading-tight text-white sm:text-4xl sm:leading-tight">
              Du champ à votre table.{' '}
              <span className="text-gold-400">Sans intermédiaire.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-olive-200 sm:text-lg">
              Les producteurs tunisiens vendent leurs récoltes au juste prix. 
              Vous commandez en ligne, un chauffeur booke. Tout le monde y gagne.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/marketplace" className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 font-display text-base font-bold text-olive-900 shadow-lg transition-all duration-200 hover:bg-cream-50 hover:shadow-xl active:scale-[0.97]">
                Voir le marché
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center justify-center rounded-xl border border-white/30 px-8 py-3 font-display text-base font-medium text-white transition-all duration-200 hover:bg-white/10">
                Comment ça marche
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="mt-8 rounded-xl border border-cream-200 bg-cream-100">
        <div className="px-6 py-8 sm:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: '100%', label: 'Prix justes' },
              { value: '0', label: 'Intermédiaires' },
              { value: '24h', label: 'Ferme → Hub' },
              { value: '100%', label: 'Traçable' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-black text-olive-700">{stat.value}</p>
                <p className="mt-1 text-sm font-medium text-ink-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings with animation classes */}
      <section className="py-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-gold-500">
              سوق — Marché
            </p>
            <h2 className="section-title mt-1 text-3xl">Produits du moment</h2>
          </div>
          <Link href="/marketplace" className="btn-ghost text-sm font-medium">
            Tout voir →
          </Link>
        </div>

        {featured && featured.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item, i) => (
              <div key={item.id} className={`animate-fade-in-up animate-stagger-${Math.min(i + 1, 4)}`}>
                <ListingCard key={item.id} item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="divider-leaf mt-12">
            <span>🌿</span>
          </div>
        )}
      </section>

      {/* CTA: How it works */}
      <section className="hero-gradient zellij-bg-solid rounded-3xl px-8 py-16 text-center sm:px-16">
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-gold-400">
          ثلاثة خطوات — Trois étapes
        </p>
        <h2 className="mt-3 font-display text-3xl font-black text-white sm:text-4xl">
          Comment acheter sur Filahi
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            { step: '٠١', number: '01', title: 'Parcourez', desc: 'Explorez les produits des agriculteurs près de chez vous.' },
            { step: '٠٢', number: '02', title: 'Commandez', desc: 'Choisissez vos produits et passez commande en ligne.' },
            { step: '٠٣', number: '03', title: 'Recevez', desc: 'Un chauffeur livre votre panier directement à votre porte.' },
          ].map((item) => (
            <div key={item.number} className="animate-fade-in-up">
              <p className="font-display text-4xl font-black text-gold-400">{item.step}</p>
              <p className="mt-1 text-sm font-medium uppercase tracking-wider text-olive-300">{item.number}</p>
              <h3 className="mt-3 text-lg font-bold text-white">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-olive-200">{item.desc}</p>
            </div>
          ))}
        </div>
        <Link
          href="/marketplace"
          className="mt-10 inline-flex items-center justify-center rounded-xl bg-white px-10 py-3 font-display text-base font-bold text-olive-900 shadow-lg transition-all duration-200 hover:bg-cream-50 hover:shadow-xl active:scale-[0.97]"
        >
          Commencer mes achats
        </Link>
      </section>
    </>
  )
}
