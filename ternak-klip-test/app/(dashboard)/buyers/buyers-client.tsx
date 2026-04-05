'use client'

import { useState, useTransition } from 'react'
import DataTable from '@/components/data-table'
import Modal from '@/components/modal'
import BuyerForm from '@/components/forms/buyer-form'
import ReturnForm from '@/components/forms/return-form'
import { deleteBuyer } from './actions'
import type { Buyer, Product, Warehouse } from '@/lib/types'

interface Props {
  buyers: Buyer[]
  products: Product[]
  warehouses: Warehouse[]
}

export default function BuyersClient({ buyers, products, warehouses }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Buyer | null>(null)
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null)
  const [, startTransition] = useTransition()

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email', render: (b: Buyer) => b.email || '—' },
    { key: 'phone', header: 'Phone', render: (b: Buyer) => b.phone || '—' },
    {
      key: 'return',
      header: 'Return',
      render: (b: Buyer) => (
        <button
          onClick={() => { setSelectedBuyer(b); setReturnModalOpen(true) }}
          className="text-orange-600 hover:underline dark:text-orange-400"
        >
          Process Return
        </button>
      ),
    },
  ]

  return (
    <>
      <button
        onClick={() => { setEditing(null); setModalOpen(true) }}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Add Buyer
      </button>

      <DataTable
        columns={columns}
        data={buyers}
        onEdit={(b) => { setEditing(b); setModalOpen(true) }}
        onDelete={(b) => {
          if (confirm('Delete this buyer?')) {
            startTransition(() => deleteBuyer(b.id))
          }
        }}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Buyer' : 'New Buyer'}
      >
        <BuyerForm buyer={editing} onDone={() => setModalOpen(false)} />
      </Modal>

      <Modal
        open={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title={`Return — ${selectedBuyer?.name ?? ''}`}
      >
        {selectedBuyer && (
          <ReturnForm
            buyerId={selectedBuyer.id}
            products={products}
            warehouses={warehouses}
            onDone={() => setReturnModalOpen(false)}
          />
        )}
      </Modal>
    </>
  )
}
