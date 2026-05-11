// ─────────────────────────────────────────────
//  PACK-IT  –  World drawing helpers
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";

export function drawLevel1Background(k) {
  k.add([k.rect(960, 540), k.pos(0, 0),   k.color(135, 170, 210), k.z(-10)]);
  k.add([k.rect(960, 180), k.pos(0, 200), k.color(...C.grass),    k.z(-5)]);
  k.add([k.rect(960, 180), k.pos(0, 360), k.color(...C.grass),    k.z(-5)]);
  k.add([k.rect(960, 60),  k.pos(0, 255), k.color(...C.road),     k.z(-4)]);
  for (let x = 0; x < 960; x += 60)
    k.add([k.rect(40, 4), k.pos(x, 283), k.color(220, 220, 100, 180), k.z(-3)]);
  k.add([k.rect(960, 8), k.pos(0, 254), k.color(...C.sidewalk), k.z(-3)]);
  k.add([k.rect(960, 8), k.pos(0, 314), k.color(...C.sidewalk), k.z(-3)]);
}

export function drawHouse(k, wx, label, bodyCol, roofCol, isPost = false) {
  const wy = 360;
  const W = 80, H = 70, ROOF = 30;

  k.add([k.rect(W + 8, H + 8), k.pos(wx - 4, wy - 4), k.color(...C.shadow), k.opacity(0.3), k.z(0)]);
  k.add([k.rect(W, H), k.pos(wx, wy), k.color(...bodyCol), k.z(1)]);
  k.add([k.polygon([k.vec2(0, 0), k.vec2(W, 0), k.vec2(W / 2, -ROOF)]),
         k.pos(wx, wy), k.color(...roofCol), k.z(2)]);
  k.add([k.rect(18, 28), k.pos(wx + 31, wy + 42), k.color(80, 50, 30), k.z(3)]);
  k.add([k.circle(3), k.pos(wx + 46, wy + 56), k.color(220, 180, 60), k.z(4)]);
  for (const wx2 of [wx + 8, wx + 48]) {
    k.add([k.rect(20, 20), k.pos(wx2, wy + 12), k.color(180, 220, 255, 200), k.z(3)]);
    k.add([k.rect(2, 20),  k.pos(wx2 + 9, wy + 12), k.color(100, 100, 130), k.z(4)]);
    k.add([k.rect(20, 2),  k.pos(wx2, wy + 21),     k.color(100, 100, 130), k.z(4)]);
  }
  const lw = label.length * 7 + 10;
  k.add([k.rect(lw, 18), k.pos(wx + W / 2 - lw / 2, wy - 20), k.color(...C.ui_bg), k.z(5)]);
  k.add([k.text(label, { size: 10 }), k.pos(wx + W / 2, wy - 11), k.anchor("center"), k.color(...C.text), k.z(6)]);

  if (isPost) {
    k.add([k.rect(4, 50), k.pos(wx + 38, wy - 50), k.color(180, 180, 180), k.z(3)]);
    k.add([k.rect(20, 14), k.pos(wx + 42, wy - 50), k.color(80, 160, 220), k.z(4)]);
  }
}

