import { createServerSupabaseClient } from '@/lib/supabase/server'
import { formatTND } from '@filahi/types'
import type { Millimes } from '@filahi/types'
import './print.css'

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabaseClient()
  const { id } = params

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()

  if (!order) {
    return <div className="p-8 text-center text-gray-500">Facture introuvable</div>
  }

  const { data: buyer } = await supabase
    .from('profiles')
    .select('full_name, phone_number')
    .eq('id', order.buyer_id)
    .single()

  return (
    <div className="invoice">
      <div className="invoice-header">
        <h1>Filahi — Facture</h1>
        <p className="invoice-id">N° {order.id.slice(0, 8).toUpperCase()}</p>
        <p className="invoice-date">
          Date: {new Date(order.created_at).toLocaleDateString('fr-TN')}
        </p>
      </div>

      <div className="invoice-buyer">
        <h2>Client</h2>
        <p>{buyer?.full_name || '—'}</p>
        <p>{buyer?.phone_number || '—'}</p>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Qté</th>
            <th>Prix unitaire</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {(order.order_items || []).map((item: { id: string; quantity: number; unit_price_millimes: Millimes; total_millimes: Millimes }) => (
            <tr key={item.id}>
              <td>—</td>
              <td>{item.quantity}</td>
              <td>{formatTND(item.unit_price_millimes)}</td>
              <td>{formatTND(item.total_millimes)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="text-right font-bold">Total</td>
            <td className="font-bold">{formatTND(order.total_price_millimes as Millimes)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="invoice-footer">
        <p>Filahi — Plateforme de mise en relation agricole</p>
        <p>Bir El Kassaa, Ben Arous, Tunisie</p>
      </div>
    </div>
  )
}
