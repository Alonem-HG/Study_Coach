# 📚 Study Coach App
Created with CodeSandbox

# Documentación de Desarrollo

## 📌 Descripción
**Study Coach** es una aplicación híbrida desarrollada con **React** y empaquetada para Android usando **Capacitor**.  
Permite a los usuarios recibir tips de estudio y mensajes motivacionales **con síntesis de voz (TTS)**, soportando múltiples idiomas y con compatibilidad mejorada para dispositivos Android (incluidos Samsung y otros que bloquean el audio por defecto).

---

## 🛠 Tecnologías Utilizadas

- **Frontend**
  - React
  - JavaScript (ES6+)
  - HTML5 / CSS3
- **Backend local**
  - No aplica (lógica manejada en cliente)
- **Integración Nativa**
  - Capacitor
  - Android SDK
- **Herramientas de Build**
  - Gradle
  - npm / Node.js
- **API de Navegador**
  - [`SpeechSynthesis`](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) para TTS
  - [`AudioContext`](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) para desbloquear audio en Android
- **Compatibilidad**
  - Android 7+ (minSdkVersion 23)
  - Probado en dispositivos con idioma **MX (es-MX)** y **US (en-US)**

---

## 🔄 Lógica General

1. **Carga inicial de la app**
   - Configura estado de idioma (`lang`) y mensajes.
   - Prepara la API de TTS (`SpeechSynthesis`).
   - Ejecuta `initAudioUnlock()` para habilitar audio en navegadores móviles.

2. **Desbloqueo de audio en Android**
   - **Problema:** En Android (especialmente Samsung), el audio no se reproduce hasta que hay interacción del usuario.
   - **Solución:** Crear un `AudioContext` y reproducir un sonido silencioso tras la primera interacción.

3. **Selección y reproducción de tip**
   - El usuario presiona un botón o un evento dispara un tip.
   - Se genera un `SpeechSynthesisUtterance` con el texto del tip.
   - Se establece `utter.lang` según configuración (`es-MX`, `en-US`, etc.).
   - Se reproduce el audio con `speechSynthesis.speak()`.

4. **Soporte multilenguaje**
   - `lang` dinámico configurado por el usuario o detectado automáticamente.
   - Lógica ajustada para manejar cualquier idioma soportado por el motor TTS del dispositivo.

---

## 📜 Seudocódigo de la Lógica

```pseudo
onAppLoad():
    setLang(userPreferredLang)
    initAudioUnlock()

initAudioUnlock():
    if not alreadyUnlocked:
        waitForFirstUserInteraction()
        createAudioContext()
        playSilentBuffer()
        unlockSpeechSynthesis()

playTip(text, lang):
    utter = new SpeechSynthesisUtterance(text)
    utter.lang = lang
    speechSynthesis.cancel()
    speechSynthesis.speak(utter)

onButtonPress():
    tip = getRandomTip()
    playTip(tip, currentLang)
```

---

## :warning: Solución de problemas
TROUBLESHOOTING.md 
