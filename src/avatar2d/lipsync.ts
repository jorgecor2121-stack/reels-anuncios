import { Mouth } from "./types";

/**
 * Lip-sync desde el TEXTO (español): cada letra se convierte en una forma de boca
 * con su duración. Sirve cuando no hay audio, o para cuadrar la boca con un guion.
 */
export type Viseme = { mouth: Mouth; dur: number }; // dur en segundos

const VOWEL: Record<string, Mouth> = { a: "A", á: "A", e: "E", é: "E", i: "I", í: "I", y: "I", o: "O", ó: "O", u: "U", ú: "U", ü: "U" };

const consonant = (c: string): Mouth | null => {
  if ("mbp".includes(c)) return "M";
  if ("fv".includes(c)) return "F";
  if ("lntdr".includes(c)) return "L";
  if ("szcx".includes(c)) return "S";
  if ("gjkqñh".includes(c)) return c === "h" ? null : "E"; // la h es muda
  if (c === "w") return "U";
  return null;
};

export const textToVisemes = (text: string): Viseme[] => {
  const out: Viseme[] = [];
  const t = text.toLowerCase();
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (VOWEL[c]) out.push({ mouth: VOWEL[c], dur: 0.1 });
    else if (/[.!?¡¿]/.test(c)) out.push({ mouth: "smile", dur: 0.32 });
    else if (/[,;:—-]/.test(c)) out.push({ mouth: "M", dur: 0.18 });
    else if (c === " ") out.push({ mouth: "M", dur: 0.03 });
    else {
      const m = consonant(c);
      if (m) out.push({ mouth: m, dur: 0.065 });
    }
  }
  return out;
};

export const speechDuration = (text: string) => textToVisemes(text).reduce((a, v) => a + v.dur, 0);

/** Boca que toca en el segundo `t` desde que empieza la frase (null = ya terminó). */
export const mouthAt = (text: string, t: number): Mouth | null => {
  let acc = 0;
  for (const v of textToVisemes(text)) {
    acc += v.dur;
    if (t < acc) return v.mouth;
  }
  return null;
};
