'use client'

import { useState } from 'react'
import type { Shipment } from '@/lib/types'

interface ShipmentListProps {
  shipments: Shipment[]
}

export default function ShipmentList({ shipments }: ShipmentListProps) {
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = shipments.filter((s) => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false
    return true
  })

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          All Transfers &amp; Outbounds
        </h3>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          <option value="all">All Types</option>
          <option value="transfer">Transfer</option>
          <option value="outbound">Outbound</option>
          <option value="return">Return</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-2 font-medium">Product</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">From</th>
              <th className="px-3 py-2 font-medium">To</th>
              <th className="px-3 py-2 font-medium">Qty</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-zinc-400">
                  No shipments found
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">
                    {s.products?.name ?? '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        s.type === 'transfer'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                          : s.type === 'return'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                      }`}
                    >
                      {s.type}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">
                    {s.type === 'return'
                      ? s.buyers?.name ?? '—'
                      : s.from_warehouse?.name ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">
                    {s.type === 'transfer'
                      ? s.to_warehouse?.name ?? '—'
                      : s.type === 'return'
                      ? s.from_warehouse?.name ?? '—'
                      : s.buyers?.name ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{s.quantity}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        s.status === 'completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400">
                    {new Date(s.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