export function drawLevel3Background(k) {
  // Sky
  k.add([k.rect(960, 540), k.pos(0, 0),    k.color(135, 170, 210), k.z(-10)]);

  // Left subnet grass (192.168.1.x) – warm green
  k.add([k.rect(480, 180), k.pos(0,   200), k.color(65, 105, 55), k.z(-5)]);
  k.add([k.rect(480, 180), k.pos(0,   360), k.color(65, 105, 55), k.z(-5)]);

  // Right subnet grass (10.0.0.x) – cooler teal-green
  k.add([k.rect(480, 180), k.pos(480, 200), k.color(50, 100, 80), k.z(-5)]);
  k.add([k.rect(480, 180), k.pos(480, 360), k.color(50, 100, 80), k.z(-5)]);

  // Road
  k.add([k.rect(960, 60),  k.pos(0, 255), k.color(...C.road),     k.z(-4)]);

  // Dashed road markings
  for (let x = 0; x < 960; x += 60)
    k.add([k.rect(40, 4), k.pos(x, 283), k.color(220, 220, 100, 180), k.z(-3)]);

  // Sidewalks
  k.add([k.rect(960, 8), k.pos(0, 254), k.color(...C.sidewalk), k.z(-3)]);
  k.add([k.rect(960, 8), k.pos(0, 314), k.color(...C.sidewalk), k.z(-3)]);

  // Subnet boundary line at x=480
  k.add([k.rect(3, 540), k.pos(479, 0), k.color(200, 210, 255), k.opacity(0.35), k.z(-2)]);

  // Subnet labels (shown above the houses)
  k.add([k.text("Sous-reseau : 192.168.1.0/24", { size: 10 }),
         k.pos(240, 55), k.anchor("center"), k.color(200, 220, 255), k.z(-1)]);
  k.add([k.text("Sous-reseau : 10.0.0.0/24", { size: 10 }),
         k.pos(720, 55), k.anchor("center"), k.color(180, 230, 200), k.z(-1)]);
}

export function drawRouter(k, wx) {
  const wy = 360;
  const W = 80, H = 65;

  // Shadow
  k.add([k.rect(W + 8, H + 8), k.pos(wx - 4, wy - 4), k.color(...C.shadow), k.opacity(0.3), k.z(0)]);

  // Body (dark metallic blue-grey)
  k.add([k.rect(W, H), k.pos(wx, wy), k.color(55, 65, 90), k.z(1)]);

  // Top panel strip
  k.add([k.rect(W, 14), k.pos(wx, wy), k.color(75, 88, 115), k.z(2)]);

  // Left antenna + red LED
  k.add([k.rect(3, 28), k.pos(wx + 16, wy - 28), k.color(180, 180, 190), k.z(3)]);
  k.add([k.circle(4),   k.pos(wx + 17, wy - 28),  k.color(220, 60,  60),  k.z(4)]);

  // Right antenna + green LED
  k.add([k.rect(3, 28), k.pos(wx + 60, wy - 28), k.color(180, 180, 190), k.z(3)]);
  k.add([k.circle(4),   k.pos(wx + 61, wy - 28),  k.color(60,  220, 100), k.z(4)]);

  // Activity LEDs row
  for (let i = 0; i < 4; i++)
    k.add([k.circle(3), k.pos(wx + 10 + i * 16, wy + 8), k.color(60, 220, 80), k.z(3)]);

  // Port slots (decorative)
  for (let i = 0; i < 3; i++)
    k.add([k.rect(16, 8), k.pos(wx + 8 + i * 22, wy + 28), k.color(35, 45, 65), k.z(3)]);

  // Label background + text
  const label = "Routeur";
  const lw = label.length * 7 + 10;
  k.add([k.rect(lw, 18), k.pos(wx + W / 2 - lw / 2, wy - 20), k.color(...C.ui_bg), k.z(5)]);
  k.add([k.text(label, { size: 10 }), k.pos(wx + W / 2, wy - 11), k.anchor("center"), k.color(...C.text), k.z(6)]);
}

export function showPathArrows(k, fromX = 200, toX = 800, direction = 1) {
  const objs = [];
  const step       = direction > 0 ? 80 : -80;
  const rightArrow = [k.vec2(0, -8), k.vec2(20, 0),  k.vec2(0, 8)];
  const leftArrow  = [k.vec2(20, -8), k.vec2(0, 0),  k.vec2(20, 8)];
  for (let x = fromX; direction > 0 ? x < toX : x > toX; x += step) {
    objs.push(k.add([
      k.polygon(direction > 0 ? rightArrow : leftArrow),
      k.pos(x, 275),
      k.color(...C.highlight),
      k.opacity(0.7),
      k.z(10),
    ]));
  }
  return () => objs.forEach(o => k.destroy(o));
}