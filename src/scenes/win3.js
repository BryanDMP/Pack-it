// ─────────────────────────────────────────────
//  PACK-IT  –  Scene: Win (Level 3)
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";

export function registerWin3Scene(k) {
  k.scene("win3", () => {
    k.add([k.rect(960, 540), k.pos(0, 0), k.color(10, 20, 10)]);

    // Confetti
    for (let i = 0; i < 50; i++) {
      const cx = k.rand(0, 960);
      const col = [
        [255, 200, 80],
        [80, 220, 120],
        [100, 180, 255],
        [255, 120, 60],
      ][Math.floor(k.rand(0, 4))];
      const c = k.add([
        k.rect(k.rand(4, 10), k.rand(4, 10)),
        k.pos(cx, k.rand(-50, 200)),
        k.color(...col),
        k.z(0),
      ]);
      c.onUpdate(() => {
        c.pos.y += 1.2;
        c.pos.x += Math.sin(k.time() * 2 + cx) * 0.5;
        if (c.pos.y > 560) c.pos.y = -10;
      });
    }

    k.add([k.text("Paquet route !", { size: 34 }), k.pos(480, 95), k.anchor("center"), k.color(...C.green), k.z(1)]);

    // Route summary
    k.add([k.rect(560, 55), k.pos(480, 168), k.anchor("center"), k.color(0, 0, 0), k.opacity(0.45), k.z(1)]);
    k.add([
      k.text("alice.com  →  Routeur  →  eve.com\n192.168.1.1  →  10.0.0.254  →  10.0.0.5", { size: 15 }),
      k.pos(480, 168), k.anchor("center"), k.color(255, 255, 255), k.z(2),
    ]);

    // Learning outcomes
    k.add([k.rect(680, 230), k.pos(480, 340), k.anchor("center"), k.color(0, 0, 0), k.opacity(0.45), k.z(1)]);
    k.add([
      k.text(
        "Ce que tu as appris :\n\n" +
        "  Chaque sous-reseau a un prefixe IP distinct\n" +
        "  (ex. 192.168.1.x  vs  10.0.0.x)\n\n" +
        "  Pour atteindre un autre sous-reseau, le paquet\n" +
        "  passe par le default gateway (routeur).\n\n" +
        "  La table de routage indique quelle interface\n" +
        "  utiliser selon le prefixe de destination.\n" +
        "  On choisit la correspondance la plus specifique.",
        { size: 13, width: 640 }
      ),
      k.pos(480, 340), k.anchor("center"), k.color(255, 255, 255), k.z(2),
    ]);

    // Buttons
    k.add([k.rect(200, 44), k.pos(180, 468), k.color(30, 65, 140), k.z(1)]);
    k.add([k.rect(200, 44), k.pos(180, 468), k.outline(2, k.rgb(...C.ui_border)), k.z(2)]);
    k.add([k.text("↩  Rejouer", { size: 14 }), k.pos(280, 490), k.anchor("center"), k.color(200, 230, 255), k.z(3)]);

    k.add([k.rect(200, 44), k.pos(580, 468), k.color(20, 80, 40), k.z(1)]);
    k.add([k.rect(200, 44), k.pos(580, 468), k.outline(2, k.rgb(...C.green)), k.z(2)]);
    k.add([k.text("▶  Level 4", { size: 14 }), k.pos(680, 490), k.anchor("center"), k.color(180, 230, 200), k.z(3)]);

    k.add([
      k.text("Astuce : depuis l'accueil, tape  « rte »  + ENTREE pour rejouer ce niveau.", { size: 10 }),
      k.pos(480, 525), k.anchor("center"), k.color(220, 80, 80), k.z(3),
    ]);

    k.onKeyPress("space", () => k.go("level3"));
    k.onKeyPress("enter", () => k.go("level4"));
    k.onClick(() => {
      const m = k.mousePos();
      if (m.x > 180 && m.x < 380 && m.y > 468 && m.y < 512) k.go("level3");
      if (m.x > 580 && m.x < 780 && m.y > 468 && m.y < 512) k.go("level4");
    });
  });
}
