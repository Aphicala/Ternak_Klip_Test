'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/products', label: 'Products' },
  { href: '/warehouses', label: 'Warehouses' },
  { href: '/shipments', label: 'Shipments' },
  { href: '/buyers', label: 'Buyers' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 flex-col bg-zinc-900 text-white min-h-screen">
      <div className="px-5 py-6">
        <h1 className="text-lg font-bold tracking-tight">Inventory</h1>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
