// ─────────────────────────────────────────────
//  PACK-IT  –  Scene: Win (Level 4)
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";

export function registerWin4Scene(k) {
  k.scene("win4", () => {
    k.play("levelComplete");
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

    k.add([k.text("Paquet livre !", { size: 34 }), k.pos(480, 90), k.anchor("center"), k.color(...C.green), k.z(1)]);

    // Route summary
    k.add([k.rect(560, 40), k.pos(480, 152), k.anchor("center"), k.color(0, 0, 0), k.opacity(0.45), k.z(1)]);
    k.add([
      k.text("Chemin Nord  •  1 routeur  •  TTL : 2 → 1 → livraison", { size: 13 }),
      k.pos(480, 152), k.anchor("center"), k.color(255, 255, 255), k.z(2),
    ]);

    // Learning outcomes
    k.add([k.rect(680, 270), k.pos(480, 340), k.anchor("center"), k.color(0, 0, 0), k.opacity(0.45), k.z(1)]);
    k.add([
      k.text(
        "Ce que tu as appris :\n\n" +
        "  Chaque paquet IP porte un champ TTL\n" +
        "  (Time To Live) initialise par l'expediteur.\n\n" +
        "  A chaque routeur traverse, le TTL decremente de 1.\n" +
        "  Si le TTL atteint 0, le routeur detruit le paquet\n" +
        "  et envoie un message ICMP 'Time Exceeded'.\n\n" +
        "  Choisir le chemin avec le moins de sauts\n" +
        "  garantit la livraison quand le TTL est faible.",
        { size: 13, width: 640 }
      ),
      k.pos(480, 340), k.anchor("center"), k.color(255, 255, 255), k.z(2),
    ]);

    // Buttons
    k.add([k.rect(200, 44), k.pos(180, 472), k.color(30, 65, 140), k.z(1)]);
    k.add([k.rect(200, 44), k.pos(180, 472), k.outline(2, k.rgb(...C.ui_border)), k.z(2)]);
    k.add([k.text("↩  Rejouer", { size: 14 }), k.pos(280, 494), k.anchor("center"), k.color(200, 230, 255), k.z(3)]);

    k.add([k.rect(200, 44), k.pos(580, 472), k.color(20, 50, 35), k.z(1)]);
    k.add([k.rect(200, 44), k.pos(580, 472), k.outline(2, k.rgb(...C.green)), k.z(2)]);
    k.add([k.text("▶  Level 5 (bientot)", { size: 14 }), k.pos(680, 494), k.anchor("center"), k.color(160, 210, 180), k.z(3)]);

    k.add([
      k.text("Astuce : depuis l'accueil, tape  « ttl »  + ENTREE pour rejouer ce niveau.", { size: 10 }),
      k.pos(480, 525), k.anchor("center"), k.color(220, 80, 80), k.z(3),
    ]);

    k.onKeyPress("space", () => k.go("level4"));
    k.onKeyPress("enter", () => k.go("level4"));
    k.onClick(() => {
      const m = k.mousePos();
      if (m.x > 180 && m.x < 380 && m.y > 472 && m.y < 516) k.go("level4");
    });
  });
}
