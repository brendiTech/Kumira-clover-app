"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Order } from "@/lib/types"

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(cents / 100)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/20 text-success border-success/30'
      case 'pending':
        return 'bg-warning/20 text-warning border-warning/30'
      case 'cancelled':
        return 'bg-destructive/20 text-destructive border-destructive/30'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado'
      case 'pending':
        return 'Pendiente'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur col-span-4">
      <CardHeader>
        <CardTitle className="text-foreground">Pedidos Recientes</CardTitle>
        <CardDescription>Últimas transacciones de tus kioscos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {orders.length > 0 ? (
            orders.slice(0, 8).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-3"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      Pedido #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.device_id || 'Dispositivo desconocido'} - {formatTime(order.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                  <span className="font-medium text-foreground">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Aún no hay pedidos
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
