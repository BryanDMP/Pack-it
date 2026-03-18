// ─────────────────────────────────────────────
//  PACK-IT  –  Scene: Win (Level 1)
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";

export function registerWinScene(k) {
  k.scene("win1", () => {
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

    k.add([k.text("🎉 Livraison réussie !", { size: 34 }), k.pos(480, 130), k.anchor("center"), k.color(...C.green), k.z(1)]);
    k.add([k.text("alice.com  →  bob.com\n192.168.1.1  →  192.168.1.2", { size: 16 }), k.pos(480, 205), k.anchor("center"), k.color(...C.text), k.z(1)]);

    k.add([
      k.text(
        "Ce que tu as appris :\n\n" +
        "  📮  Consulter le serveur DNS (Post Office)\n" +
        "  🔎  Résoudre un nom de domaine → adresse IP\n" +
        "  📬  Remplir l'en-tête IP d'un paquet\n" +
        "  🚚  Livrer un paquet en suivant la route",
        { size: 14, width: 620 }
      ),
      k.pos(480, 300),
      k.anchor("center"),
      k.color(...C.text),
      k.z(1),
    ]);

    // Replay / next buttons
    k.add([k.rect(200, 44), k.pos(180, 460), k.color(30, 65, 140), k.z(1)]);
    k.add([k.rect(200, 44), k.pos(180, 460), k.outline(2, k.rgb(...C.ui_border)), k.z(2)]);
    k.add([k.text("↩  Rejouer", { size: 14 }), k.pos(280, 482), k.anchor("center"), k.color(200, 230, 255), k.z(3)]);

    k.add([k.rect(200, 44), k.pos(580, 460), k.color(20, 80, 40), k.z(1)]);
    k.add([k.rect(200, 44), k.pos(580, 460), k.outline(2, k.rgb(...C.green)), k.z(2)]);
    k.add([k.text("▶  Level 2 (bientôt)", { size: 14 }), k.pos(680, 482), k.anchor("center"), k.color(180, 230, 200), k.z(3)]);

    k.onKeyPress("space", () => k.go("level1"));
    k.onKeyPress("enter", () => k.go("level1"));
    k.onClick(() => {
      const m = k.mousePos();
      if (m.x > 180 && m.x < 380 && m.y > 460 && m.y < 504) k.go("level1");
    });
  });
}
