package com.example.cloverkiosk.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.cloverkiosk.data.local.MerchantSession
import com.example.cloverkiosk.data.remote.SupabaseClientProvider
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.builtin.Email
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthState(
    val isLoading: Boolean = false,
    val isLoggedIn: Boolean = false,
    val merchantId: String? = null,
    val businessName: String? = null,
    val error: String? = null
)

class AuthViewModel(application: Application) : AndroidViewModel(application) {
    
    private val supabase = SupabaseClientProvider.client
    private val session = MerchantSession(application)
    
    private val _authState = MutableStateFlow(
        AuthState(isLoggedIn = session.isLoggedIn, merchantId = session.merchantId, businessName = session.businessName)
    )
    val authState: StateFlow<AuthState> = _authState.asStateFlow()
    
    fun login(email: String, password: String) {
        viewModelScope.launch {
            _authState.value = _authState.value.copy(isLoading = true, error = null)
            
            try {
                supabase.auth.signInWith(Email) {
                    this.email = email
                    this.password = password
                }
                
                val user = supabase.auth.currentUserOrNull()
                if (user != null) {
                    // Fetch merchant info
                    val merchant = supabase.postgrest
                        .from("merchants")
                        .select {
                            filter { eq("id", user.id) }
                        }
                        .decodeSingleOrNull<MerchantData>()
                    
                    val businessName = merchant?.businessName ?: "Mi Comercio"
                    
                    // Save session
                    session.saveSession(
                        merchantId = user.id,
                        email = email,
                        businessName = businessName
                    )
                    
                    _authState.value = AuthState(
                        isLoggedIn = true,
                        merchantId = user.id,
                        businessName = businessName
                    )
                }
            } catch (e: Exception) {
                _authState.value = _authState.value.copy(
                    isLoading = false,
                    error = when {
                        e.message?.contains("Invalid login") == true -> "Email o contraseña incorrectos"
                        else -> e.message ?: "Error al iniciar sesión"
                    }
                )
            }
        }
    }
    
    fun logout() {
        viewModelScope.launch {
            try {
                supabase.auth.signOut()
            } catch (e: Exception) {
                // Ignore errors
            }
            session.clearSession()
            _authState.value = AuthState()
        }
    }
    
    fun clearError() {
        _authState.value = _authState.value.copy(error = null)
    }
}

@kotlinx.serialization.Serializable
private data class MerchantData(
    @kotlinx.serialization.SerialName("business_name")
    val businessName: String
)
