"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, TrendingUp, Coffee } from "lucide-react"

interface StatsCardsProps {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  topProductsCount: number
}

export function StatsCards({ totalRevenue, totalOrders, avgOrderValue, topProductsCount }: StatsCardsProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(cents / 100)
  }

  const stats = [
    {
      title: "Ingresos Totales",
      value: formatCurrency(totalRevenue),
      description: "Ganancias de hoy",
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Total de Pedidos",
      value: totalOrders.toString(),
      description: "Pedidos procesados",
      icon: ShoppingCart,
      trend: "+8.2%",
      trendUp: true,
    },
    {
      title: "Pedido Promedio",
      value: formatCurrency(avgOrderValue),
      description: "Por transacción",
      icon: TrendingUp,
      trend: "+3.1%",
      trendUp: true,
    },
    {
      title: "Productos Vendidos",
      value: topProductsCount.toString(),
      description: "Unidades servidas",
      icon: Coffee,
      trend: "+15.3%",
      trendUp: true,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={stat.trendUp ? "text-success" : "text-destructive"}>
                {stat.trend}
              </span>
              <span>{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
