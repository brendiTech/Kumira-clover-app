"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

interface OrderStatusChartProps {
  data: { status: string; count: number }[]
}

const COLORS = [
  "oklch(0.65 0.18 145)", // success green
  "oklch(0.80 0.15 80)",  // warning yellow
  "oklch(0.60 0.20 25)",  // destructive red
  "oklch(0.70 0.16 200)", // chart blue
]

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completado',
  pending: 'Pendiente',
  cancelled: 'Cancelado',
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur col-span-3">
      <CardHeader>
        <CardTitle className="text-foreground">Estado de Pedidos</CardTitle>
        <CardDescription>Distribución de estados de pedidos</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="flex items-center justify-center gap-8">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.16 0.01 270)",
                    border: "1px solid oklch(0.28 0.01 270)",
                    borderRadius: "8px",
                    color: "oklch(0.96 0 0)",
                  }}
                  formatter={(value: number, name: string) => [value, STATUS_LABELS[name] || name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              {data.map((item, index) => (
                <div key={item.status} className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium capitalize text-foreground">
                      {STATUS_LABELS[item.status] || item.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.count} pedidos ({((item.count / total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Aún no hay datos de pedidos
          </div>
        )}
      </CardContent>
    </Card>
  )
}
