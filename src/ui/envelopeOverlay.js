// ─────────────────────────────────────────────
//  PACK-IT  –  Envelope / IP Header Overlay
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";
import { logbookGet } from "../data/logbook.js";

export function createEnvelopeOverlay(k, fields, onClose) {
  const overlay = k.add([k.rect(460, 210), k.pos(250, 145), k.color(...C.ui_bg),               k.fixed(), k.z(300), k.opacity(0)]);
  const border  = k.add([k.rect(460, 210), k.pos(250, 145), k.outline(2, k.rgb(...C.packet)),   k.fixed(), k.z(301), k.opacity(0)]);
  const title   = k.add([k.text("Enveloppe (IP Header)", { size: 14 }), k.pos(480, 160), k.anchor("top"), k.color(...C.packet), k.fixed(), k.z(302), k.opacity(0)]);
  const lSrc    = k.add([k.text("", { size: 12 }), k.pos(260, 192), k.color(...C.text),  k.fixed(), k.z(302), k.opacity(0)]);
  const lDst    = k.add([k.text("", { size: 12 }), k.pos(260, 212), k.color(...C.text),  k.fixed(), k.z(302), k.opacity(0)]);
  const lIP     = k.add([k.text("", { size: 12 }), k.pos(260, 232), k.color(...C.green), k.fixed(), k.z(302), k.opacity(0)]);
  const lData   = k.add([k.text("", { size: 12, width: 420 }), k.pos(260, 255), k.color(...C.text), k.fixed(), k.z(302), k.opacity(0)]);
  const hint    = k.add([k.text("ESPACE - Fermer et livrer", { size: 10 }), k.pos(700, 348), k.anchor("botright"), k.color(150, 150, 200), k.fixed(), k.z(302), k.opacity(0)]);

  const ALL = [overlay, border, title, lSrc, lDst, lIP, lData, hint];

  let active = false;
  let evSpace;

  function open() {
    if (active) return;   // guard against double-open
    active = true;
    const srcIP = logbookGet(fields.srcDomain) ?? "???";
    const dstIP = logbookGet(fields.dstDomain) ?? "???";
    lSrc.text  = "SRC  : " + fields.srcDomain + "  (" + srcIP + ")";
    lDst.text  = "DST  : " + fields.dstDomain;
    lIP.text   = "IP   : " + dstIP + "  resolu !";
    lData.text = "DATA : " + fields.message;
    ALL.forEach(o => (o.opacity = 1));

    evSpace = k.onKeyPress("space", () => {
      if (!active) return;
      close();
      onClose?.();
    });
  }

  function close() {
    active = false;
    ALL.forEach(o => (o.opacity = 0));
    evSpace?.cancel();
    evSpace = null;
  }

  return { open, close, get isOpen() { return active; } };
}
