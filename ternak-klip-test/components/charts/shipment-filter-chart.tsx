'use client'

import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const COLORS = [
  '#8b5cf6', '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
]

interface ShipmentData {
  id: string
  product: string
  productId: string
  warehouse: string
  warehouseId: string
  quantity: number
  type: string
  status: string
  date: string
}

interface ShipmentFilterChartProps {
  data: ShipmentData[]
  warehouses: { id: string; name: string }[]
  products: { id: number; name: string }[]
}

export default function ShipmentFilterChart({
  data,
  warehouses,
  products,
}: ShipmentFilterChartProps) {
  const [warehouseFilter, setWarehouseFilter] = useState('all')
  const [productFilter, setProductFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const { chartData, productNames } = useMemo(() => {
    const filtered = data.filter((d) => {
      if (warehouseFilter !== 'all' && d.warehouseId !== warehouseFilter) return false
      if (productFilter !== 'all' && d.productId !== productFilter) return false
      if (typeFilter !== 'all' && d.type !== typeFilter) return false
      return true
    })

    // Aggregate: per warehouse, segmented by product name
    const warehouseMap: Record<string, Record<string, number | string>> = {}
    const names = new Set<string>()
    for (const d of filtered) {
      names.add(d.product)
      if (!warehouseMap[d.warehouse]) {
        warehouseMap[d.warehouse] = { name: d.warehouse }
      }
      warehouseMap[d.warehouse][d.product] =
        ((warehouseMap[d.warehouse][d.product] as number) || 0) + d.quantity
    }

    return {
      chartData: Object.values(warehouseMap),
      productNames: Array.from(names),
    }
  }, [data, warehouseFilter, productFilter, typeFilter])

  const selectClass =
    'rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Shipments from Warehouses
      </h3>
      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">All Warehouses</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">All Products</option>
          {products.map((p) => (
            <option key={p.id} value={String(p.id)}>{p.name}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={selectClass}
        >
          <option value="all">All Types</option>
          <option value="transfer">Transfer</option>
          <option value="outbound">Outbound</option>
          <option value="return">Return</option>
        </select>
      </div>
      {chartData.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">No shipment data</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(chartData.length * 50, 120)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              formatter={(value, name) => [`${value} units`, String(name)]}
            />
            <Legend />
            {productNames.map((product, i) => (
              <Bar
                key={product}
                dataKey={product}
                stackId="shipment"
                fill={COLORS[i % COLORS.length]}
                radius={i === productNames.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
