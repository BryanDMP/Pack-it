// ─────────────────────────────────────────────
//  PACK-IT  –  DNS Overlay
// ─────────────────────────────────────────────
import { C, DNS_TABLE } from "../data/constants.js";
import { logbookAdd } from "../data/logbook.js";

export function createDNSOverlay(k, onResolved, onClose, requiredDomain = null) {
  const overlay  = k.add([k.rect(500, 280), k.pos(230, 120), k.color(...C.ui_bg),                k.fixed(), k.z(300), k.opacity(0)]);
  const border   = k.add([k.rect(500, 280), k.pos(230, 120), k.outline(2, k.rgb(...C.ui_border)), k.fixed(), k.z(301), k.opacity(0)]);
  const title    = k.add([k.text("Bureau de Poste (DNS)", { size: 15 }), k.pos(480, 140), k.anchor("top"), k.color(...C.ui_border), k.fixed(), k.z(302), k.opacity(0)]);
  const body     = k.add([k.text("Quel domaine cherches-tu ?\nTape le nom et appuie sur ENTREE.", { size: 12, width: 460 }), k.pos(245, 172), k.color(...C.text), k.fixed(), k.z(302), k.opacity(0)]);
  const inputTxt = k.add([k.text("> _", { size: 14 }), k.pos(245, 225), k.color(...C.green), k.fixed(), k.z(302), k.opacity(0)]);
  const result   = k.add([k.text("", { size: 12, width: 460 }), k.pos(245, 258), k.color(...C.green), k.fixed(), k.z(302), k.opacity(0)]);
  const hint     = k.add([k.text("ENTREE - Valider   ECHAP - Fermer", { size: 10 }), k.pos(720, 393), k.anchor("botright"), k.color(150, 150, 200), k.fixed(), k.z(302), k.opacity(0)]);

  const ALL = [overlay, border, title, body, inputTxt, result, hint];

  let active     = false;
  let inputStr   = "";
  let lookupDone = false;

  // Kaplay event handles (have a .cancel() method)
  let evChar, evEnter, evBackspace, evEscape;

  function cancelEvents() {
    evChar?.cancel();
    evEnter?.cancel();
    evBackspace?.cancel();
    evEscape?.cancel();
    evChar = evEnter = evBackspace = evEscape = null;
  }

  function open() {
    if (active) return;   // prevent double-open from zone re-trigger
    active     = true;
    inputStr   = "";
    lookupDone = false;
    result.text   = "";
    inputTxt.text = "> _";
    ALL.forEach(o => (o.opacity = 1));

    evChar = k.onCharInput(ch => {
      if (!active || lookupDone) return;
      inputStr += ch;
      inputTxt.text = "> " + inputStr + "_";
    });

    evEnter = k.onKeyPress("enter", () => {
      if (!active) return;
      if (lookupDone) {
        const domain = inputStr.trim().toLowerCase();
        close();
        onResolved?.(domain, DNS_TABLE[domain]);
        return;
      }
      const query = inputStr.trim().toLowerCase();
      if (requiredDomain && query !== requiredDomain) {
        result.text = "Ce n'est pas le bon domaine !\nTu cherches : " + requiredDomain;
        return;
      }
      if (DNS_TABLE[query]) {
        const ip = DNS_TABLE[query];
        logbookAdd(query, ip);
        result.text   = "OK : " + query + " -> " + ip + "\nNote dans ton logbook !\n\nENTREE pour continuer";
        inputTxt.text = "> " + query;
        lookupDone    = true;
      } else {
        result.text = "Inconnu : " + query + "\nEssaie bob.com";
      }
    });

    evBackspace = k.onKeyPress("backspace", () => {
      if (!active || lookupDone) return;
      inputStr = inputStr.slice(0, -1);
      inputTxt.text = "> " + inputStr + "_";
    });

    evEscape = k.onKeyPress("escape", () => {
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
    get isOpen() { return active; },
  };
}
