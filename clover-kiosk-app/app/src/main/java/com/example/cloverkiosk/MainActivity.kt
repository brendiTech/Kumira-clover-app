package com.example.cloverkiosk

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
import com.example.cloverkiosk.clover.BasePaymentConnectorListener
import com.example.cloverkiosk.clover.CloverPaymentHelper
import com.example.cloverkiosk.ui.screens.KioskScreen
import com.example.cloverkiosk.ui.screens.LoginScreen
import com.example.cloverkiosk.ui.theme.CloverKioskTheme
import com.example.cloverkiosk.ui.viewmodel.AuthViewModel
import com.example.cloverkiosk.ui.viewmodel.KioskViewModel
import java.util.UUID

class MainActivity : ComponentActivity() {
    
    companion object {
        private const val TAG = "MainActivity"
    }
    
    private val kioskViewModel: KioskViewModel by viewModels()
    private val authViewModel: AuthViewModel by viewModels()
    private lateinit var paymentHelper: CloverPaymentHelper
    
    private val paymentListener = object : BasePaymentConnectorListener() {
        
        override fun onDeviceReady(merchantInfo: MerchantInfo?) {
            super.onDeviceReady(merchantInfo)
            Log.d(TAG, "Dispositivo Clover listo: ${merchantInfo?.merchantName}")
            runOnUiThread {
                Toast.makeText(
                    this@MainActivity,
                    "Conectado a Clover",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
        
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
        
        override fun onDeviceError(event: CloverDeviceErrorEvent?) {
            super.onDeviceError(event)
            runOnUiThread {
                Toast.makeText(
                    this@MainActivity,
                    "Error del dispositivo: ${event?.message}",
                    Toast.LENGTH_LONG
                ).show()
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
