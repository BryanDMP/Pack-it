// ─────────────────────────────────────────────
//  PACK-IT  –  World drawing helpers
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";

/**
 * Draws the base road + grass background for Level 1.
 * @param {object} k - kaplay instance
 */
export function drawLevel1Background(k) {
  // Sky
  k.add([k.rect(960, 540), k.pos(0, 0), k.color(135, 170, 210), k.z(-10)]);
  // Grass (top strip + bottom strip)
  k.add([k.rect(960, 180), k.pos(0, 200), k.color(...C.grass), k.z(-5)]);
  k.add([k.rect(960, 180), k.pos(0, 360), k.color(...C.grass), k.z(-5)]);
  // Road
  k.add([k.rect(960, 60), k.pos(0, 255), k.color(...C.road), k.z(-4)]);
  // Dashed centre line
  for (let x = 0; x < 960; x += 60) {
    k.add([k.rect(40, 4), k.pos(x, 283), k.color(220, 220, 100, 180), k.z(-3)]);
  }
  // Pavements
  k.add([k.rect(960, 8), k.pos(0, 254), k.color(...C.sidewalk), k.z(-3)]);
  k.add([k.rect(960, 8), k.pos(0, 314), k.color(...C.sidewalk), k.z(-3)]);
}

/**
 * Draws a house at world position (wx, wy=360).
 * @param {object} k
 * @param {number} wx        - left x of house
 * @param {string} label     - name tag shown above door
 * @param {number[]} bodyCol - RGB for walls
 * @param {number[]} roofCol - RGB for roof
 * @param {boolean} isPost   - show DNS flag pole?
 */
export function drawHouse(k, wx, label, bodyCol, roofCol, isPost = false) {
  const wy = 360;
  const W = 80, H = 70, ROOF = 30;

  // Shadow
  k.add([k.rect(W + 8, H + 8), k.pos(wx - 4, wy - 4), k.color(...C.shadow), k.opacity(0.3), k.z(0)]);
  // Body
  k.add([k.rect(W, H), k.pos(wx, wy), k.color(...bodyCol), k.z(1)]);
  // Roof
  k.add([k.polygon([k.vec2(0, 0), k.vec2(W, 0), k.vec2(W / 2, -ROOF)]),
         k.pos(wx, wy), k.color(...roofCol), k.z(2)]);
  // Door
  k.add([k.rect(18, 28), k.pos(wx + 31, wy + 42), k.color(80, 50, 30), k.z(3)]);
  k.add([k.circle(3), k.pos(wx + 46, wy + 56), k.color(220, 180, 60), k.z(4)]);
  // Windows
  for (const wx2 of [wx + 8, wx + 48]) {
    k.add([k.rect(20, 20), k.pos(wx2, wy + 12), k.color(180, 220, 255, 200), k.z(3)]);
    k.add([k.rect(2, 20), k.pos(wx2 + 9, wy + 12), k.color(100, 100, 130), k.z(4)]);
    k.add([k.rect(20, 2), k.pos(wx2, wy + 21), k.color(100, 100, 130), k.z(4)]);
  }
  // Label
  const lw = label.length * 7 + 10;
  k.add([k.rect(lw, 18), k.pos(wx + W / 2 - lw / 2, wy - 20), k.color(...C.ui_bg), k.z(5)]);
  k.add([k.text(label, { size: 10 }), k.pos(wx + W / 2, wy - 11), k.anchor("center"), k.color(...C.text), k.z(6)]);

  // Post-office flagpole
  if (isPost) {
    k.add([k.rect(4, 50), k.pos(wx + 38, wy - 50), k.color(180, 180, 180), k.z(3)]);
    k.add([k.rect(20, 14), k.pos(wx + 42, wy - 50), k.color(80, 160, 220), k.z(4)]);
  }
}

/**
 * Adds directional path arrows along the road.
 * @param {number} direction  1 = right (default), -1 = left
 * Returns a cleanup function.
 */
export function showPathArrows(k, fromX = 200, toX = 800, direction = 1) {
  const objs = [];
  const step = direction > 0 ? 80 : -80;
  const rightArrow = [k.vec2(0, -8), k.vec2(20, 0),  k.vec2(0, 8)];
  const leftArrow  = [k.vec2(20, -8), k.vec2(0, 0), k.vec2(20, 8)];
  for (let x = fromX; direction > 0 ? x < toX : x > toX; x += step) {
    objs.push(
      k.add([
        k.polygon(direction > 0 ? rightArrow : leftArrow),
        k.pos(x, 275),
        k.color(...C.highlight),
        k.opacity(0.7),
        k.z(10),
      ])
    );
  }
  return () => objs.forEach(o => k.destroy(o));
}
