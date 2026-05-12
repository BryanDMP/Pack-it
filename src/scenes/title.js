// ─────────────────────────────────────────────
//  PACK-IT  –  Scene: Title
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";
import { logbookClear } from "../data/logbook.js";

// Dev level-select codes (concept-themed, one per level)
//   dns → level 1  (DNS lookup)
//   hdr → level 2  (IP header)
//   rte → level 3  (routing)
//   ttl → level 4  (Time To Live)
const DEV_CODES = {
  dns: "level1",
  hdr: "level2",
  rte: "level3",
  ttl: "level4",
};

export function registerTitleScene(k) {
  k.scene("title", () => {
    logbookClear();

    // Background
    k.add([k.rect(960, 540), k.pos(0, 0), k.color(15, 15, 35)]);

    // Floating packet particles
    for (let i = 0; i < 30; i++) {
      const px = k.rand(0, 960);
      const py = k.rand(0, 540);
      const dot = k.add([
        k.rect(k.rand(6, 14), k.rand(4, 10)),
        k.pos(px, py),
        k.color(100, 150, 255),
        k.opacity(k.rand(0.1, 0.4)),
        k.z(0),
      ]);
      dot.onUpdate(() => {
        dot.pos.y -= 0.4;
        dot.pos.x += Math.sin(k.time() + px) * 0.3;
        if (dot.pos.y < -20) dot.pos.y = 560;
      });
    }

    // Title
    k.add([k.text("PACK-IT", { size: 72 }), k.pos(480, 130), k.anchor("center"), k.color(...C.ui_border), k.z(1)]);
    k.add([k.text("Le jeu des paquets IP", { size: 20 }), k.pos(480, 205), k.anchor("center"), k.color(...C.text), k.z(1)]);

    // Play button
    k.add([k.rect(280, 52), k.pos(340, 290), k.color(30, 65, 140), k.z(1)]);
    k.add([k.rect(280, 52), k.pos(340, 290), k.outline(2, k.rgb(...C.ui_border)), k.z(2)]);
    k.add([k.text("▶  Jouer – Level 1", { size: 16 }), k.pos(480, 316), k.anchor("center"), k.color(200, 230, 255), k.z(3)]);

    // Controls
    k.add([
      k.text("Déplacements : WASD / Flèches\nInteractions  : ESPACE / ENTRÉE", { size: 12 }),
      k.pos(480, 410),
      k.anchor("center"),
      k.color(120, 140, 180),
      k.z(1),
    ]);

    k.add([k.text("v0.1  –  The Packet Crew", { size: 9 }), k.pos(480, 525), k.anchor("center"), k.color(60, 60, 90), k.z(1)]);

    // ── Dev level-select ──────────────────────
    //  Type a code + ENTRÉE to jump to any level.
    //  ESPACE always launches level 1 directly.
    let inputStr = "";

    const devBox = k.add([
      k.rect(220, 28), k.pos(480, 468), k.anchor("center"),
      k.color(20, 20, 40), k.outline(1, k.rgb(60, 60, 90)),
      k.z(2),
    ]);
    const devTxt = k.add([
      k.text("> _", { size: 12 }),
      k.pos(480, 468), k.anchor("center"),
      k.color(60, 70, 100),
      k.z(3),
    ]);
    const devFeedback = k.add([
      k.text("", { size: 10 }),
      k.pos(480, 492), k.anchor("center"),
      k.color(...C.red),
      k.z(3),
    ]);

    function refreshInput() {
      devTxt.text = inputStr.length ? `> ${inputStr}_` : "> _";
    }

    k.onCharInput(ch => {
      if (inputStr.length >= 8) return;
      inputStr += ch.toLowerCase();
      devFeedback.text = "";
      devTxt.color = k.rgb(160, 200, 255);
      refreshInput();
    });

    k.onKeyPress("backspace", () => {
      inputStr = inputStr.slice(0, -1);
      devFeedback.text = "";
      devTxt.color = inputStr.length ? k.rgb(160, 200, 255) : k.rgb(60, 70, 100);
      refreshInput();
    });

    k.onKeyPress("enter", () => {
      const code = inputStr.trim();
      if (code === "") { k.go("level1"); return; }
      if (DEV_CODES[code]) {
        k.go(DEV_CODES[code]);
      } else {
        devFeedback.text = "code inconnu";
        devTxt.color = k.rgb(...C.red);
        inputStr = "";
        refreshInput();
      }
    });

    k.onKeyPress("space", () => k.go("level1"));

    k.onClick(() => {
      const m = k.mousePos();
      if (m.x > 340 && m.x < 620 && m.y > 290 && m.y < 342) k.go("level1");
    });
  });
}
