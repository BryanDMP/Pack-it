import { C } from "../data/constants.js";

export function registerWin2Scene(k) {
  k.scene("win2", () => {
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

    k.add([k.text("Lettre livree !", { size: 34 }), k.pos(480, 100), k.anchor("center"), k.color(...C.green), k.z(1)]);

    // fond semi-transparent derriere le sous-titre
    k.add([k.rect(420, 50), k.pos(480, 175), k.anchor("center"), k.color(0, 0, 0), k.opacity(0.45), k.z(1)]);
    k.add([k.text("bob.com  ->  alice.com\n192.168.1.2  ->  192.168.1.1", { size: 16 }), k.pos(480, 175), k.anchor("center"), k.color(255, 255, 255), k.z(2)]);

    // fond semi-transparent derriere le bloc "Ce que tu as appris"
    k.add([k.rect(660, 180), k.pos(480, 320), k.anchor("center"), k.color(0, 0, 0), k.opacity(0.45), k.z(1)]);
    k.add([
      k.text(
        "Ce que tu as appris :\n\n" +
        "  Un paquet IP contient deux adresses :\n" +
        "  SRC (source) - d'ou vient le paquet\n" +
        "  DST (destination) - ou il doit aller\n\n" +
        "  Ton logbook t'a evite de retourner au DNS :\n" +
        "  les adresses etaient deja en cache !",
        { size: 14, width: 620 }
      ),
      k.pos(480, 320),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.z(2),
    ]);

    // Boutons
    k.add([k.rect(200, 44), k.pos(180, 460), k.color(30, 65, 140), k.z(1)]);
    k.add([k.rect(200, 44), k.pos(180, 460), k.outline(2, k.rgb(...C.ui_border)), k.z(2)]);
    k.add([k.text("↩  Rejouer", { size: 14 }), k.pos(280, 482), k.anchor("center"), k.color(200, 230, 255), k.z(3)]);

    k.add([k.rect(200, 44), k.pos(580, 460), k.color(20, 80, 40), k.z(1)]);
    k.add([k.rect(200, 44), k.pos(580, 460), k.outline(2, k.rgb(...C.green)), k.z(2)]);
    k.add([k.text("▶  Level 3", { size: 14 }), k.pos(680, 482), k.anchor("center"), k.color(180, 230, 200), k.z(3)]);

    k.onKeyPress("space", () => k.go("level2"));
    k.onKeyPress("enter", () => k.go("level3"));
    k.onClick(() => {
      const m = k.mousePos();
      if (m.x > 180 && m.x < 380 && m.y > 460 && m.y < 504) k.go("level2");
      if (m.x > 580 && m.x < 780 && m.y > 460 && m.y < 504) k.go("level3");
    });
  });
}