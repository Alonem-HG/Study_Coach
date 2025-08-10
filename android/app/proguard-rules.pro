# Capacitor core & plugins
-keep class com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# Cordova bridge (si existe)
-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**

# AndroidX (silenciar warnings habituales)
-dontwarn androidx.**
-keep class androidx.** { *; }

# WebKit / WebView reflection
-keep class android.webkit.** { *; }

# JSON/Reflection genérica
-keepattributes *Annotation*
-keep class **$$* { *; }
-keep class *.R
-keep class *.R$* { *; }
