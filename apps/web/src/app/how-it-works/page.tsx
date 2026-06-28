import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Comment ça marche | Filahi',
}

export default function HowItWorksPage() {
  const steps = [
    {
      number: '01',
      title: 'Les agriculteurs listent leurs produits',
      description: 'Les agriculteurs envoient un message vocal sur WhatsApp en Darija. Notre IA transforme la voix en annonce. Pas besoin d\'application, pas besoin d\'internet — juste WhatsApp.',
      icon: '🌾',
    },
    {
      number: '02',
      title: 'Vous commandez sur le marché',
      description: 'Parcourez les produits frais directement des fermes. Filtrez par catégorie et région. Prix transparents — vous voyez ce que l\'agriculteur reçoit et ce que vous payez.',
      icon: '🛒',
    },
    {
      number: '03',
      title: 'Un chauffeur récupère la marchandise',
      description: 'Un chauffeur indépendant accepte la livraison. Il se rend chez l\'agriculteur, saisit un code OTP pour confirmer le ramassage, et transporte les produits vers le hub.',
      icon: '🚛',
    },
    {
      number: '04',
      title: 'Regroupement au hub',
      description: 'Les produits arrivent à notre micro-hub à Bir El Kassaa. Un coursier local les prend en charge pour la livraison du dernier kilomètre direct chez vous.',
      icon: '📍',
    },
    {
      number: '05',
      title: 'Livraison et code OTP',
      description: 'Le coursier arrive à votre adresse. Vous saisissez le code OTP de livraison pour confirmer la réception. Le paiement est libéré à l\'agriculteur.',
      icon: '✅',
    },
    {
      number: '06',
      title: 'Pas de gachara, prix justes',
      description: 'En supprimant les intermédiaires, l\'agriculteur gagne mieux sa vie et vous payez moins cher. Tout le monde y gagne, sauf les gachara.',
      icon: '⚖️',
    },
  ]

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-12 text-center">
        <p className="font-display text-xs font-medium uppercase tracking-[0.15em] text-gold-500">
          فلاحي — Guide
        </p>
        <h1 className="section-title mt-2 text-3xl sm:text-4xl">Comment ça marche</h1>
        <p className="mt-2 text-ink-600">
          De la ferme à votre table, en toute transparence.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.number} className="card flex gap-6 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-olive-100 text-2xl">
              {step.icon}
            </div>
            <div>
              <span className="font-display text-xs font-bold tracking-widest text-gold-500">{step.number}</span>
              <h2 className="mt-1 font-display text-lg font-semibold text-ink-900">{step.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="olive-branch-divider">
        <span>🌿</span>
      </div>

      <div className="text-center">
        <Link href="/marketplace" className="btn-primary text-base">
          Voir le marché
        </Link>
      </div>
    </div>
  )
}
