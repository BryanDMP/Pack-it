// ─────────────────────────────────────────────
//  PACK-IT  –  World drawing helpers
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";

// ── Level 1 / 2 / 3 background (single road) ──────────────────────────────
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

// ── Level 3 background (two subnets, single road) ─────────────────────────
export function drawLevel3Background(k) {
  k.add([k.rect(960, 540), k.pos(0, 0),    k.color(135, 170, 210), k.z(-10)]);
  k.add([k.rect(480, 180), k.pos(0,   200), k.color(65, 105, 55), k.z(-5)]);
  k.add([k.rect(480, 180), k.pos(0,   360), k.color(65, 105, 55), k.z(-5)]);
  k.add([k.rect(480, 180), k.pos(480, 200), k.color(50, 100, 80), k.z(-5)]);
  k.add([k.rect(480, 180), k.pos(480, 360), k.color(50, 100, 80), k.z(-5)]);
  k.add([k.rect(960, 60),  k.pos(0, 255), k.color(...C.road),     k.z(-4)]);
  for (let x = 0; x < 960; x += 60)
    k.add([k.rect(40, 4), k.pos(x, 283), k.color(220, 220, 100, 180), k.z(-3)]);
  k.add([k.rect(960, 8), k.pos(0, 254), k.color(...C.sidewalk), k.z(-3)]);
  k.add([k.rect(960, 8), k.pos(0, 314), k.color(...C.sidewalk), k.z(-3)]);
  k.add([k.rect(3, 540), k.pos(479, 0), k.color(200, 210, 255), k.opacity(0.35), k.z(-2)]);
  k.add([k.text("Sous-reseau : 192.168.1.0/24", { size: 10 }),
         k.pos(240, 55), k.anchor("center"), k.color(200, 220, 255), k.z(-1)]);
  k.add([k.text("Sous-reseau : 10.0.0.0/24", { size: 10 }),
         k.pos(720, 55), k.anchor("center"), k.color(180, 230, 200), k.z(-1)]);
}

// ── Level 4 background (two parallel roads = two routes) ──────────────────
// Layout:
//   Sky:          y =   0 – 165
//   Top road:     y = 165 – 245   ← Chemin Nord (1 routeur)
//   Middle grass: y = 245 – 310
//   Bottom road:  y = 310 – 390   ← Chemin Sud  (2 routeurs)
//   Bottom grass: y = 390 – 540
//   Left / Right junctions (vertical connectors) at x 30-190 and x 780-940
export function drawLevel4Background(k) {
  // Sky
  k.add([k.rect(960, 540), k.pos(0, 0), k.color(135, 170, 210), k.z(-10)]);

  // Top grass strip (above top road)
  k.add([k.rect(960, 165), k.pos(0,   0), k.color(...C.grass), k.z(-5)]);
  // Top road
  k.add([k.rect(960,  80), k.pos(0, 165), k.color(...C.road),  k.z(-4)]);
  // Middle grass
  k.add([k.rect(960,  65), k.pos(0, 245), k.color(...C.grass), k.z(-5)]);
  // Bottom road
  k.add([k.rect(960,  80), k.pos(0, 310), k.color(...C.road),  k.z(-4)]);
  // Bottom grass strip
  k.add([k.rect(960, 150), k.pos(0, 390), k.color(...C.grass), k.z(-5)]);

  // Sidewalks
  k.add([k.rect(960, 7), k.pos(0, 164), k.color(...C.sidewalk), k.z(-3)]);
  k.add([k.rect(960, 7), k.pos(0, 245), k.color(...C.sidewalk), k.z(-3)]);
  k.add([k.rect(960, 7), k.pos(0, 309), k.color(...C.sidewalk), k.z(-3)]);
  k.add([k.rect(960, 7), k.pos(0, 390), k.color(...C.sidewalk), k.z(-3)]);

  // Road lane markings
  for (let x = 0; x < 960; x += 60) {
    k.add([k.rect(40, 4), k.pos(x, 203), k.color(220, 220, 100, 180), k.z(-3)]); // top road
    k.add([k.rect(40, 4), k.pos(x, 348), k.color(220, 220, 100, 180), k.z(-3)]); // bottom road
  }

  // Left junction (vertical road connector near alice)
  k.add([k.rect(160, 226), k.pos(30, 164), k.color(...C.road),     k.z(-4)]);
  k.add([k.rect(160,   7), k.pos(30, 163), k.color(...C.sidewalk), k.z(-3)]);
  k.add([k.rect(160,   7), k.pos(30, 390), k.color(...C.sidewalk), k.z(-3)]);

  // Right junction (vertical road connector near bob)
  k.add([k.rect(160, 226), k.pos(780, 164), k.color(...C.road),     k.z(-4)]);
  k.add([k.rect(160,   7), k.pos(780, 163), k.color(...C.sidewalk), k.z(-3)]);
  k.add([k.rect(160,   7), k.pos(780, 390), k.color(...C.sidewalk), k.z(-3)]);

  // Route labels (always visible hints)
  k.add([k.text("Chemin Nord  •  1 routeur",  { size: 11 }),
         k.pos(480, 150), k.anchor("center"), k.color(180, 230, 200), k.z(-1)]);
  k.add([k.text("Chemin Sud  •  2 routeurs", { size: 11 }),
         k.pos(480, 296), k.anchor("center"), k.color(255, 180, 160), k.z(-1)]);
}

