export interface Product {
  id: number
  name: string
  stock_count: number
  return_count: number
  last_updated: string
}

export interface Warehouse {
  id: string
  name: string
  location: string | null
  created_at: string
}

export interface WarehouseProduct {
  id: string
  warehouse_id: string
  product_id: number
  stock_level: number
  warehouses?: Warehouse
  products?: Product
}

export interface Buyer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
}

export interface Shipment {
  id: string
  product_id: number
  from_warehouse_id: string
  to_warehouse_id: string | null
  to_buyer_id: string | null
  quantity: number
  type: 'transfer' | 'outbound' | 'return'
  status: 'in_transit' | 'completed'
  estimated_hours: number
  elapsed_hours: number
  created_at: string
  completed_at: string | null
  products?: Product
  from_warehouse?: Warehouse
  to_warehouse?: Warehouse
  buyers?: Buyer
}
