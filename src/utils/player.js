// ─────────────────────────────────────────────
//  PACK-IT  –  Player factory
//
//  Uses sprite sheets for the postman:
//    "player-standing"  →  idle frame
//    "player-run1/2"    →  running frames (alternated)
//  An invisible rect acts as the movement hitbox.
//
//  Optional 4th arg lets levels override bounds:
//    createPlayer(k, startX, blocker, {
//      startY, minX, maxX, minY, maxY
//    })
// ─────────────────────────────────────────────
import { C, PLAYER_SPEED } from "../data/constants.js";

const ROAD_Y        = 285;
const SPR_SCALE     = 0.09;
const FLIP_INTERVAL = 0.13;

export function createPlayer(k, startX, blocker, {
  startY = ROAD_Y - 18,
  minX   = 20,
  maxX   = 900,
  minY   = 220,
  maxY   = 420,
} = {}) {

  const player = k.add([
    k.rect(28, 36),
    k.pos(startX, startY),
    k.color(0, 0, 0),
    k.opacity(0),
    k.area({ width: 24, height: 30, offset: k.vec2(2, 3) }),
    k.anchor("topleft"),
    k.z(20),
    "player",
  ]);

  const SPR_OFF = k.vec2(14, 18);

  const sprStand = k.add([
    k.sprite("player-standing"),
    k.pos(0, 0),
    k.scale(SPR_SCALE), k.anchor("center"),
    k.z(20), k.opacity(1),
    k.follow(player, SPR_OFF),
  ]);
  const sprRun1 = k.add([
    k.sprite("player-run1"),
    k.pos(0, 0),
    k.scale(SPR_SCALE), k.anchor("center"),
    k.z(20), k.opacity(0),
    k.follow(player, SPR_OFF),
  ]);
  const sprRun2 = k.add([
    k.sprite("player-run2"),
    k.pos(0, 0),
    k.scale(SPR_SCALE), k.anchor("center"),
    k.z(20), k.opacity(0),
    k.follow(player, SPR_OFF),
  ]);

  const badge = k.add([
    k.rect(18, 14),
    k.pos(0, 0),
    k.color(...C.packet),
    k.z(22),
    k.opacity(0),
    k.follow(player, k.vec2(20, -20)),
  ]);

  let runFrame = 0;
  let runTimer = 0;

  k.onUpdate(() => {
    if (blocker.isBlocked) {
      sprStand.opacity = 1;
      sprRun1.opacity  = 0;
      sprRun2.opacity  = 0;
      return;
    }

    const left  = k.isKeyDown("left")  || k.isKeyDown("a");
    const right = k.isKeyDown("right") || k.isKeyDown("d");
    const up    = k.isKeyDown("up")    || k.isKeyDown("w");
    const down  = k.isKeyDown("down")  || k.isKeyDown("s");
    const moving = left || right || up || down;

    const spd = PLAYER_SPEED;
    if (left)  player.move(-spd, 0);
    if (right) player.move( spd, 0);
    if (up)    player.move(0, -spd);
    if (down)  player.move(0,  spd);

    player.pos.x = Math.max(minX, Math.min(maxX, player.pos.x));
    player.pos.y = Math.max(minY, Math.min(maxY, player.pos.y));

    if (left)  { sprStand.flipX = true;  sprRun1.flipX = true;  sprRun2.flipX = true;  }
    if (right) { sprStand.flipX = false; sprRun1.flipX = false; sprRun2.flipX = false; }

    if (moving) {
      runTimer += k.dt();
      if (runTimer >= FLIP_INTERVAL) { runTimer = 0; runFrame = 1 - runFrame; }
      sprStand.opacity = 0;
      sprRun1.opacity  = runFrame === 0 ? 1 : 0;
      sprRun2.opacity  = runFrame === 1 ? 1 : 0;
    } else {
      sprStand.opacity = 1;
      sprRun1.opacity  = 0;
      sprRun2.opacity  = 0;
    }
  });

  return {
    obj: player,
    showBadge() { badge.opacity = 1; },
    hideBadge() { badge.opacity = 0; },
    get pos()   { return player.pos; },
  };
}