// ── House (optional wy, default 360 – keeps L1/2/3 calls unchanged) ────────
export function drawHouse(k, wx, label, bodyCol, roofCol, isPost = false, wy = 360) {
  const W = 80, H = 70, ROOF = 30;

  k.add([k.rect(W + 8, H + 8), k.pos(wx - 4, wy - 4), k.color(...C.shadow), k.opacity(0.3), k.z(0)]);
  k.add([k.rect(W, H), k.pos(wx, wy), k.color(...bodyCol), k.z(1)]);
  k.add([k.polygon([k.vec2(0, 0), k.vec2(W, 0), k.vec2(W / 2, -ROOF)]),
         k.pos(wx, wy), k.color(...roofCol), k.z(2)]);
  k.add([k.rect(18, 28), k.pos(wx + 31, wy + 42), k.color(80, 50, 30), k.z(3)]);
  k.add([k.circle(3),    k.pos(wx + 46, wy + 56), k.color(220, 180, 60), k.z(4)]);
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

// ── Router (optional wy, default 360) ─────────────────────────────────────
export function drawRouter(k, wx, wy = 360) {
  const W = 80, H = 65;

  k.add([k.rect(W + 8, H + 8), k.pos(wx - 4, wy - 4), k.color(...C.shadow), k.opacity(0.3), k.z(0)]);
  k.add([k.rect(W, H), k.pos(wx, wy), k.color(55, 65, 90), k.z(1)]);
  k.add([k.rect(W, 14), k.pos(wx, wy), k.color(75, 88, 115), k.z(2)]);

  k.add([k.rect(3, 28), k.pos(wx + 16, wy - 28), k.color(180, 180, 190), k.z(3)]);
  k.add([k.circle(4),   k.pos(wx + 17, wy - 28),  k.color(220, 60,  60),  k.z(4)]);
  k.add([k.rect(3, 28), k.pos(wx + 60, wy - 28), k.color(180, 180, 190), k.z(3)]);
  k.add([k.circle(4),   k.pos(wx + 61, wy - 28),  k.color(60,  220, 100), k.z(4)]);

  for (let i = 0; i < 4; i++)
    k.add([k.circle(3), k.pos(wx + 10 + i * 16, wy + 8), k.color(60, 220, 80), k.z(3)]);
  for (let i = 0; i < 3; i++)
    k.add([k.rect(16, 8), k.pos(wx + 8 + i * 22, wy + 28), k.color(35, 45, 65), k.z(3)]);

  const label = "Routeur";
  const lw = label.length * 7 + 10;
  k.add([k.rect(lw, 18), k.pos(wx + W / 2 - lw / 2, wy - 20), k.color(...C.ui_bg), k.z(5)]);
  k.add([k.text(label, { size: 10 }), k.pos(wx + W / 2, wy - 11), k.anchor("center"), k.color(...C.text), k.z(6)]);
}

// ── Path arrows (optional roadY, default 275 – keeps old calls unchanged) ──
export function showPathArrows(k, fromX = 200, toX = 800, direction = 1, roadY = 275) {
  const objs = [];
  const step       = direction > 0 ? 80 : -80;
  const rightArrow = [k.vec2(0, -8), k.vec2(20, 0),  k.vec2(0, 8)];
  const leftArrow  = [k.vec2(20, -8), k.vec2(0, 0),  k.vec2(20, 8)];
  for (let x = fromX; direction > 0 ? x < toX : x > toX; x += step) {
    objs.push(k.add([
      k.polygon(direction > 0 ? rightArrow : leftArrow),
      k.pos(x, roadY),
      k.color(...C.highlight),
      k.opacity(0.7),
      k.z(10),
    ]));
  }
  return () => objs.forEach(o => k.destroy(o));
}
