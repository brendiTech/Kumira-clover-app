"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface TopProductsProps {
  products: { name: string; count: number; revenue: number }[]
}

export function TopProducts({ products }: TopProductsProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(cents / 100)
  }

  const maxRevenue = Math.max(...products.map(p => p.revenue), 1)

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur col-span-3">
      <CardHeader>
        <CardTitle className="text-foreground">Productos Más Vendidos</CardTitle>
        <CardDescription>Artículos más vendidos hoy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {products.length > 0 ? (
            products.map((product, index) => (
              <div key={product.name} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">{product.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {product.count} vendidos
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={(product.revenue / maxRevenue) * 100} 
                  className="h-2 bg-secondary"
                />
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Aún no hay datos de ventas
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
