// ─────────────────────────────────────────────
//  PACK-IT  –  NPC factory
//
//  Creates a resident sprite near a house.
//  playHandoff(tx, ty, onDone) animates the NPC
//  stepping forward while a packet rect flies
//  from the NPC to the player.
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";

const NPC_SCALE = 0.085;

/**
 * @param {object} k        - kaplay instance
 * @param {string} sprite   - loaded sprite name ("alice" | "bob" | "eve")
 * @param {number} x        - world x (center of NPC)
 * @param {number} y        - world y (center of NPC)
 * @param {object} opts
 * @param {boolean} [opts.facingLeft=false] - mirror sprite horizontally
 */
export function createNPC(k, sprite, x, y, { facingLeft = false } = {}) {
  const npc = k.add([
    k.sprite(sprite),
    k.pos(x, y),
    k.scale(NPC_SCALE),
    k.anchor("center"),
    k.z(19),
    k.opacity(1),
  ]);
  if (facingLeft) npc.flipX = true;

  const baseY = y;

  /**
   * Animate NPC handing a packet to the player.
   * @param {number}   targetX  - player sprite-center x
   * @param {number}   targetY  - player sprite-center y
   * @param {function} onDone   - called when animation finishes
   */
  function playHandoff(targetX, targetY, onDone) {
    // Packet appears at NPC's "hands" (slightly above center)
    const startX = x;
    const startY = y - 22;

    const flyPkt = k.add([
      k.rect(14, 10),
      k.pos(startX, startY),
      k.color(...C.packet),
      k.anchor("center"),
      k.z(26),
    ]);

    const DURATION = 0.65;
    let elapsed = 0;

    const handle = k.onUpdate(() => {
      elapsed += k.dt();
      const p    = Math.min(elapsed / DURATION, 1);
      // ease-in-out quad
      const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;

      // NPC bounces forward (toward road) then returns
      npc.pos.y = baseY - 14 * Math.sin(p * Math.PI);

      // Packet arcs to player
      flyPkt.pos.x = k.lerp(startX, targetX, ease);
      flyPkt.pos.y = k.lerp(startY,  targetY - 20, ease);

      if (p >= 1) {
        handle.cancel();
        k.destroy(flyPkt);
        npc.pos.y = baseY;
        onDone?.();
      }
    });
  }

  return { obj: npc, playHandoff };
}
