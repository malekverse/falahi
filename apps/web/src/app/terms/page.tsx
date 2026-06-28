import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Conditions d'Utilisation | Filahi",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-display text-xs font-medium uppercase tracking-[0.15em] text-gold-500">
        Légal
      </p>
      <h1 className="section-title mt-2 mb-8 text-3xl">Conditions d&apos;Utilisation</h1>

      <div className="card p-8">
        <p className="mb-8 text-sm text-ink-500"><strong>Dernière mise à jour :</strong> Juin 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="font-display text-xl font-semibold text-ink-900">1. La Plateforme</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Filahi est une place de marché connectant agriculteurs, chauffeurs et acheteurs.
              La plateforme facilite la mise en relation et le suivi des livraisons, mais
              n&apos;est pas propriétaire des produits échangés.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink-900">2. Rôle des agriculteurs</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Les agriculteurs s&apos;engagent à fournir des informations exactes sur leurs
              produits (quantité, qualité, prix). Filahi peut suspendre un compte en cas
              d&apos;informations frauduleuses.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink-900">3. Rôle des chauffeurs</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Les chauffeurs s&apos;engagent à transporter les produits avec soin et à respecter
              les créneaux de ramassage et livraison. Le code OTP est obligatoire pour valider
              chaque étape.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink-900">4. Rôle des acheteurs</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Les acheteurs s&apos;engagent à payer le montant total à la commande. Les paiements
              sont sécurisés via la plateforme (paiement à la livraison en Phase 1, Flouci en Phase 2).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink-900">5. Frais de service</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Filahi applique une commission de 12% sur chaque vente. La commission est incluse
              dans le prix affiché. Les frais de transport sont calculés en fonction de la distance.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink-900">6. Litiges</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              En cas de litige (produit endommagé, vol, non-livraison), la plateforme agit comme
              médiateur. Les OTP de ramassage et livraison servent de preuve de transfert.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink-900">7. Responsabilité</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Filahi n&apos;est pas responsable des dommages directs ou indirects liés à
              l&apos;utilisation de la plateforme. La responsabilité est limitée au montant
              de la transaction concernée.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink-900">8. Modification</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Filahi se réserve le droit de modifier ces conditions à tout moment. Les
              utilisateurs seront informés des changements importants.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
