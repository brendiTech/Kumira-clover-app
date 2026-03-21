"use client"

import { useCallback, useState } from "react"
import useSWR from "swr"
import { NavHeader } from "@/components/dashboard/nav-header"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { TopProducts } from "@/components/dashboard/top-products"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { OrderStatusChart } from "@/components/dashboard/order-status-chart"
import { ProductFilter } from "@/components/dashboard/product-filter"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardStats, Order, Product } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface ProductStats {
  totalSold: number
  totalRevenue: number
  todaySold: number
  todayRevenue: number
}

export default function DashboardPage() {
  const [period, setPeriod] = useState("today")
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  
  const { 
    data: analytics, 
    isLoading: analyticsLoading, 
    mutate: mutateAnalytics 
  } = useSWR<DashboardStats>(
    `/api/analytics?merchant_id=demo_merchant&period=${period}`,
    fetcher,
    { refreshInterval: 30000 }
  )
  
  const { 
    data: orders, 
    isLoading: ordersLoading, 
    mutate: mutateOrders 
  } = useSWR<Order[]>(
    `/api/orders?merchant_id=demo_merchant&limit=10`,
    fetcher,
    { refreshInterval: 30000 }
  )

  const { 
    data: products, 
    isLoading: productsLoading 
  } = useSWR<Product[]>(
    `/api/products?merchant_id=demo_merchant`,
    fetcher
  )

  const { 
    data: productStats 
  } = useSWR<ProductStats>(
    selectedProductId 
      ? `/api/products/${selectedProductId}/stats?merchant_id=demo_merchant` 
      : null,
    fetcher
  )
  
  const isLoading = analyticsLoading || ordersLoading || productsLoading
  
  const handleRefresh = useCallback(() => {
    mutateAnalytics()
    mutateOrders()
  }, [mutateAnalytics, mutateOrders])
  
  const handlePeriodChange = useCallback((newPeriod: string) => {
    setPeriod(newPeriod)
  }, [])

  const handleProductChange = useCallback((productId: string | null) => {
    setSelectedProductId(productId)
  }, [])

  // Calculate total items sold
  const totalItemsSold = analytics?.topProducts.reduce((sum, p) => sum + p.count, 0) || 0

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl flex flex-col gap-6">
          <DashboardHeader
          period={period}
          onPeriodChange={handlePeriodChange}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
        
        {isLoading && !analytics ? (
          <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[120px] rounded-lg" />
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-7">
              <Skeleton className="col-span-4 h-[400px] rounded-lg" />
              <Skeleton className="col-span-3 h-[400px] rounded-lg" />
            </div>
          </div>
        ) : (
          <>
            <StatsCards
              totalRevenue={analytics?.totalRevenue || 0}
              totalOrders={analytics?.totalOrders || 0}
              avgOrderValue={analytics?.avgOrderValue || 0}
              topProductsCount={totalItemsSold}
            />

            {/* Product Filter Section */}
            <ProductFilter
              products={products || []}
              selectedProductId={selectedProductId}
              onProductChange={handleProductChange}
              productStats={productStats || null}
            />
            
            <div className="grid gap-4 md:grid-cols-7">
              <RevenueChart data={analytics?.revenueByHour || []} />
              <TopProducts products={analytics?.topProducts || []} />
            </div>
            
            <div className="grid gap-4 md:grid-cols-7">
              <RecentOrders orders={orders || []} />
              <OrderStatusChart data={analytics?.ordersByStatus || []} />
            </div>
          </>
        )}
        </div>
      </main>
    </div>
  )
}
