package com.example.cloverkiosk.clover

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
        paymentConnector?.cancel()
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
open class BasePaymentConnectorListener : IPaymentConnectorListener {
    
    companion object {
        private const val TAG = "PaymentListener"
    }
    
    override fun onDeviceConnected() {
        Log.d(TAG, "Device connected")
    }
    
    override fun onDeviceDisconnected() {
        Log.d(TAG, "Device disconnected")
    }
    
    override fun onDeviceReady(merchantInfo: MerchantInfo?) {
        Log.d(TAG, "Device ready: ${merchantInfo?.merchantName}")
    }
    
    override fun onSaleResponse(response: SaleResponse?) {
        response?.let {
            if (it.success) {
                Log.d(TAG, "Sale successful: ${it.payment?.id}")
            } else {
                Log.e(TAG, "Sale failed: ${it.reason} - ${it.message}")
            }
        }
    }
    
    override fun onAuthResponse(response: AuthResponse?) {
        Log.d(TAG, "Auth response received")
    }
    
    override fun onPreAuthResponse(response: PreAuthResponse?) {
        Log.d(TAG, "PreAuth response received")
    }
    
    override fun onCapturePreAuthResponse(response: CapturePreAuthResponse?) {
        Log.d(TAG, "Capture PreAuth response received")
    }
    
    override fun onTipAdjustAuthResponse(response: TipAdjustAuthResponse?) {
        Log.d(TAG, "Tip adjust response received")
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
        Log.d(TAG, "Tip added: ${tip?.tipAmount}")
    }
    
    override fun onDeviceActivityStart(event: CloverDeviceEvent?) {
        Log.d(TAG, "Device activity start: ${event?.eventState}")
    }
    
    override fun onDeviceActivityEnd(event: CloverDeviceEvent?) {
        Log.d(TAG, "Device activity end: ${event?.eventState}")
    }
    
    override fun onDeviceError(event: CloverDeviceErrorEvent?) {
        Log.e(TAG, "Device error: ${event?.errorType} - ${event?.message}")
    }
    
    override fun onRetrievePendingPaymentsResponse(response: RetrievePendingPaymentsResponse?) {
        Log.d(TAG, "Retrieve pending payments response received")
    }
    
    override fun onRetrievePaymentResponse(response: RetrievePaymentResponse?) {
        Log.d(TAG, "Retrieve payment response received")
    }
    
    override fun onPrintJobStatusResponse(response: PrintJobStatusResponse?) {
        Log.d(TAG, "Print job status response received")
    }
    
    override fun onRetrievePrintersResponse(response: RetrievePrintersResponse?) {
        Log.d(TAG, "Retrieve printers response received")
    }
    
    override fun onPrintManualRefundReceipt(request: PrintManualRefundReceiptMessage?) {
        Log.d(TAG, "Print manual refund receipt request received")
    }
    
    override fun onPrintManualRefundDeclineReceipt(request: PrintManualRefundDeclineReceiptMessage?) {
        Log.d(TAG, "Print manual refund decline receipt request received")
    }
    
    override fun onPrintPaymentReceipt(request: PrintPaymentReceiptMessage?) {
        Log.d(TAG, "Print payment receipt request received")
    }
    
    override fun onPrintPaymentDeclineReceipt(request: PrintPaymentDeclineReceiptMessage?) {
        Log.d(TAG, "Print payment decline receipt request received")
    }
    
    override fun onPrintPaymentMerchantCopyReceipt(request: PrintPaymentMerchantCopyReceiptMessage?) {
        Log.d(TAG, "Print payment merchant copy receipt request received")
    }
    
    override fun onPrintRefundPaymentReceipt(request: PrintRefundPaymentReceiptMessage?) {
        Log.d(TAG, "Print refund payment receipt request received")
    }
    
    override fun onCustomActivityResponse(response: CustomActivityResponse?) {
        Log.d(TAG, "Custom activity response received")
    }
    
    override fun onMessageFromActivity(response: MessageFromActivity?) {
        Log.d(TAG, "Message from activity received")
    }
    
    override fun onRetrieveDeviceStatusResponse(response: RetrieveDeviceStatusResponse?) {
        Log.d(TAG, "Retrieve device status response received")
    }
    
    override fun onResetDeviceResponse(response: ResetDeviceResponse?) {
        Log.d(TAG, "Reset device response received")
    }
    
    override fun onDisplayReceiptOptionsResponse(response: DisplayReceiptOptionsResponse?) {
        Log.d(TAG, "Display receipt options response received")
    }
    
    override fun onIncrementPreAuthResponse(response: IncrementPreAuthResponse?) {
        Log.d(TAG, "Increment pre-auth response received")
    }
    
    override fun onCustomerProvidedData(event: CustomerProvidedDataEvent?) {
        Log.d(TAG, "Customer provided data event received")
    }
    
    override fun onCheckBalanceResponse(response: CheckBalanceResponse?) {
        Log.d(TAG, "Check balance response received")
    }
    
    override fun onRequestTipResponse(response: TipResponse?) {
        Log.d(TAG, "Request tip response received")
    }
    
    override fun onSignatureCollected(response: SignatureResponse?) {
        Log.d(TAG, "Signature collected")
    }
    
    override fun asBinder(): android.os.IBinder? = null
}
