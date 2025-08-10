import React, { useEffect, useState } from "react";
import "./styles.css"; // estilos
<<<<<<< HEAD
=======
import { TextToSpeech } from '@capacitor-community/text-to-speech';


// ===== TTS universal (nativo + fallback web) =====
let AUDIO_CTX;
function unlockWebAudioOnce() {
  try {
    if (AUDIO_CTX && AUDIO_CTX.state === "running") return;
    AUDIO_CTX = AUDIO_CTX || new (window.AudioContext || window.webkitAudioContext)();
    const osc = AUDIO_CTX.createOscillator();
    const gain = AUDIO_CTX.createGain();
    gain.gain.value = 0.0001; // inaudible
    osc.connect(gain).connect(AUDIO_CTX.destination);
    osc.start(0);
    setTimeout(() => { try { osc.stop(); } catch {} }, 30);
    if (AUDIO_CTX.state !== "running") AUDIO_CTX.resume?.();
  } catch {}
}

// Detecta idioma por contenido o navegador
function detectLang(text) {
  if (!text) return navigator.language || 'en-US';
  if (/[áéíóúñü]/i.test(text)) return 'es-MX';           // español (preferencia MX)
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh-CN';      // chino
  if (/[\u3040-\u30FF]/.test(text)) return 'ja-JP';      // japonés
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko-KR';      // coreano
  if (/[a-z]/i.test(text)) return 'en-US';               // latino básico -> inglés
  return navigator.language || 'en-US';
}

// Inicializa desbloqueo de audio al primer gesto
function initAudioUnlock() {
  const unlockAll = () => {
    unlockWebAudioOnce();
    try { window.speechSynthesis.resume(); } catch {}
  };
  const opts = { once: true, passive: true };
  window.addEventListener("pointerdown", unlockAll, opts);
  window.addEventListener("touchstart", unlockAll, opts);
  window.addEventListener("click", unlockAll, opts);
  document.addEventListener("visibilitychange", () => {
    try { window.speechSynthesis.resume(); AUDIO_CTX?.resume?.(); } catch {}
  });
}

>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)

export default function StudyCoach() {
  const [tab, setTab] = useState("practica");
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);

<<<<<<< HEAD
  // Repetición al acertar
  const [repeatSetting, setRepeatSetting] = useState(1); // 1–5
  const [repeatLeft, setRepeatLeft] = useState(0);

  // Cloze nuevo
  const [revealedKeys, setRevealedKeys] = useState([]); // palabras clave reveladas
  const [typedHitsFirst3, setTypedHitsFirst3] = useState([]); // aciertos en los 3 primeros intentos

  // Utils TTS
  const speak = (text) => {
    if (!text) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  };

  const normalize = (s) =>
    String(s)
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");
=======
  const [repeatSetting, setRepeatSetting] = useState(1);
  const [repeatLeft, setRepeatLeft] = useState(0);

  // Cloze nuevo
  const [revealedKeys, setRevealedKeys] = useState([]);
  const [typedHitsFirst3, setTypedHitsFirst3] = useState([]);

  // ---- Utils ----
const speak = async (text, opts = {}) => {
  if (!text) return;
  const langToUse = opts.lang || detectLang(text);

  // 1) TTS nativo (Capacitor)
  try {
    await TextToSpeech.speak({
      text,
      lang: langToUse,
      rate: opts.rate ?? 1.0,
      pitch: opts.pitch ?? 1.0,
      volume: opts.volume ?? 1.0,
      category: 'ambient',
    });
    return;
  } catch (err) {
    console.warn("TTS nativo falló, uso Web Speech:", err);
  }

  // 2) Fallback: Web Speech
  try {
    const synth = window.speechSynthesis;
    synth.cancel(); synth.resume();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = langToUse;
    utter.rate = opts.rate ?? 1.0;
    setTimeout(() => { try { synth.resume(); synth.speak(utter); } catch {} }, 0);
  } catch (err) {
    console.error("Web Speech falló:", err);
  }
};

  const normalize = (s) =>
    String(s).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)

  const isCorrect = (user, answers) => {
    const cand = normalize(user);
    return (answers || []).some((ans) => normalize(ans) === cand);
  };

