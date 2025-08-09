import React, { useEffect, useState } from "react";
import "./styles.css"; // estilos

export default function StudyCoach() {
  const [tab, setTab] = useState("practica");
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);

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

  const isCorrect = (user, answers) => {
    const cand = normalize(user);
    return (answers || []).some((ans) => normalize(ans) === cand);
  };

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
  ]);

  const getKeywords = (text) => {
    if (!text) return [];
    const seen = new Set();
    const tokens = text
      .split(/(\s+|[^A-Za-z0-9ÁÉÍÓÚÜáéíóúüñÑ']+)/)
      .filter(Boolean);
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

  // Seed + persistencia
  useEffect(() => {
    const raw = localStorage.getItem("studycoach_items_v5");
    if (raw) {
      try {
        setItems(JSON.parse(raw));
      } catch {}
    } else {
      setItems([
        {
          id: crypto.randomUUID(),
          question: "¿Capital de España?",
          answers: ["Madrid"],
          hint: "Geografía Europa",
        },
        {
          id: crypto.randomUUID(),
          question: "What is an Exception?",
          answers: [
            "An error that occurs during the execution of a program, disrupting its normal flow. Java uses try-catch blocks to handle exceptions.",
          ],
          hint: "Java error try catch program flow",
        },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("studycoach_items_v5", JSON.stringify(items));
  }, [items]);

  // ---------- Cloze (nuevo comportamiento) ----------
  const baseAnswer = current?.answers?.[0] || "";
  const allKeys = getKeywords(baseAnswer); // TODAS las palabras clave a ocultar
  const hiddenSetFromKeys = new Set(allKeys);

  const computeTypedKeyHits = (text, keysSet) => {
    const hits = new Set();
    const words = String(text)
      .split(/\s+/)
      .map((w) => normalize(w).replace(/[^a-z0-9']/g, ""))
      .filter(Boolean);
    for (const w of words) if (keysSet.has(w)) hits.add(w);
    return Array.from(hits);
  };

  // ---------- Envío de respuesta ----------
  const submit = () => {
    if (!current) return;

    // Correcto
    if (isCorrect(answer, current.answers)) {
      speak("Correcto");
      setAttempts(0);
      setRevealedKeys([]);
      setTypedHitsFirst3([]);
      setRepeatLeft(repeatSetting - 1); // repetir n-1 veces
      return;
    }

    // Incorrecto
    const nextAttempts = attempts + 1;

    // Durante los 3 primeros intentos, acumula aciertos parciales (palabras clave presentes en la respuesta)
    if (nextAttempts <= 3) {
      const hits = computeTypedKeyHits(answer, hiddenSetFromKeys);
      if (hits.length) {
        setTypedHitsFirst3((prev) => Array.from(new Set([...prev, ...hits])));
      }
    }

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
      });
    }

    setAttempts(nextAttempts);
    speak("Intenta de nuevo");
  };

  // Revelado por escritura DESPUÉS de los 3 intentos
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

  // Banco (CRUD)
  const [edit, setEdit] = useState(null);
  const startNew = () =>
    setEdit({ id: crypto.randomUUID(), question: "", answers: [""], hint: "" });
  const saveEdit = () => {
    if (!edit) return;
    const cleaned = {
      ...edit,
      question: String(edit.question || "").trim(),
      answers: (edit.answers || [])
        .map((a) => String(a))
        .filter((line) => line.length > 0),
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

  const renderCloze = (fullAnswer, keysArray, revealedArr) => {
    const revealedSet = new Set(revealedArr);
    const tokens = fullAnswer.split(/(\s+|[^A-Za-z0-9ÁÉÍÓÚÜáéíóúüñÑ']+)/);
    return tokens
      .map((tok) => {
        if (!tok || /^\s+$/.test(tok)) return tok;
        const base = normalize(tok).replace(/[^a-z0-9']/g, "");
        if (!base) return tok; // signos
        if (keysArray.includes(base) && !revealedSet.has(base)) {
          return tok.replace(/[A-Za-zÁÉÍÓÚÜáéíóúüñÑ0-9]/g, "_");
        }
        return tok;
      })
      .join("");
  };

  const clozeText = showCloze
    ? renderCloze(baseAnswer, allKeys, revealedKeys)
    : "";

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📚 Study Coach</h1>
        <nav>
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
                    Completa la frase (se revelan palabras que acertaste en tus
                    3 primeros intentos y luego al azar):
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
                  onChange={(e) =>
                    setRepeatSetting(parseInt(e.target.value, 10))
                  }
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}x
                    </option>
                  ))}
                </select>
              </label>
              {repeatLeft > 0 && (
                <span className="repeat-left">Pendiente: {repeatLeft}</span>
              )}
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
            <button onClick={() => goTo(currentIndex - 1)}>⟵ Anterior</button>
            <button onClick={submit}>Comprobar</button>
            {attempts >= 3 && (
              <button onClick={() => speak(current.answers[0])}>💡 Tip</button>
            )}
            {current?.hint && (
              <button
                onClick={tipHard}
                title="Lee una palabra clave aleatoria de la pista"
              >
                🔐 Tip Hard
              </button>
            )}
            <button onClick={next}>Siguiente ⟶</button>
            {showCloze && (
              <span className="revealed">
                Descubiertas: {revealedKeys.length}
              </span>
            )}
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
                placeholder={`Ejemplos:\nMadrid\nTime off after a family member dies`}
              />
              <input
                className="question-input"
                value={edit.question}
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
                setEdit({
                  id: crypto.randomUUID(),
                  question: "",
                  answers: [""],
                  hint: "",
                })
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
