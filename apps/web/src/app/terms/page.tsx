import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Conditions d'Utilisation | Filahi",
}

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Conditions d&apos;Utilisation</h1>
      <div className="prose prose-gray max-w-none space-y-6">
        <p><strong>Dernière mise à jour :</strong> Juin 2026</p>

        <h2 className="text-xl font-semibold">1. La Plateforme</h2>
        <p>
          Filahi est une place de marché connectant agriculteurs, chauffeurs et acheteurs.
          La plateforme facilite la mise en relation et le suivi des livraisons, mais
          n&apos;est pas propriétaire des produits échangés.
        </p>

        <h2 className="text-xl font-semibold">2. Rôle des agriculteurs</h2>
        <p>
          Les agriculteurs s&apos;engagent à fournir des informations exactes sur leurs
          produits (quantité, qualité, prix). Filahi peut suspendre un compte en cas
          d&apos;informations frauduleuses.
        </p>

        <h2 className="text-xl font-semibold">3. Rôle des chauffeurs</h2>
        <p>
          Les chauffeurs s&apos;engagent à transporter les produits avec soin et à respecter
          les créneaux de ramassage et livraison. Le code OTP est obligatoire pour valider
          chaque étape.
        </p>

        <h2 className="text-xl font-semibold">4. Rôle des acheteurs</h2>
        <p>
          Les acheteurs s&apos;engagent à payer le montant total à la commande. Les paiements
          sont sécurisés via la plateforme (paiement à la livraison en Phase 1, Flouci en Phase 2).
        </p>

        <h2 className="text-xl font-semibold">5. Frais de service</h2>
        <p>
          Filahi applique une commission de 12% sur chaque vente. La commission est incluse
          dans le prix affiché. Les frais de transport sont calculés en fonction de la distance.
        </p>

        <h2 className="text-xl font-semibold">6. Litiges</h2>
        <p>
          En cas de litige (produit endommagé, vol, non-livraison), la plateforme agit comme
          médiateur. Les OTP de ramassage et livraison servent de preuve de transfert.
        </p>

        <h2 className="text-xl font-semibold">7. Responsabilité</h2>
        <p>
          Filahi n&apos;est pas responsable des dommages directs ou indirects liés à
          l&apos;utilisation de la plateforme. La responsabilité est limitée au montant
          de la transaction concernée.
        </p>

        <h2 className="text-xl font-semibold">8. Modification</h2>
        <p>
          Filahi se réserve le droit de modifier ces conditions à tout moment. Les
          utilisateurs seront informés des changements importants.
        </p>
      </div>
    </main>
  )
}