<<<<<<< HEAD
  // Stopwords ES/EN (para detectar palabras clave)
  const STOP = new Set([
    "el",
    "la",
    "los",
    "las",
    "un",
    "una",
    "unos",
    "unas",
    "de",
    "del",
    "al",
    "y",
    "o",
    "u",
    "que",
    "en",
    "con",
    "por",
    "para",
    "como",
    "es",
    "son",
    "a",
    "se",
    "su",
    "sus",
    "lo",
    "le",
    "les",
    "si",
    "no",
    "ya",
    "muy",
    "más",
    "mas",
    "pero",
    "también",
    "tambien",
    "esto",
    "esta",
    "ese",
    "esa",
    "eso",
    "este",
    "esta",
    "estos",
    "estas",
    "esas",
    "esos",
    "mi",
    "mis",
    "tu",
    "tus",
    "al",
    "del",
    "sobre",
    "entre",
    "donde",
    "cuando",
    "cuándo",
    "qué",
    "que",
    "cuanto",
    "cuánta",
    "cuantos",
    "cuántos",
    "una",
    "uno",
    "dos",
    "tres",
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "so",
    "to",
    "of",
    "in",
    "on",
    "for",
    "by",
    "with",
    "as",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "at",
    "from",
    "that",
    "this",
    "these",
    "those",
    "it",
    "its",
    "into",
    "during",
    "after",
    "before",
    "over",
    "under",
    "while",
    "then",
    "than",
    "also",
=======
  const STOP = new Set([
    "el","la","los","las","un","una","unos","unas","de","del","al","y","o","u","que","en","con","por","para","como","es","son","a","se","su","sus","lo","le","les","si","no","ya","muy","más","mas","pero","también","tambien","esto","esta","ese","esa","eso","este","esta","estos","estas","esas","esos","mi","mis","tu","tus","al","del","sobre","entre","donde","cuando","cuándo","qué","que","cuanto","cuánta","cuantos","cuántos","una","uno","dos","tres",
    "the","a","an","and","or","but","so","to","of","in","on","for","by","with","as","is","are","was","were","be","been","being","at","from","that","this","these","those","it","its","into","during","after","before","over","under","while","then","than","also"
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
  ]);

  const getKeywords = (text) => {
    if (!text) return [];
    const seen = new Set();
<<<<<<< HEAD
    const tokens = text
      .split(/(\s+|[^A-Za-z0-9ÁÉÍÓÚÜáéíóúüñÑ']+)/)
      .filter(Boolean);
=======
    const tokens = text.split(/(\s+|[^A-Za-z0-9ÁÉÍÓÚÜáéíóúüñÑ']+)/).filter(Boolean);
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
    const out = [];
    for (const t of tokens) {
      if (/^\s+$/.test(t)) continue;
      const base = normalize(t).replace(/[^a-z0-9']/g, "");
      if (!base) continue;
      if ((STOP.has(base) && base.length < 5) || base.length < 3) continue;
      if (!seen.has(base)) {
        seen.add(base);
        out.push(base);
      }
    }
    return out;
  };

  const current = items[currentIndex];
<<<<<<< HEAD
=======
  const baseAnswer = current?.answers?.[0] || "";
  const allKeys = getKeywords(baseAnswer);
  const hiddenSetFromKeys = new Set(allKeys);
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)

  // Seed + persistencia
  useEffect(() => {
    const raw = localStorage.getItem("studycoach_items_v5");
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {}
    } else {
      setItems([
<<<<<<< HEAD
        {
          id: crypto.randomUUID(),
          question: "¿Capital de España?",
          answers: ["Madrid"],
          hint: "Geografía Europa",
        },
=======
        { id: crypto.randomUUID(), question: "¿Capital de España?", answers: ["Madrid"], hint: "Geografía Europa" },
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
        {
          id: crypto.randomUUID(),
          question: "What is an Exception?",
          answers: [
<<<<<<< HEAD
            "An error that occurs during the execution of a program, disrupting its normal flow. Java uses try-catch blocks to handle exceptions.",
=======
            "An error that occurs during the execution of a program, disrupting its normal flow. Java uses try-catch blocks to handle exceptions."
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
          ],
          hint: "Java error try catch program flow",
        },
      ]);
    }
  }, []);

<<<<<<< HEAD
=======
useEffect(() => {
  initAudioUnlock(); // desbloqueo audio (WebAudio + Web Speech)
}, []);



>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
  useEffect(() => {
    localStorage.setItem("studycoach_items_v5", JSON.stringify(items));
  }, [items]);

<<<<<<< HEAD
  // ---------- Cloze (nuevo comportamiento) ----------
  const baseAnswer = current?.answers?.[0] || "";
  const allKeys = getKeywords(baseAnswer); // TODAS las palabras clave a ocultar
  const hiddenSetFromKeys = new Set(allKeys);

=======
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
  const computeTypedKeyHits = (text, keysSet) => {
    const hits = new Set();
    const words = String(text)
      .split(/\s+/)
      .map((w) => normalize(w).replace(/[^a-z0-9']/g, ""))
      .filter(Boolean);
    for (const w of words) if (keysSet.has(w)) hits.add(w);
    return Array.from(hits);
  };

<<<<<<< HEAD
  // ---------- Envío de respuesta ----------
  const submit = () => {
    if (!current) return;

    // Correcto
=======
  const submit = () => {
    if (!current) return;

>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
    if (isCorrect(answer, current.answers)) {
      speak("Correcto");
      setAttempts(0);
      setRevealedKeys([]);
      setTypedHitsFirst3([]);
<<<<<<< HEAD
      setRepeatLeft(repeatSetting - 1); // repetir n-1 veces
      return;
    }

    // Incorrecto
    const nextAttempts = attempts + 1;

    // Durante los 3 primeros intentos, acumula aciertos parciales (palabras clave presentes en la respuesta)
=======
      setRepeatLeft(repeatSetting - 1);
      return;
    }

    const nextAttempts = attempts + 1;

>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
    if (nextAttempts <= 3) {
      const hits = computeTypedKeyHits(answer, hiddenSetFromKeys);
      if (hits.length) {
        setTypedHitsFirst3((prev) => Array.from(new Set([...prev, ...hits])));
      }
    }

<<<<<<< HEAD
    // Al llegar exactamente al 3er intento fallido, fija como reveladas las palabras acertadas en esos 3 intentos
    if (nextAttempts === 3) {
      setRevealedKeys((prev) => {
        const base = new Set(prev);
        for (const w of typedHitsFirst3) base.add(w);
        return Array.from(base);
      });
    }

    // A partir del 4º fallo, revela 1 palabra oculta aleatoria por cada fallo
    if (nextAttempts > 3) {
      setRevealedKeys((prevArr) => {
        const currentRevealed = new Set(prevArr);
        const remaining = allKeys.filter((k) => !currentRevealed.has(k));
        if (remaining.length > 0) {
          const pick = remaining[Math.floor(Math.random() * remaining.length)];
          currentRevealed.add(pick);
        }
        return Array.from(currentRevealed);
=======
    if (nextAttempts === 3) {
      setRevealedKeys((prev) => {
        const s = new Set(prev);
        for (const w of typedHitsFirst3) s.add(w);
        return Array.from(s);
      });
    }

    if (nextAttempts > 3) {
      setRevealedKeys((prevArr) => {
        const s = new Set(prevArr);
        const remaining = allKeys.filter((k) => !s.has(k));
        if (remaining.length > 0) {
          const pick = remaining[Math.floor(Math.random() * remaining.length)];
          s.add(pick);
        }
        return Array.from(s);
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
      });
    }

    setAttempts(nextAttempts);
<<<<<<< HEAD
    speak("Intenta de nuevo");
  };

  // Revelado por escritura DESPUÉS de los 3 intentos
=======
    speak("Intenta de nuevo", { lang: "es-ES" });
  };

>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
  const onType = (val) => {
    setAnswer(val);
    if (!current) return;
    if (attempts >= 3 && baseAnswer) {
      const hits = computeTypedKeyHits(val, hiddenSetFromKeys);
      if (hits.length) {
        setRevealedKeys((prev) => Array.from(new Set([...prev, ...hits])));
      }
    }
  };

  const resetForSameCard = () => {
    setAnswer("");
    setAttempts(0);
    setRevealedKeys([]);
    setTypedHitsFirst3([]);
  };

  const goTo = (idx) => {
    if (!items.length) return;
    const bounded = ((idx % items.length) + items.length) % items.length;
    setCurrentIndex(bounded);
    resetForSameCard();
  };

  const next = () => {
    if (repeatLeft > 0) {
      setRepeatLeft((n) => n - 1);
      resetForSameCard();
    } else {
      goTo(currentIndex + 1);
    }
  };
  const prev = () => goTo(currentIndex - 1);

<<<<<<< HEAD
  // Banco (CRUD)
  const [edit, setEdit] = useState(null);
  const startNew = () =>
    setEdit({ id: crypto.randomUUID(), question: "", answers: [""], hint: "" });
=======
  // Banco CRUD
  const [edit, setEdit] = useState(null);
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
  const saveEdit = () => {
    if (!edit) return;
    const cleaned = {
      ...edit,
      question: String(edit.question || "").trim(),
<<<<<<< HEAD
      answers: (edit.answers || [])
        .map((a) => String(a))
        .filter((line) => line.length > 0),
=======
      answers: (edit.answers || []).map(String).filter((line) => line.length > 0),
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
      hint: edit.hint ? String(edit.hint).trim() : undefined,
    };
    if (!cleaned.question || cleaned.answers.length === 0) return;
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === cleaned.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = cleaned;
        return copy;
      }
      return [...prev, cleaned];
    });
    setEdit(null);
  };
  const removeItem = (id) => {
<<<<<<< HEAD
    if (!confirm("¿Eliminar esta pregunta?")) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Tip Hard: palabra aleatoria de la pista
  const getKeywordsFromHint = () => getKeywords(current?.hint || "");
  const tipHard = () => {
    const keys = getKeywordsFromHint();
    if (keys.length === 0) {
      if (current?.hint) speak(current.hint);
      return;
    }
    const pick = keys[Math.floor(Math.random() * keys.length)];
    speak(pick);
  };

  // Render de Cloze (solo desde 3 intentos)
  const showCloze =
    !!current &&
    baseAnswer &&
    current.question &&
    current.question.length > 20 &&
    attempts >= 3;
=======
    if (!window.confirm("¿Eliminar esta pregunta?")) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const getKeywordsFromHint = () => getKeywords(current?.hint || "");
  
// Tip Hard (si tienes pista en español)
const tipHard = () => {
  const keys = getKeywordsFromHint();
  const word = keys.length ? keys[Math.floor(Math.random() * keys.length)] : current?.hint;
  if (word) speak(word); // <-- sin lang forzado
};

  const showCloze =
    !!current && baseAnswer && current.question && current.question.length > 20 && attempts >= 3;
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)

  const renderCloze = (fullAnswer, keysArray, revealedArr) => {
    const revealedSet = new Set(revealedArr);
    const tokens = fullAnswer.split(/(\s+|[^A-Za-z0-9ÁÉÍÓÚÜáéíóúüñÑ']+)/);
    return tokens
      .map((tok) => {
        if (!tok || /^\s+$/.test(tok)) return tok;
        const base = normalize(tok).replace(/[^a-z0-9']/g, "");
<<<<<<< HEAD
        if (!base) return tok; // signos
=======
        if (!base) return tok;
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
        if (keysArray.includes(base) && !revealedSet.has(base)) {
          return tok.replace(/[A-Za-zÁÉÍÓÚÜáéíóúüñÑ0-9]/g, "_");
        }
        return tok;
      })
      .join("");
  };

<<<<<<< HEAD
  const clozeText = showCloze
    ? renderCloze(baseAnswer, allKeys, revealedKeys)
    : "";
=======
  const clozeText = showCloze ? renderCloze(baseAnswer, allKeys, revealedKeys) : "";
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📚 Study Coach</h1>
        <nav>
<<<<<<< HEAD
          <button
            className={tab === "practica" ? "active" : ""}
            onClick={() => setTab("practica")}
          >
            Práctica
          </button>
          <button
            className={tab === "banco" ? "active" : ""}
            onClick={() => setTab("banco")}
          >
=======
          <button className={tab === "practica" ? "active" : ""} onClick={() => setTab("practica")}>
            Práctica
          </button>
          <button className={tab === "banco" ? "active" : ""} onClick={() => setTab("banco")}>
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
            Banco
          </button>
        </nav>
      </header>

      {tab === "practica" && current && (
        <div className="practice-section">
          <div className="practice-top">
            <div className="question-block">
              {showCloze ? (
                <>
                  <div className="question-help">
<<<<<<< HEAD
                    Completa la frase (se revelan palabras que acertaste en tus
                    3 primeros intentos y luego al azar):
=======
                    Completa la frase (se revelan palabras que acertaste en tus 3 primeros intentos y luego al azar):
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
                  </div>
                  <pre className="cloze-text">{clozeText}</pre>
                </>
              ) : (
                <p className="question">{current.question}</p>
              )}
            </div>
            <div className="repeat-controls">
              <label>
                Repetir al acertar
                <select
                  value={repeatSetting}
<<<<<<< HEAD
                  onChange={(e) =>
                    setRepeatSetting(parseInt(e.target.value, 10))
                  }
=======
                  onChange={(e) => setRepeatSetting(parseInt(e.target.value, 10))}
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}x
                    </option>
                  ))}
                </select>
              </label>
<<<<<<< HEAD
              {repeatLeft > 0 && (
                <span className="repeat-left">Pendiente: {repeatLeft}</span>
              )}
=======
              {repeatLeft > 0 && <span className="repeat-left">Pendiente: {repeatLeft}</span>}
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
            </div>
          </div>

          <input
            value={answer}
            onChange={(e) => onType(e.target.value)}
            className="answer-input"
            placeholder="Escribe tu respuesta"
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />

          <div className="buttons">
<<<<<<< HEAD
            <button onClick={() => goTo(currentIndex - 1)}>⟵ Anterior</button>
=======
            <button onClick={prev}>⟵ Anterior</button>
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
            <button onClick={submit}>Comprobar</button>
            {attempts >= 3 && (
              <button onClick={() => speak(current.answers[0])}>💡 Tip</button>
            )}
            {current?.hint && (
<<<<<<< HEAD
              <button
                onClick={tipHard}
                title="Lee una palabra clave aleatoria de la pista"
              >
=======
              <button onClick={tipHard} title="Lee una palabra clave aleatoria de la pista">
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
                🔐 Tip Hard
              </button>
            )}
            <button onClick={next}>Siguiente ⟶</button>
<<<<<<< HEAD
            {showCloze && (
              <span className="revealed">
                Descubiertas: {revealedKeys.length}
              </span>
            )}
=======
            {showCloze && <span className="revealed">Descubiertas: {revealedKeys.length}</span>}
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
          </div>
        </div>
      )}

      {tab === "banco" && (
        <div className="bank-section">
          {edit ? (
            <div className="edit-form">
              <textarea
                className="answers-textarea"
                rows={6}
                value={(edit.answers || []).join("\n")}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    answers: e.target.value
                      .split(/\r?\n/)
                      .map((s) => s)
                      .filter((line) => line.length > 0),
                  })
                }
<<<<<<< HEAD
                placeholder={`Ejemplos:\nMadrid\nTime off after a family member dies`}
              />
              <input
                className="question-input"
                value={edit.question}
=======
                placeholder={`Ejemplos:\nMadrid\nAn error that occurs during the execution of a program...`}
              />
              <input
                className="question-input"
                value={edit.question || ""}
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
                onChange={(e) => setEdit({ ...edit, question: e.target.value })}
                placeholder="Pregunta"
              />
              <input
                className="hint-input"
                value={edit.hint || ""}
                onChange={(e) => setEdit({ ...edit, hint: e.target.value })}
                placeholder="Pista (opcional)"
              />
              <div className="edit-actions">
                <button className="save-btn" onClick={saveEdit}>
                  Guardar
                </button>
                <button className="cancel-btn" onClick={() => setEdit(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              className="new-btn"
              onClick={() =>
<<<<<<< HEAD
                setEdit({
                  id: crypto.randomUUID(),
                  question: "",
                  answers: [""],
                  hint: "",
                })
=======
                setEdit({ id: crypto.randomUUID(), question: "", answers: [""], hint: "" })
>>>>>>> 987054a (Actualización: mejoras en TTS, troubleshooting y documentación)
              }
            >
              + Nueva
            </button>
          )}

          <ul className="items-list">
            {items.map((it, idx) => (
              <li key={it.id}>
                <span className="item-question">
                  {idx + 1}. {it.question}
                </span>
                <div className="item-actions">
                  <button onClick={() => setEdit(it)}>Editar</button>
                  <button onClick={() => removeItem(it.id)}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
