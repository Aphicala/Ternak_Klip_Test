'use client'

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
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
]

interface StackedBarChartProps {
  data: Record<string, string | number>[]
  productNames: string[]
  title: string
}

export default function StackedBarChart({ data, productNames, title }: StackedBarChartProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{title}</h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(data.length * 50, 120)}>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
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
                stackId="stock"
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
