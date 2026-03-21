package com.example.cloverkiosk.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cloverkiosk.data.models.CartItem
import com.example.cloverkiosk.data.models.Product
import com.example.cloverkiosk.data.repository.KioskRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class KioskUiState(
    val products: List<Product> = emptyList(),
    val cartItems: List<CartItem> = emptyList(),
    val selectedCategory: String? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
    val orderSuccess: Boolean = false,
    val isProcessingPayment: Boolean = false,
    val merchantId: String? = null
) {
    val categories: List<String>
        get() = products.map { it.category }.distinct().sorted()
    
    val filteredProducts: List<Product>
        get() = if (selectedCategory == null) {
            products
        } else {
            products.filter { it.category == selectedCategory }
        }
    
    val cartTotal: Int
        get() = cartItems.sumOf { it.subtotal }
    
    val cartItemCount: Int
        get() = cartItems.sumOf { it.quantity }
    
    val taxAmount: Int
        get() = (cartTotal * 0.08).toInt() // 8% tax
    
    val grandTotal: Int
        get() = cartTotal + taxAmount
}

class KioskViewModel : ViewModel() {
    
    private val repository = KioskRepository()
    
    private val _uiState = MutableStateFlow(KioskUiState())
    val uiState: StateFlow<KioskUiState> = _uiState.asStateFlow()
    
    fun loadProducts(merchantId: String) {
        // Avoid reloading if same merchant
        if (_uiState.value.merchantId == merchantId && _uiState.value.products.isNotEmpty()) {
            return
        }
        
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null, merchantId = merchantId) }
            
            repository.getProducts(merchantId)
                .onSuccess { products ->
                    _uiState.update { 
                        it.copy(
                            products = products,
                            isLoading = false
                        )
                    }
                }
                .onFailure { error ->
                    _uiState.update { 
                        it.copy(
                            error = error.message ?: "Error al cargar productos",
                            isLoading = false
                        )
                    }
                }
        }
    }
    
    fun selectCategory(category: String?) {
        _uiState.update { it.copy(selectedCategory = category) }
    }
    
    fun addToCart(product: Product) {
        _uiState.update { state ->
            val existingItem = state.cartItems.find { it.product.id == product.id }
            val updatedCart = if (existingItem != null) {
                state.cartItems.map { item ->
                    if (item.product.id == product.id) {
                        item.copy(quantity = item.quantity + 1)
                    } else {
                        item
                    }
                }
            } else {
                state.cartItems + CartItem(product = product, quantity = 1)
            }
            state.copy(cartItems = updatedCart)
        }
    }
    
    fun removeFromCart(productId: String) {
        _uiState.update { state ->
            val existingItem = state.cartItems.find { it.product.id == productId }
            val updatedCart = if (existingItem != null && existingItem.quantity > 1) {
                state.cartItems.map { item ->
                    if (item.product.id == productId) {
                        item.copy(quantity = item.quantity - 1)
                    } else {
                        item
                    }
                }
            } else {
                state.cartItems.filter { it.product.id != productId }
            }
            state.copy(cartItems = updatedCart)
        }
    }
    
    fun clearCart() {
        _uiState.update { it.copy(cartItems = emptyList()) }
    }
    
    fun processPayment(
        paymentMethod: String,
        cloverOrderId: String? = null,
        deviceId: String? = null
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isProcessingPayment = true) }
            
            val state = _uiState.value
            val merchantId = state.merchantId ?: return@launch
            
            repository.createOrder(
                merchantId = merchantId,
                cartItems = state.cartItems,
                total = state.grandTotal,
                tax = state.taxAmount,
                paymentMethod = paymentMethod,
                cloverOrderId = cloverOrderId,
                deviceId = deviceId
            )
                .onSuccess {
                    _uiState.update { 
                        it.copy(
                            cartItems = emptyList(),
                            orderSuccess = true,
                            isProcessingPayment = false
                        )
                    }
                }
                .onFailure { error ->
                    _uiState.update { 
                        it.copy(
                            error = error.message ?: "Error al procesar pedido",
                            isProcessingPayment = false
                        )
                    }
                }
        }
    }
    
    fun dismissOrderSuccess() {
        _uiState.update { it.copy(orderSuccess = false) }
    }
    
    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}
