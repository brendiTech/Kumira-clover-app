package com.example.cloverkiosk.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Product(
    val id: String,
    val name: String,
    val description: String? = null,
    val price: Int, // Price in cents
    val category: String,
    @SerialName("image_url")
    val imageUrl: String? = null,
    val available: Boolean = true,
    @SerialName("clover_item_id")
    val cloverItemId: String? = null,
    @SerialName("user_id")
    val userId: String? = null,
    @SerialName("created_at")
    val createdAt: String? = null
)

@Serializable
data class Order(
    val id: String? = null,
    @SerialName("clover_order_id")
    val cloverOrderId: String? = null,
    @SerialName("merchant_id")
    val merchantId: String,
    @SerialName("user_id")
    val userId: String? = null,
    val total: Int, // Total in cents
    val tax: Int = 0,
    val status: String = "pending",
    @SerialName("payment_method")
    val paymentMethod: String? = null,
    @SerialName("device_id")
    val deviceId: String? = null,
    @SerialName("created_at")
    val createdAt: String? = null
)

@Serializable
data class OrderItem(
    val id: String? = null,
    @SerialName("order_id")
    val orderId: String,
    @SerialName("product_id")
    val productId: String,
    val quantity: Int = 1,
    @SerialName("unit_price")
    val unitPrice: Int,
    val subtotal: Int,
    @SerialName("created_at")
    val createdAt: String? = null
)

data class CartItem(
    val product: Product,
    var quantity: Int = 1
) {
    val subtotal: Int get() = product.price * quantity
}
