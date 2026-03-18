// ─────────────────────────────────────────────
//  PACK-IT  –  Dialog UI
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";

export function createDialog(k) {
  const bg     = k.add([k.rect(700, 120), k.pos(130, 390), k.color(...C.ui_bg),               k.fixed(), k.z(200), k.opacity(0)]);
  const border = k.add([k.rect(700, 120), k.pos(130, 390), k.outline(2, k.rgb(...C.ui_border)), k.fixed(), k.z(201), k.opacity(0)]);
  const txt    = k.add([k.text("", { size: 13, width: 680 }), k.pos(140, 398), k.color(...C.text), k.fixed(), k.z(202)]);
  const hint   = k.add([k.text("ESPACE - Continuer", { size: 10 }), k.pos(820, 498), k.anchor("botright"), k.color(150, 150, 200), k.fixed(), k.z(202), k.opacity(0)]);

  let open = false;

  return {
    show(msg, showHint = true) {
      open = true;
      bg.opacity = border.opacity = 1;
      txt.text = msg;
      hint.opacity = showHint ? 1 : 0;
    },
    hide() {
      open = false;
      bg.opacity = border.opacity = hint.opacity = 0;
      txt.text = "";
    },
    get isOpen() { return open; },
  };
}
