'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface HorizontalBarChartProps {
  data: { name: string; value: number }[]
  title: string
  color?: string
  valueLabel?: string
}

export default function HorizontalBarChart({
  data,
  title,
  color = '#3b82f6',
  valueLabel = 'Value',
}: HorizontalBarChartProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{title}</h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(data.length * 40, 120)}>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(val) => [String(val), valueLabel]}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
