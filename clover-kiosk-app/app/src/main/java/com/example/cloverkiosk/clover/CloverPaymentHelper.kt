package com.kumira.kiosk.clover

import android.content.Context
import android.os.IInterface
import android.util.Log
import com.clover.connector.sdk.v3.PaymentConnector
import com.clover.connector.sdk.v3.PaymentV3Connector
import com.clover.sdk.util.CloverAccount
import com.clover.sdk.v1.Intents
import com.clover.sdk.v3.connector.IPaymentConnectorListener
import com.clover.sdk.v3.payments.Payment
import com.clover.sdk.v3.remotepay.*
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

/**
 * Helper class for handling Clover payments.
 * 
 * This class wraps the Clover Payment Connector SDK to provide
 * a simpler interface for processing payments on Clover devices.
 */
class CloverPaymentHelper(private val context: Context) {
    
    private var paymentConnector: PaymentConnector? = null
    private var isConnected = false
    
    companion object {
        private const val TAG = "CloverPaymentHelper"
    }
    
    /**
     * Initialize the payment connector.
     * Must be called before processing any payments.
     */
    fun initialize(listener: IPaymentConnectorListener) {
        try {
            val account = CloverAccount.getAccount(context)
            if (account == null) {
                Log.e(TAG, "Clover account not found - are you running on a Clover device?")
                return
            }
            
            paymentConnector = PaymentConnector(
                context,
                account,
                listener,
                "com.example.cloverkiosk"
            )
            
            paymentConnector?.initializeConnection()
            Log.d(TAG, "Payment connector initialized")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize payment connector", e)
        }
    }
    
    /**
     * Process a sale transaction.
     * 
     * @param amountCents The amount to charge in cents
     * @param externalId A unique ID for this transaction (for idempotency)
     */
    fun processSale(amountCents: Long, externalId: String) {
        val saleRequest = SaleRequest().apply {
            amount = amountCents
            this.externalId = externalId
            cardEntryMethods = Intents.CARD_ENTRY_METHOD_MAG_STRIPE or
                    Intents.CARD_ENTRY_METHOD_ICC_CONTACT or
                    Intents.CARD_ENTRY_METHOD_NFC_CONTACTLESS
            allowOfflinePayment = false
            approveOfflinePaymentWithoutPrompt = false
            autoAcceptPaymentConfirmations = true
            autoAcceptSignature = true
        }
        
        paymentConnector?.sale(saleRequest)
        Log.d(TAG, "Sale request sent for amount: $amountCents cents")
    }
    
    /**
     * Cancel the current transaction.
     */
    fun cancelTransaction() {
        // paymentConnector?.cancel() — method not available in SDK 262.2
    }
    
    /**
     * Clean up resources.
     * Call this when the activity is destroyed.
     */
    fun dispose() {
        try {
            paymentConnector?.dispose()
            paymentConnector = null
            isConnected = false
            Log.d(TAG, "Payment connector disposed")
        } catch (e: Exception) {
            Log.e(TAG, "Error disposing payment connector", e)
        }
    }
}

/**
 * Base implementation of payment connector listener.
 * Extend this class and override methods as needed.
 */
abstract class BasePaymentConnectorListener : IPaymentConnectorListener {
    
    companion object {
        private const val TAG = "PaymentListener"
    }
    
    override fun onDeviceConnected() {
        Log.d(TAG, "Device connected")
    }

    override fun onDeviceDisconnected() {
        Log.d(TAG, "Device disconnected")
    }

    override fun onSaleResponse(response: SaleResponse?) {
        Log.d(TAG, "Sale response received: ${response?.success}")
    }

    override fun onAuthResponse(response: AuthResponse?) {
        Log.d(TAG, "Auth response received")
    }

    override fun onPreAuthResponse(response: PreAuthResponse?) {
        Log.d(TAG, "Pre-auth response received")
    }

    override fun onCapturePreAuthResponse(response: CapturePreAuthResponse?) {
        Log.d(TAG, "Capture pre-auth response received")
    }

    override fun onTipAdjustAuthResponse(response: TipAdjustAuthResponse?) {
        Log.d(TAG, "Tip adjust auth response received")
    }

    override fun onVoidPaymentResponse(response: VoidPaymentResponse?) {
        Log.d(TAG, "Void payment response received")
    }

    override fun onRefundPaymentResponse(response: RefundPaymentResponse?) {
        Log.d(TAG, "Refund payment response received")
    }

    override fun onManualRefundResponse(response: ManualRefundResponse?) {
        Log.d(TAG, "Manual refund response received")
    }

    override fun onVaultCardResponse(response: VaultCardResponse?) {
        Log.d(TAG, "Vault card response received")
    }

    override fun onReadCardDataResponse(response: ReadCardDataResponse?) {
        Log.d(TAG, "Read card data response received")
    }

    override fun onCloseoutResponse(response: CloseoutResponse?) {
        Log.d(TAG, "Closeout response received")
    }

    override fun onVerifySignatureRequest(request: VerifySignatureRequest?) {
        Log.d(TAG, "Verify signature request received")
    }

    override fun onConfirmPaymentRequest(request: ConfirmPaymentRequest?) {
        Log.d(TAG, "Confirm payment request received")
    }

    override fun onTipAdded(tip: TipAdded?) {
        Log.d(TAG, "Tip added")
    }

    override fun onRetrievePendingPaymentsResponse(response: RetrievePendingPaymentsResponse?) {
        Log.d(TAG, "Retrieve pending payments response received")
    }

    override fun onRetrievePaymentResponse(response: RetrievePaymentResponse?) {
        Log.d(TAG, "Retrieve payment response received")
    }

    override fun onVoidPaymentRefundResponse(response: VoidPaymentRefundResponse?) {
        Log.d(TAG, "Void payment refund response received")
    }
}
