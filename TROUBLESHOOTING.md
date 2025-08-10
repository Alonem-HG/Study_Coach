# 🛠 Troubleshooting – Study Coach App

Este documento recopila **problemas comunes**, sus **soluciones**, y el **flujo visual** para la reproducción de audio TTS en Android (incluyendo dispositivos Samsung).

---

## ❗ Problemas Comunes y Soluciones

### 1. **`JAVA_HOME is not set`**
**Causa:** Variable de entorno `JAVA_HOME` no configurada.  
**Solución:**
```powershell
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
```

---

### 2. **`invalid source release: 21`**
**Causa:** Módulos configurados para Java 21 mientras el proyecto usa JDK 17.  
**Solución:**
- Buscar y reemplazar `JavaVersion.VERSION_21` por `JavaVersion.VERSION_17`.

---

### 3. **`Using '--release' option for JavaCompile is not supported`**
**Causa:** Configuración incorrecta en Gradle al usar `options.release`.  
**Solución:**
```gradle
compileOptions {
    sourceCompatibility JavaVersion.VERSION_17
    targetCompatibility JavaVersion.VERSION_17
}
```

---

### 4. **Audio TTS no se reproduce en Android/Samsung**
**Causa:** Android bloquea audio hasta que hay interacción del usuario.  
**Solución:**
```javascript
function initAudioUnlock() {
    if (window.AUDIO_UNLOCKED) return;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioCtx.createBuffer(1, 1, 22050);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start(0);

    const u = new SpeechSynthesisUtterance(" ");
    u.lang = 'en-US'; // o 'es-MX' según idioma
    speechSynthesis.cancel();
    setTimeout(() => {
        try {
            audioCtx.resume();
            speechSynthesis.speak(u);
            window.AUDIO_UNLOCKED = true;
        } catch {}
    }, 0);
}
```

---

### 5. **`BuildConfig` no encontrado**
**Causa:** Uso fuera de contexto o falta de importación.  
**Solución:** Eliminar o importar correctamente:
```java
import com.tuempresa.studycoach.BuildConfig;
```

---

## 📊 Diagrama de Flujo – Audio TTS Desbloqueado

```mermaid
flowchart TD
    A[Usuario abre la app] --> B[Detectar idioma preferido]
    B --> C[Esperar interacción del usuario]
    C --> D[initAudioUnlock()]
    D --> E[Crear AudioContext]
    E --> F[Reproducir sonido silencioso]
    F --> G[Inicializar SpeechSynthesis]
    G --> H[Usuario solicita tip]
    H --> I[Generar SpeechSynthesisUtterance]
    I --> J[Asignar utter.lang según idioma]
    J --> K[Reproducir con speechSynthesis.speak()]
    K --> L[Tip reproducido con audio]
```

---

## 🔍 Notas para Desarrolladores

- El desbloqueo de audio es **obligatorio en Android**, especialmente en Samsung.
- Asegúrate de que el idioma (`utter.lang`) sea compatible con el motor TTS del dispositivo.
- Evitar usar `unlockTTSOnce()` antiguo, ahora usamos `initAudioUnlock()`.

---

## 📥 Instalación en Teléfono Android

1. **Generar APK de depuración**
   ```powershell
   cd android
   .\gradlew assembleDebug
   ```
2. **Instalar en el teléfono**
   - Activar instalación de fuentes desconocidas.
   - Instalar vía USB con:
     ```powershell
     adb install app-debug.apk
     ```

---

## 🗂 Archivos Relacionados

- [`App.js`](./App.js) – Lógica principal de la app
- [`README.md`](./README.md) – Descripción general del proyecto
- [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) – Este documento
