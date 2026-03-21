"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { Coffee, RefreshCw } from "lucide-react"

interface DashboardHeaderProps {
  period: string
  onPeriodChange: (period: string) => void
  onRefresh: () => void
  isLoading: boolean
}

export function DashboardHeader({ period, onPeriodChange, onRefresh, isLoading }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
          <Coffee className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clover Analytics</h1>
          <p className="text-sm text-muted-foreground">Rendimiento del kiosco de autoservicio</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-[160px] border-border/50 bg-card/50">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mes</SelectItem>
          </SelectContent>
        </Select>
        <ThemeToggle />
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="border-border/50 bg-card/50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  )
}
