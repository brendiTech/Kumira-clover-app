package com.kumira.kiosk.data.repository

import com.kumira.kiosk.data.models.CartItem
import com.kumira.kiosk.data.models.Order
import com.kumira.kiosk.data.models.OrderItem
import com.kumira.kiosk.data.models.Product
import com.kumira.kiosk.data.remote.SupabaseClientProvider
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class KioskRepository {
    
    private val supabase = SupabaseClientProvider.client
    
    /**
     * Get available products for a specific merchant
     */
    suspend fun getProducts(merchantId: String): Result<List<Product>> = withContext(Dispatchers.IO) {
        try {
            val products = supabase.postgrest
                .from("products")
                .select {
                    filter {
                        eq("user_id", merchantId)
                        eq("available", true)
                    }
                }
                .decodeList<Product>()
            Result.success(products)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Create an order for a specific merchant
     */
    suspend fun createOrder(
        merchantId: String,
        cartItems: List<CartItem>,
        total: Int,
        tax: Int,
        paymentMethod: String,
        cloverOrderId: String?,
        deviceId: String?
    ): Result<Order> = withContext(Dispatchers.IO) {
        try {
            // Create the order with user_id for RLS
            val order = Order(
                merchantId = merchantId,
                userId = merchantId,
                total = total,
                tax = tax,
                status = "completed",
                paymentMethod = paymentMethod,
                cloverOrderId = cloverOrderId,
                deviceId = deviceId
            )
            
            val createdOrder = supabase.postgrest
                .from("orders")
                .insert(order) {
                    select()
                }
                .decodeSingle<Order>()
            
            // Create order items
            val orderItems = cartItems.map { cartItem ->
                OrderItem(
                    orderId = createdOrder.id!!,
                    productId = cartItem.product.id,
                    quantity = cartItem.quantity,
                    unitPrice = cartItem.product.price,
                    subtotal = cartItem.subtotal
                )
            }
            
            supabase.postgrest
                .from("order_items")
                .insert(orderItems)
            
            Result.success(createdOrder)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
