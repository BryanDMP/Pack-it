// ─────────────────────────────────────────────
//  PACK-IT  –  Envelope / IP Header Overlay
//  Interactive: all fields pre-filled except
//  the destination IP, which the player must
//  type in. Can be opened and closed freely.
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";
import { logbookGet } from "../data/logbook.js";

/**
 * @param {object} k - kaplay instance
 * @param {object} fields
 *   { srcDomain, srcIP, dstDomain, dstIPCorrect, message }
 * @param {object} callbacks
 *   { onValidated, onClose }
 *   onValidated – called once when the correct IP is entered
 *   onClose     – called every time the overlay is closed
 */
export function createEnvelopeOverlay(k, fields, { onValidated, onClose } = {}) {
  const OX = 250, OY = 120, OW = 460, OH = 270;

  const overlay = k.add([k.rect(OW, OH),         k.pos(OX, OY),                                  k.color(...C.ui_bg),               k.fixed(), k.z(300), k.opacity(0)]);
  const border  = k.add([k.rect(OW, OH),         k.pos(OX, OY),                                  k.outline(2, k.rgb(...C.packet)),   k.fixed(), k.z(301), k.opacity(0)]);
  const title   = k.add([k.text("Enveloppe (IP Header)", { size: 14 }),
                          k.pos(OX + OW / 2, OY + 18), k.anchor("center"),
                          k.color(...C.packet),  k.fixed(), k.z(302), k.opacity(0)]);

  const lSrc    = k.add([k.text("", { size: 12 }), k.pos(OX + 15, OY + 52),  k.color(...C.text),      k.fixed(), k.z(302), k.opacity(0)]);
  const lDst    = k.add([k.text("", { size: 12 }), k.pos(OX + 15, OY + 74),  k.color(...C.text),      k.fixed(), k.z(302), k.opacity(0)]);
  const lIP     = k.add([k.text("", { size: 12 }), k.pos(OX + 15, OY + 96),  k.color(255, 160, 60),   k.fixed(), k.z(302), k.opacity(0)]);
  const lData   = k.add([k.text("", { size: 12, width: 430 }), k.pos(OX + 15, OY + 118), k.color(...C.text), k.fixed(), k.z(302), k.opacity(0)]);

  const divider = k.add([k.rect(OW - 30, 2),     k.pos(OX + 15, OY + 148),  k.color(150, 150, 180),  k.fixed(), k.z(302), k.opacity(0)]);
  const lStatus = k.add([k.text("", { size: 13 }),
                          k.pos(OX + OW / 2, OY + 162), k.anchor("center"),
                          k.color(...C.red),     k.fixed(), k.z(302), k.opacity(0)]);
  const hint    = k.add([k.text("", { size: 10 }),
                          k.pos(OX + OW - 5, OY + OH - 8), k.anchor("botright"),
                          k.color(150, 150, 200), k.fixed(), k.z(302), k.opacity(0)]);

  const ALL = [overlay, border, title, lSrc, lDst, lIP, lData, divider, lStatus, hint];

  let active   = false;
  let valid    = false;
  let inputStr = "";

  let evChar, evBackspace, evEnter, evSpace;

  function cancelEvents() {
    evChar?.cancel(); evBackspace?.cancel(); evEnter?.cancel(); evSpace?.cancel();
    evChar = evBackspace = evEnter = evSpace = null;
  }

  function updateIPField() {
    if (valid) {
      lIP.text  = "IP DST : " + fields.dstIPCorrect + "  ✓";
      lIP.color = k.rgb(...C.green);
    } else {
      lIP.text  = "IP DST : " + inputStr + (active ? "_" : "");
      lIP.color = k.rgb(255, 160, 60);
    }
  }

  function open() {
    if (active) return;
    active = true;

    // Pre-fill from logbook if field is still empty and DNS has been consulted
    if (!valid && inputStr === "") {
      const cached = logbookGet(fields.dstDomain);
      if (cached) inputStr = cached;
    }

    lSrc.text  = "SRC    : " + fields.srcDomain + "  (" + fields.srcIP + ")";
    lDst.text  = "DST    : " + fields.dstDomain;
    lData.text = "DATA   : " + fields.message;
    updateIPField();

    lStatus.text  = valid ? "✓ VALID PACKET" : "? IP de destination manquante";
    lStatus.color = valid ? k.rgb(...C.green) : k.rgb(...C.red);
    hint.text     = valid
      ? "ESPACE — Fermer"
      : "ENTREE — Valider  |  ESPACE — Fermer";

    ALL.forEach(o => (o.opacity = 1));

    evChar = k.onCharInput(ch => {
      if (!active || valid) return;
      inputStr += ch;
      updateIPField();
    });

    evBackspace = k.onKeyPress("backspace", () => {
      if (!active || valid) return;
      inputStr = inputStr.slice(0, -1);
      updateIPField();
    });

    evEnter = k.onKeyPress("enter", () => {
      if (!active || valid) return;
      if (inputStr.trim() === fields.dstIPCorrect) {
        valid = true;
        updateIPField();
        lStatus.text  = "✓ VALID PACKET";
        lStatus.color = k.rgb(...C.green);
        hint.text     = "ESPACE — Fermer";
        onValidated?.();
      } else {
        lStatus.text  = "✗ IP incorrecte !  Indice : cherche dans le DNS (Post Office).";
        lStatus.color = k.rgb(...C.red);
      }
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
    get isValid() { return valid;  },
  };
}
