'use client'

interface Entry {
  id: number
  entry_type: string
  amount_millimes: number
  party_id: string | null
  payment_method: string | null
  reference: string | null
  notes: string | null
  created_at: string
}

export function CsvExportButton({ entries }: { entries: Entry[] }) {
  function downloadCsv() {
    const headers = ['Type', 'Montant (TND)', 'Partie', 'Méthode', 'Référence', 'Date']
    const rows = entries.map((e) => [
      e.entry_type,
      (e.amount_millimes / 1000).toFixed(3),
      e.party_id?.slice(0, 8) || '',
      e.payment_method || '',
      e.reference || '',
      new Date(e.created_at).toLocaleDateString('fr-TN'),
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `filahi-ledger-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      onClick={downloadCsv}
    >
      Télécharger CSV
    </button>
  )
}
