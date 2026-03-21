"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface RevenueChartProps {
  data: { hour: string; revenue: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value / 100)
  }

  // Filter to show only business hours (6am - 10pm) with some data
  const filteredData = data.filter((_, i) => i >= 6 && i <= 22)

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur col-span-4">
      <CardHeader>
        <CardTitle className="text-foreground">Ingresos por Hora</CardTitle>
        <CardDescription>Desglose de ingresos por hora de hoy</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.70 0.16 200)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="oklch(0.70 0.16 200)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="hour"
              stroke="oklch(0.65 0 0)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="oklch(0.65 0 0)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.16 0.01 270)",
                border: "1px solid oklch(0.28 0.01 270)",
                borderRadius: "8px",
                color: "oklch(0.96 0 0)",
              }}
              formatter={(value: number) => [formatCurrency(value), "Ingresos"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="oklch(0.70 0.16 200)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
