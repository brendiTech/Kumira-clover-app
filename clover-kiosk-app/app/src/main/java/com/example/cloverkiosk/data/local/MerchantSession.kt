package com.kumira.kiosk.data.local

import android.content.Context
import android.content.SharedPreferences
import androidx.core.content.edit

/**
 * Manages merchant session for the kiosk app.
 * Stores the merchant ID after login so customers can use the kiosk.
 */
class MerchantSession(context: Context) {
    
    private val prefs: SharedPreferences = context.getSharedPreferences(
        PREFS_NAME, 
        Context.MODE_PRIVATE
    )
    
    var merchantId: String?
        get() = prefs.getString(KEY_MERCHANT_ID, null)
        set(value) = prefs.edit { putString(KEY_MERCHANT_ID, value) }
    
    var merchantEmail: String?
        get() = prefs.getString(KEY_MERCHANT_EMAIL, null)
        set(value) = prefs.edit { putString(KEY_MERCHANT_EMAIL, value) }
    
    var businessName: String?
        get() = prefs.getString(KEY_BUSINESS_NAME, null)
        set(value) = prefs.edit { putString(KEY_BUSINESS_NAME, value) }
    
    val isLoggedIn: Boolean
        get() = merchantId != null
    
    fun saveSession(merchantId: String, email: String, businessName: String) {
        prefs.edit {
            putString(KEY_MERCHANT_ID, merchantId)
            putString(KEY_MERCHANT_EMAIL, email)
            putString(KEY_BUSINESS_NAME, businessName)
        }
    }
    
    fun clearSession() {
        prefs.edit {
            remove(KEY_MERCHANT_ID)
            remove(KEY_MERCHANT_EMAIL)
            remove(KEY_BUSINESS_NAME)
        }
    }
    
    companion object {
        private const val PREFS_NAME = "merchant_session"
        private const val KEY_MERCHANT_ID = "merchant_id"
        private const val KEY_MERCHANT_EMAIL = "merchant_email"
        private const val KEY_BUSINESS_NAME = "business_name"
    }
}
