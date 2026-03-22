package com.kumira.kiosk

import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.clover.sdk.v3.remotepay.*
import com.kumira.kiosk.clover.BasePaymentConnectorListener
import com.kumira.kiosk.clover.CloverPaymentHelper
import com.kumira.kiosk.ui.screens.KioskScreen
import com.kumira.kiosk.ui.screens.LoginScreen
import com.kumira.kiosk.ui.theme.CloverKioskTheme
import com.kumira.kiosk.ui.viewmodel.AuthViewModel
import com.kumira.kiosk.ui.viewmodel.KioskViewModel
import java.util.UUID

class MainActivity : ComponentActivity() {
    
    companion object {
        private const val TAG = "MainActivity"
    }
    
    private val kioskViewModel: KioskViewModel by viewModels()
    private val authViewModel: AuthViewModel by viewModels()
    private lateinit var paymentHelper: CloverPaymentHelper
    
    private val paymentListener = object : BasePaymentConnectorListener() {
        

        
        override fun onSaleResponse(response: SaleResponse?) {
            super.onSaleResponse(response)
            runOnUiThread {
                response?.let {
                    if (it.success) {
                        // Payment successful - save order to Supabase
                        kioskViewModel.processPayment(
                            paymentMethod = "card",
                            cloverOrderId = it.payment?.order?.id,
                            deviceId = android.os.Build.SERIAL
                        )
                        Toast.makeText(
                            this@MainActivity,
                            "¡Pago exitoso!",
                            Toast.LENGTH_SHORT
                        ).show()
                    } else {
                        Toast.makeText(
                            this@MainActivity,
                            "Pago fallido: ${it.reason}",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }
            }
        }
        

    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Clover payment helper
        paymentHelper = CloverPaymentHelper(this)
        paymentHelper.initialize(paymentListener)
        
        setContent {
            CloverKioskTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val authState by authViewModel.authState.collectAsState()
                    
                    if (authState.isLoggedIn && authState.merchantId != null) {
                        // Kiosk is configured - show product screen
                        KioskScreen(
                            viewModel = kioskViewModel,
                            merchantId = authState.merchantId!!,
                            businessName = authState.businessName ?: "Mi Comercio",
                            onPaymentRequested = { totalCents ->
                                processCloverPayment(totalCents)
                            },
                            onLogout = {
                                authViewModel.logout()
                            }
                        )
                    } else {
                        // Show login screen for merchant configuration
                        LoginScreen(
                            authState = authState,
                            onLogin = { email, password ->
                                authViewModel.login(email, password)
                            },
                            onClearError = {
                                authViewModel.clearError()
                            }
                        )
                    }
                }
            }
        }
    }
    
    private fun processCloverPayment(amountCents: Int) {
        try {
            val externalId = UUID.randomUUID().toString()
            paymentHelper.processSale(amountCents.toLong(), externalId)
        } catch (e: Exception) {
            Log.e(TAG, "Error procesando pago", e)
            // Fallback for testing without Clover device
            Toast.makeText(
                this,
                "Clover no disponible - simulando pago",
                Toast.LENGTH_SHORT
            ).show()
            
            // Simulate successful payment for development
            kioskViewModel.processPayment(
                paymentMethod = "simulated",
                cloverOrderId = null,
                deviceId = "dev_device"
            )
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        paymentHelper.dispose()
    }
}
