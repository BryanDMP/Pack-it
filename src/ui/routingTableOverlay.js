// ─────────────────────────────────────────────
//  PACK-IT  –  Routing Table Overlay (Level 3)
//
//  Shows the router's routing table. Player
//  navigates rows with UP/DOWN and confirms
//  with ENTER. Teaches longest-prefix matching.
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";

const ROUTES = [
  { dst: "192.168.1.0/24", mask: "255.255.255.0", gw: "direct",      iface: "eth0" },
  { dst: "10.0.0.0/24",    mask: "255.255.255.0", gw: "10.0.0.254",  iface: "eth1" },
  { dst: "0.0.0.0/0",      mask: "0.0.0.0",       gw: "192.168.1.1", iface: "eth0" },
];
const CORRECT_IDX = 1; // 10.0.0.0/24 matches 10.0.0.5

const WRONG_MSGS = [
  "Non : 10.0.0.5 & 255.255.255.0 = 10.0.0.0, ce n'est pas 192.168.1.0. Ce reseau ne correspond pas.",
  "",
  "Non : la route par defaut (0.0.0.0/0) fonctionne, mais 10.0.0.0/24 est plus specifique. On prefere la plus longue correspondance.",
];

function fmtRow(r) {
  return "  " + r.dst.padEnd(22) + r.mask.padEnd(20) + r.gw.padEnd(18) + r.iface;
}

export function createRoutingTableOverlay(k, { onValidated } = {}) {
  const OX = 80, OY = 70, OW = 800, OH = 400;

  const overlay  = k.add([k.rect(OW, OH), k.pos(OX, OY), k.color(...C.ui_bg),                    k.fixed(), k.z(300), k.opacity(0)]);
  const border   = k.add([k.rect(OW, OH), k.pos(OX, OY), k.outline(2, k.rgb(...C.ui_border)),    k.fixed(), k.z(301), k.opacity(0)]);
  const titleTx  = k.add([k.text("Table de routage  –  Routeur Central", { size: 14 }),
                           k.pos(OX + OW / 2, OY + 22), k.anchor("center"),
                           k.color(...C.ui_border), k.fixed(), k.z(302), k.opacity(0)]);

  const hdrTx = k.add([
    k.text("  Destination           Masque               Passerelle        Interface", { size: 11 }),
    k.pos(OX + 15, OY + 52), k.color(180, 180, 220), k.fixed(), k.z(302), k.opacity(0),
  ]);
  const div1  = k.add([k.rect(OW - 30, 2), k.pos(OX + 15, OY + 70), k.color(150, 150, 180), k.fixed(), k.z(302), k.opacity(0)]);

  // Row highlight rectangles (sit behind text)
  const highlights = ROUTES.map((_, i) =>
    k.add([k.rect(OW - 30, 30), k.pos(OX + 15, OY + 77 + i * 36),
           k.color(100, 150, 220), k.fixed(), k.z(301), k.opacity(0)])
  );

  // Row text objects
  const rowTexts = ROUTES.map((r, i) =>
    k.add([k.text(fmtRow(r), { size: 11 }),
           k.pos(OX + 15, OY + 83 + i * 36), k.color(...C.text), k.fixed(), k.z(303), k.opacity(0)])
  );

  const div2 = k.add([k.rect(OW - 30, 2), k.pos(OX + 15, OY + 192), k.color(150, 150, 180), k.fixed(), k.z(302), k.opacity(0)]);

  const ctxTx = k.add([
    k.text("Paquet a livrer  :  DST = 10.0.0.5   →   Quelle ligne correspond ?", { size: 12 }),
    k.pos(OX + 15, OY + 208), k.color(...C.highlight), k.fixed(), k.z(302), k.opacity(0),
  ]);
  const feedbackTx = k.add([
    k.text("", { size: 11, width: OW - 30 }),
    k.pos(OX + 15, OY + 238), k.color(...C.red), k.fixed(), k.z(303), k.opacity(0),
  ]);
  const explainTx = k.add([
    k.text(
      "Principe : trouver la ligne dont (Destination & Masque) correspond au prefixe de 10.0.0.5",
      { size: 10, width: OW - 30 }
    ),
    k.pos(OX + 15, OY + 270), k.color(250, 110, 110), k.fixed(), k.z(302), k.opacity(0),
  ]);
  const ctrlTx = k.add([
    k.text("(HAUT / BAS) Naviguer   (ENTREE) Confirmer", { size: 10 }),
    k.pos(OX + OW - 15, OY + OH - 12), k.anchor("botright"),
    k.color(150, 150, 200), k.fixed(), k.z(302), k.opacity(0),
  ]);

  // Objects to show/hide together (highlights managed separately)
  const allStatic = [
    overlay, border, titleTx, hdrTx, div1, div2,
    ctxTx, feedbackTx, explainTx, ctrlTx,
    ...rowTexts,
  ];

  let active    = false;
  let selected  = 0;
  let validated = false;
  let evUp, evDown, evEnter;

  function cancelEvents() {
    evUp?.cancel(); evDown?.cancel(); evEnter?.cancel();
    evUp = evDown = evEnter = null;
  }

  function updateHighlight() {
    highlights.forEach((h, i) => { h.opacity = i === selected ? 0.3 : 0; });
  }

  function open() {
    if (active) return;
    active    = true;
    validated = false;
    selected  = 0;
    feedbackTx.text = "";
    rowTexts.forEach(t => (t.color = k.rgb(...C.text)));
    highlights.forEach(h => { h.color = k.rgb(100, 150, 220); });
    allStatic.forEach(o => (o.opacity = 1));
    updateHighlight();

    evUp = k.onKeyPress("up", () => {
      if (!active || validated) return;
      selected = (selected - 1 + ROUTES.length) % ROUTES.length;
      updateHighlight();
    });
    evDown = k.onKeyPress("down", () => {
      if (!active || validated) return;
      selected = (selected + 1) % ROUTES.length;
      updateHighlight();
    });
    evEnter = k.onKeyPress("enter", () => {
      if (!active || validated) return;
      if (selected === CORRECT_IDX) {
        validated = true;
        k.play("success");
        feedbackTx.text  = "✓ Correct ! 10.0.0.5 & 255.255.255.0 = 10.0.0.0  correspond a 10.0.0.0/24. Transmission via eth1.";
        feedbackTx.color = k.rgb(...C.green);
        rowTexts[selected].color    = k.rgb(...C.green);
        highlights[selected].color  = k.rgb(...C.green);
        highlights[selected].opacity = 0.25;
        k.wait(2.0, () => { close(); onValidated?.(); });
      } else {
        feedbackTx.text  = WRONG_MSGS[selected];
        feedbackTx.color = k.rgb(...C.red);
      }
    });
  }

  function close() {
    active = false;
    allStatic.forEach(o => (o.opacity = 0));
    highlights.forEach(h => (h.opacity = 0));
    cancelEvents();
  }

  return {
    open,
    close,
    get isOpen() { return active; },
  };
}
