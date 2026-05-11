// ─────────────────────────────────────────────
//  PACK-IT  –  Envelope Level 2
//  Player fills SRC ip AND DST ip manually.
//  Hints point to the logbook, no autofill.
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";
import { logbookGet } from "../data/logbook.js";

const CORRECT_SRC = "192.168.1.2"; // bob.com
const CORRECT_DST = "192.168.1.1"; // alice.com

export function createEnvelopeL2(k, { onValidated, onClose } = {}) {
  const OX = 220, OY = 110, OW = 520, OH = 300;

  const overlay = k.add([k.rect(OW, OH), k.pos(OX, OY), k.color(...C.ui_bg),               k.fixed(), k.z(300), k.opacity(0)]);
  const border  = k.add([k.rect(OW, OH), k.pos(OX, OY), k.outline(2, k.rgb(...C.packet)),   k.fixed(), k.z(301), k.opacity(0)]);
  const title   = k.add([k.text("Enveloppe - IP Header", { size: 14 }), k.pos(OX + OW/2, OY + 18), k.anchor("center"), k.color(...C.packet), k.fixed(), k.z(302), k.opacity(0)]);

  // Field displays
  const lSrc    = k.add([k.text("SRC : bob.com    ( ___.___.___.___  )", { size: 12 }), k.pos(OX+15, OY+55),  k.color(...C.text),      k.fixed(), k.z(302), k.opacity(0)]);
  const lDst    = k.add([k.text("DST : alice.com  ( ___.___.___.___  )", { size: 12 }), k.pos(OX+15, OY+82),  k.color(...C.text),      k.fixed(), k.z(302), k.opacity(0)]);
  const lData   = k.add([k.text("DATA : Bonjour Alice !",               { size: 12 }), k.pos(OX+15, OY+109), k.color(...C.text),      k.fixed(), k.z(302), k.opacity(0)]);

  const divider = k.add([k.rect(OW-30, 2), k.pos(OX+15, OY+138), k.color(150,150,180), k.fixed(), k.z(302), k.opacity(0)]);

  // Active input display
  const inputTxt = k.add([k.text("", { size: 13 }), k.pos(OX+15, OY+155), k.color(...C.green),  k.fixed(), k.z(302), k.opacity(0)]);
  const hintTxt  = k.add([k.text("", { size: 10, width: OW-30 }), k.pos(OX+15, OY+178), k.color(190,170,100), k.fixed(), k.z(302), k.opacity(0)]);
  const statusTxt= k.add([k.text("", { size: 11 }), k.pos(OX+15, OY+215), k.color(...C.red),   k.fixed(), k.z(302), k.opacity(0)]);
  const ctrlTxt  = k.add([k.text("ENTREE - Valider  |  ESPACE - Fermer", { size: 10 }), k.pos(OX+OW-5, OY+OH-8), k.anchor("botright"), k.color(150,150,200), k.fixed(), k.z(302), k.opacity(0)]);

  const ALL = [overlay, border, title, lSrc, lDst, lData, divider, inputTxt, hintTxt, statusTxt, ctrlTxt];

  // State
  let active   = false;
  let srcDone  = false;
  let dstDone  = false;
  let inputStr = "";
  let phase    = "src"; // "src" | "dst" | "done"

  let evChar, evBackspace, evEnter, evSpace;

  function cancelEvents() {
    evChar?.cancel(); evBackspace?.cancel(); evEnter?.cancel(); evSpace?.cancel();
    evChar = evBackspace = evEnter = evSpace = null;
  }

  const HINTS = {
    src: "Hint : tu envoies depuis bob.com. Consulte ton logbook pour son adresse IP.",
    dst: "Hint : tu livres a alice.com. Consulte ton logbook pour son adresse IP.",
  };

  function redraw() {
    // Update field labels
    lSrc.text  = "SRC : bob.com    ( " + (srcDone ? CORRECT_SRC : "___.___.___.___") + "  )";
    lDst.text  = "DST : alice.com  ( " + (dstDone ? CORRECT_DST : "___.___.___.___") + "  )";
    lSrc.color = srcDone ? k.rgb(...C.green) : k.rgb(...C.text);
    lDst.color = dstDone ? k.rgb(...C.green) : k.rgb(...C.text);

    if (phase === "done") {
      inputTxt.text  = "En-tete complet !";
      hintTxt.text   = "";
      statusTxt.text = "";
    } else {
      const prompt = phase === "src" ? "SRC ip > " : "DST ip > ";
      inputTxt.text = prompt + inputStr + "_";
      hintTxt.text  = inputStr === "" ? HINTS[phase] : "";
    }
  }

  function tryValidate() {
    const val = inputStr.trim();

    if (phase === "src") {
      if (val === CORRECT_SRC) {
        srcDone  = true;
        phase    = "dst";
        inputStr = "";
        statusTxt.text  = "";
        statusTxt.color = k.rgb(...C.green);
        redraw();
      } else {
        statusTxt.text  = "IP incorrecte. Regarde ton logbook pour bob.com.";
        statusTxt.color = k.rgb(...C.red);
        inputStr = "";
        inputTxt.text = "SRC ip > _";
      }
    } else if (phase === "dst") {
      if (val === CORRECT_DST) {
        dstDone  = true;
        phase    = "done";
        inputStr = "";
        statusTxt.text  = "Paquet valide ! Appuie sur ESPACE pour livrer.";
        statusTxt.color = k.rgb(...C.green);
        redraw();
        onValidated?.();
      } else {
        statusTxt.text  = "IP incorrecte. Regarde ton logbook pour alice.com.";
        statusTxt.color = k.rgb(...C.red);
        inputStr = "";
        inputTxt.text = "DST ip > _";
      }
    }
  }

  function open() {
    if (active) return;
    active = true;
    ALL.forEach(o => (o.opacity = 1));
    redraw();

    evChar = k.onCharInput(ch => {
      if (!active || phase === "done") return;
      inputStr += ch;
      hintTxt.text  = ""; // hide hint while typing
      inputTxt.text = (phase === "src" ? "SRC ip > " : "DST ip > ") + inputStr + "_";
    });

    evBackspace = k.onKeyPress("backspace", () => {
      if (!active || phase === "done") return;
      inputStr = inputStr.slice(0, -1);
      redraw();
    });

    evEnter = k.onKeyPress("enter", () => {
      if (!active || phase === "done") return;
      tryValidate();
    });

    evSpace = k.onKeyPress("space", () => {
      if (!active) return;
      close();
      onClose?.();
    });
  }

  function close() {
    active = false;
    ALL.forEach(o => (o.opacity = 0));
    cancelEvents();
  }

  return {
    open,
    close,
    get isOpen()  { return active; },
    get isValid() { return phase === "done"; },
  };
}
