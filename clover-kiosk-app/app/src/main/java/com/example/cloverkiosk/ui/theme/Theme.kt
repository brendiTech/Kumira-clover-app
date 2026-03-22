package com.kumira.kiosk.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Coffee shop warm color palette
private val Primary = Color(0xFFD4A574) // Warm coffee brown
private val PrimaryContainer = Color(0xFF8B5A2B) // Darker brown
private val Secondary = Color(0xFF6B8E23) // Olive green accent
private val SecondaryContainer = Color(0xFF3D5C19)
private val Background = Color(0xFF1A1614) // Dark warm background
private val Surface = Color(0xFF2D2420) // Slightly lighter surface
private val SurfaceVariant = Color(0xFF3D332C)
private val OnPrimary = Color(0xFF1A1614)
private val OnSecondary = Color(0xFFFFFFFF)
private val OnBackground = Color(0xFFF5F0EB)
private val OnSurface = Color(0xFFF5F0EB)
private val Error = Color(0xFFCF6679)

private val DarkColorScheme = darkColorScheme(
    primary = Primary,
    onPrimary = OnPrimary,
    primaryContainer = PrimaryContainer,
    secondary = Secondary,
    onSecondary = OnSecondary,
    secondaryContainer = SecondaryContainer,
    background = Background,
    onBackground = OnBackground,
    surface = Surface,
    onSurface = OnSurface,
    surfaceVariant = SurfaceVariant,
    error = Error
)

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF8B5A2B),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD4A574),
    secondary = Color(0xFF6B8E23),
    onSecondary = Color.White,
    background = Color(0xFFFAF7F4),
    onBackground = Color(0xFF1A1614),
    surface = Color.White,
    onSurface = Color(0xFF1A1614),
    surfaceVariant = Color(0xFFF0EBE6)
)

@Composable
fun CloverKioskTheme(
    darkTheme: Boolean = true, // Default to dark for kiosk
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
