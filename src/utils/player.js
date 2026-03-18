// ─────────────────────────────────────────────
//  PACK-IT  –  Player factory
// ─────────────────────────────────────────────
import { C, PLAYER_SPEED } from "../data/constants.js";

const ROAD_Y = 285;

/**
 * Spawns the player character and attaches movement.
 * Returns the player game-object + a carried-packet indicator.
 *
 * Movement is only active when `blocker.isBlocked === false`.
 * `blocker` is any object with an `isBlocked` boolean getter.
 */
export function createPlayer(k, startX, blocker) {
  const player = k.add([
    k.rect(28, 36),
    k.pos(startX, ROAD_Y - 18),
    k.color(...C.player),
    k.area({ width: 24, height: 30, offset: k.vec2(2, 3) }),
    k.anchor("topleft"),
    k.z(20),
    "player",
  ]);

  // Hat
  k.add([k.rect(32, 8), k.pos(0, 0), k.color(60, 40, 20), k.z(21), k.follow(player, k.vec2(-2, -8))]);

  // Carried packet badge (hidden by default)
  const badge = k.add([
    k.rect(18, 14),
    k.pos(0, 0),
    k.color(...C.packet),
    k.z(22),
    k.opacity(0),
    k.follow(player, k.vec2(5, -18)),
  ]);

  // Movement loop
  k.onUpdate(() => {
    if (blocker.isBlocked) return;

    const spd = PLAYER_SPEED;
    if (k.isKeyDown("left")  || k.isKeyDown("a")) player.move(-spd, 0);
    if (k.isKeyDown("right") || k.isKeyDown("d")) player.move( spd, 0);
    if (k.isKeyDown("up")    || k.isKeyDown("w")) player.move(0, -spd);
    if (k.isKeyDown("down")  || k.isKeyDown("s")) player.move(0,  spd);

    // World bounds
    player.pos.x = Math.max(20, Math.min(900, player.pos.x));
    player.pos.y = Math.max(220, Math.min(420, player.pos.y));
  });

  return {
    obj: player,
    showBadge()  { badge.opacity = 1; },
    hideBadge()  { badge.opacity = 0; },
    get pos()    { return player.pos; },
  };
}
