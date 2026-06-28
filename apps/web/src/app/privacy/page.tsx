import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | Filahi',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Politique de Confidentialité</h1>
      <div className="prose prose-gray max-w-none space-y-6">
        <p><strong>Dernière mise à jour :</strong> Juin 2026</p>

        <h2 className="text-xl font-semibold">1. Collecte des données</h2>
        <p>
          Filahi collecte les données suivantes : nom, numéro de téléphone, adresse,
          coordonnées GPS (chauffeurs uniquement), et informations de véhicule (chauffeurs).
          Les agriculteurs fournissent des informations sur leurs produits via WhatsApp.
        </p>

        <h2 className="text-xl font-semibold">2. Utilisation des données</h2>
        <p>
          Les données sont utilisées uniquement pour le fonctionnement de la plateforme :
          mise en relation des agriculteurs, chauffeurs et acheteurs, suivi des livraisons,
          et traitement des paiements.
        </p>

        <h2 className="text-xl font-semibold">3. Partage des données</h2>
        <p>
          Filahi ne partage pas vos données avec des tiers. Les chauffeurs voient uniquement
          le nom et la localisation de l&apos;agriculteur pour le ramassage. Les acheteurs voient
          uniquement le nom du produit et la région.
        </p>

        <h2 className="text-xl font-semibold">4. Conservation des données</h2>
        <p>
          Les données sont conservées pendant la durée de validité du compte. Les messages
          WhatsApp sont conservés 90 jours. Les traces GPS sont conservées 48 heures.
        </p>

        <h2 className="text-xl font-semibold">5. Vos droits</h2>
        <p>
          Conformément à la loi tunisienne (loi organique n° 2004-63), vous pouvez demander
          l&apos;accès, la rectification ou la suppression de vos données en nous contactant.
        </p>

        <h2 className="text-xl font-semibold">6. Contact</h2>
        <p>
          Pour toute question concernant vos données, contactez-nous à l&apos;adresse
          disponible sur notre page de contact.
        </p>
      </div>
    </main>
  )
}
