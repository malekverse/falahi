import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | Filahi',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="font-display text-xs font-medium uppercase tracking-[0.15em] text-gold-500">
        Légal
      </p>
      <h1 className="section-title mt-2 mb-8 text-3xl">Politique de Confidentialité</h1>

      <div className="card p-8">
        <p className="mb-8 text-sm text-ink-500"><strong>Dernière mise à jour :</strong> Juin 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="font-display text-xl font-semibold text-ink-900">1. Collecte des données</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Filahi collecte les données suivantes : nom, numéro de téléphone, adresse,
              coordonnées GPS (chauffeurs uniquement), et informations de véhicule (chauffeurs).
              Les agriculteurs fournissent des informations sur leurs produits via WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink-900">2. Utilisation des données</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Les données sont utilisées uniquement pour le fonctionnement de la plateforme :
              mise en relation des agriculteurs, chauffeurs et acheteurs, suivi des livraisons,
              et traitement des paiements.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink-900">3. Partage des données</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Filahi ne partage pas vos données avec des tiers. Les chauffeurs voient uniquement
              le nom et la localisation de l&apos;agriculteur pour le ramassage. Les acheteurs voient
              uniquement le nom du produit et la région.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink-900">4. Conservation des données</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Les données sont conservées pendant la durée de validité du compte. Les messages
              WhatsApp sont conservés 90 jours. Les traces GPS sont conservées 48 heures.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink-900">5. Vos droits</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Conformément à la loi tunisienne (loi organique n° 2004-63), vous pouvez demander
              l&apos;accès, la rectification ou la suppression de vos données en nous contactant.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-ink-900">6. Contact</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Pour toute question concernant vos données, contactez-nous à l&apos;adresse
              disponible sur notre page de contact.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
