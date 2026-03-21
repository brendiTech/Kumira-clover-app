"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Package, TrendingUp, DollarSign, Calendar } from "lucide-react"
import { Product } from "@/lib/types"

interface ProductFilterProps {
  products: Product[]
  selectedProductId: string | null
  onProductChange: (productId: string | null) => void
  productStats: {
    totalSold: number
    totalRevenue: number
    todaySold: number
    todayRevenue: number
  } | null
}

export function ProductFilter({ 
  products, 
  selectedProductId, 
  onProductChange, 
  productStats 
}: ProductFilterProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(cents / 100)
  }

  const selectedProduct = products.find(p => p.id === selectedProductId)

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Package className="h-5 w-5" />
          Filtrar por Producto
        </CardTitle>
        <CardDescription>Selecciona un producto para ver sus estadísticas detalladas</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Select 
          value={selectedProductId || "all"} 
          onValueChange={(value) => onProductChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full border-border/50 bg-card/50">
            <SelectValue placeholder="Todos los productos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los productos</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedProduct && productStats && (
          <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-secondary/20 p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{selectedProduct.name}</span>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {formatCurrency(selectedProduct.price)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 rounded-lg bg-background/50 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Vendidos Hoy
                </div>
                <span className="text-lg font-bold text-foreground">{productStats.todaySold}</span>
              </div>
              
              <div className="flex flex-col gap-1 rounded-lg bg-background/50 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  Ingresos Hoy
                </div>
                <span className="text-lg font-bold text-foreground">{formatCurrency(productStats.todayRevenue)}</span>
              </div>
              
              <div className="flex flex-col gap-1 rounded-lg bg-background/50 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  Total Vendidos
                </div>
                <span className="text-lg font-bold text-foreground">{productStats.totalSold}</span>
              </div>
              
              <div className="flex flex-col gap-1 rounded-lg bg-background/50 p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  Ingresos Totales
                </div>
                <span className="text-lg font-bold text-foreground">{formatCurrency(productStats.totalRevenue)}</span>
              </div>
            </div>
          </div>
        )}

        {!selectedProductId && (
          <p className="text-center text-sm text-muted-foreground">
            Selecciona un producto para ver estadísticas detalladas
          </p>
        )}
      </CardContent>
    </Card>
  )
}
