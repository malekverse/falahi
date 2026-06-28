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
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-4 text-center text-3xl font-bold">Comment ça marche</h1>
      <p className="mb-12 text-center text-lg text-gray-600">
        De la ferme à votre table, en toute transparence.
      </p>

      <div className="space-y-8">
        {steps.map((step) => (
          <div key={step.number} className="flex gap-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-2xl">
              {step.icon}
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-green-600">{step.number}</span>
              <h2 className="mb-1 text-xl font-semibold">{step.title}</h2>
              <p className="text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/marketplace"
          className="inline-block rounded-lg bg-green-600 px-8 py-3 text-white hover:bg-green-700"
        >
          Voir le marché
        </Link>
      </div>
    </main>
  )
}
