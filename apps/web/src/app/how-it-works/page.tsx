import Link from 'next/link'

const steps = [
  {
    number: 1,
    title: 'Les agriculteurs publient',
    description: 'Les agriculteurs envoient un message vocal via WhatsApp. Notre IA le traduit et crée une annonce automatiquement.',
  },
  {
    number: 2,
    title: 'Vous commandez',
    description: 'Parcourez les produits frais, filtrez par région ou catégorie, et passez commande en quelques clics.',
  },
  {
    number: 3,
    title: 'Un chauffeur récupère',
    description: 'Un chauffeur indépendant récupère la marchandise chez l\'agriculteur et la conduit à notre micro-hub.',
  },
  {
    number: 4,
    title: 'Livraison finale',
    description: 'Un coursier effectue la dernière étape jusqu\'à votre porte. Vous recevez une notification à chaque étape.',
  },
]

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-3 text-center text-3xl font-bold text-olive-800">Comment ça marche ?</h1>
      <p className="mb-10 text-center text-ink-500">
        Du champ à votre table, sans intermédiaires.
      </p>

      <div className="space-y-8">
        {steps.map((step) => (
          <div key={step.number} className="flex items-start gap-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-olive-100 text-lg font-bold text-olive-700">
              {step.number}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink-900">{step.title}</h2>
              <p className="mt-1 text-ink-500">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-cream-50 p-6 text-center">
        <h3 className="mb-2 text-lg font-semibold text-ink-900">Prêt à commencer ?</h3>
        <p className="mb-4 text-sm text-ink-500">
          Des produits frais, des prix justes, livrés chez vous.
        </p>
        <Link
          href="/marketplace"
          className="inline-block rounded-lg bg-olive-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-olive-700"
        >
          Voir le marché
        </Link>
      </div>
    </main>
  )
}
