import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getDashboardStats } from '@/lib/queries'
import SummaryCard from '@/components/summary-card'
import HorizontalBarChart from '@/components/charts/horizontal-bar-chart'
import ShipmentFilterChart from '@/components/charts/shipment-filter-chart'
import StackedBarChart from '@/components/charts/stacked-bar-chart'
import ShipmentList from '@/components/shipment-list'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const stats = await getDashboardStats(supabase)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard title="Total Products" value={stats.totalProducts} color="blue" />
        <SummaryCard title="Low Stock Products" value={stats.lowStockProducts} color="yellow" />
        <SummaryCard title="Zero Stock Products" value={stats.zeroStockProducts} color="red" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <HorizontalBarChart
          data={stats.stockByProductChart}
          title="Stock Levels by Product Name"
          color="#3b82f6"
          valueLabel="Stock"
        />
        <HorizontalBarChart
          data={stats.returnRateChart}
          title="Return Rate by Product Name (%)"
          color="#ef4444"
          valueLabel="Return Rate %"
        />
      </div>

      <StackedBarChart
        data={stats.stockByWarehouseChart}
        productNames={stats.stockByWarehouseProducts}
        title="Stock Levels per Warehouse"
      />

      <ShipmentFilterChart
        data={stats.shipmentChartData}
        warehouses={stats.warehouses}
        products={stats.products}
      />

      <ShipmentList shipments={stats.shipments} />
    </div>
  )
}
