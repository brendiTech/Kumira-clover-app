"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { NavHeader } from "@/components/dashboard/nav-header"
import { ProductTable } from "@/components/products/product-table"
import { ProductFormDialog } from "@/components/products/product-form-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Search, Package } from "lucide-react"
import type { Product } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const CATEGORIES = [
  { value: "all", label: "Todas las Categorías" },
  { value: "hot-drinks", label: "Bebidas Calientes" },
  { value: "cold-drinks", label: "Bebidas Frías" },
  { value: "pastries", label: "Pastelería" },
  { value: "sandwiches", label: "Sándwiches" },
  { value: "snacks", label: "Snacks" },
  { value: "other", label: "Otros" },
]

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const { data: products = [], isLoading, mutate } = useSWR<Product[]>(
    "/api/products?all=true",
    fetcher
  )

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleCreateProduct = useCallback(
    async (productData: Partial<Product>) => {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })
      if (!response.ok) throw new Error("Error al crear producto")
      await mutate()
    },
    [mutate]
  )

  const handleUpdateProduct = useCallback(
    async (productData: Partial<Product>) => {
      if (!editingProduct) return
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })
      if (!response.ok) throw new Error("Error al actualizar producto")
      await mutate()
    },
    [editingProduct, mutate]
  )

  const handleDeleteProduct = useCallback(
    async (product: Product) => {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Error al eliminar producto")
      await mutate()
    },
    [mutate]
  )

  const handleToggleAvailability = useCallback(
    async (product: Product) => {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !product.available }),
      })
      if (!response.ok) throw new Error("Error al actualizar producto")
      await mutate()
    },
    [mutate]
  )

  const openCreateDialog = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const activeCount = products.filter((p) => p.available).length
  const inactiveCount = products.filter((p) => !p.available).length

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Productos</h1>
            <p className="text-sm text-muted-foreground">
              Administra el catálogo del kiosco de autoservicio
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Productos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{products.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Activos
              </CardTitle>
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Inactivos
              </CardTitle>
              <div className="h-2 w-2 rounded-full bg-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-muted-foreground">{inactiveCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
            <CardDescription>Busca y filtra productos del catálogo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o descripción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <ProductTable
            products={filteredProducts}
            onEdit={openEditDialog}
            onDelete={handleDeleteProduct}
            onToggleAvailability={handleToggleAvailability}
          />
        )}

        <ProductFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          product={editingProduct}
          onSave={editingProduct ? handleUpdateProduct : handleCreateProduct}
        />
      </main>
    </div>
  )
}
