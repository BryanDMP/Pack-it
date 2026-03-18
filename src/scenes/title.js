// ─────────────────────────────────────────────
//  PACK-IT  –  Scene: Title
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";
import { logbookClear } from "../data/logbook.js";

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

    // Input
    k.onKeyPress("space", () => k.go("level1"));
    k.onKeyPress("enter", () => k.go("level1"));
    k.onClick(() => {
      const m = k.mousePos();
      if (m.x > 340 && m.x < 620 && m.y > 290 && m.y < 342) k.go("level1");
    });
  });
}
