// ─────────────────────────────────────────────
//  PACK-IT  –  Scene: Level 4
//
//  Concept: TTL (Time To Live)
//  alice.com envoie un paquet avec TTL = 2 à
//  bob.com. Chaque routeur traversé décrémente
//  le TTL de 1. Si TTL = 0 le paquet est détruit.
//
//  Carte :
//    Chemin Nord  (y ≈ 205)  :  1 routeur  → TTL 2→1 → OK
//    Chemin Sud   (y ≈ 350)  :  2 routeurs → TTL 2→1→0 → FAIL
//
//  Flow:
//    intro → go_alice → (handoff) → has_packet
//    → en_route (TTL tick aux routeurs)
//    ↳ ttl_zero  (fail, restart on SPACE)
//    → at_bob → win4
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";
import { logbookGet, logbookAdd, logbookSummary } from "../data/logbook.js";
import { createDialog }     from "../ui/dialog.js";
import {
  drawLevel4Background, drawHouse, drawRouter, showPathArrows,
} from "../utils/world.js";
import { createPlayer }     from "../utils/player.js";
import { createNPC }        from "../utils/npc.js";

const TTL_START = 2;

// Router positions (wx = left edge of router body)
const R_NORD  = { wx: 430, wy: 165, cx: 470, cy: 205 }; // top road
const R_SUD_A = { wx: 280, wy: 310, cx: 320, cy: 350 }; // bottom road
const R_SUD_B = { wx: 570, wy: 310, cx: 610, cy: 350 }; // bottom road

// Road corridor bounds — player rect is 28×36 (w×h), anchor "topleft"
//   top road body:    y 165–245  →  py range [165, 209]
//   bottom road body: y 310–390  →  py range [310, 354]
//   left junction:    x  30–190  →  px range [30,  162]
//   right junction:   x 780–940  →  px range [780, 912]
const ROAD_TOP_MIN = 165, ROAD_TOP_MAX = 209;
const ROAD_BOT_MIN = 310, ROAD_BOT_MAX = 354;
const JUNC_L_X2    = 162;   // 190 - 28
const JUNC_R_X1    = 780;

export function registerLevel4Scene(k) {
  k.scene("level4", () => {

    if (!logbookGet("alice.com")) logbookAdd("alice.com", "192.168.1.1");
    if (!logbookGet("bob.com"))   logbookAdd("bob.com",   "192.168.1.2");

    // ── State ─────────────────────────────────
    let state      = "intro";
    let ttl        = TTL_START;
    let clearArrows = () => {};
    let pickupAnim  = false;
    let packetObj   = null;
    let packetLabel = null;

    // Router zone edge-triggers (fire only on entry, not while inside)
    let inNord = false, inSudA = false, inSudB = false;

    const blocker = {
      // state === "ttl_zero" also freezes via dialog.isOpen, but explicit is clearer
      get isBlocked() { return dialog.isOpen || pickupAnim || state === "ttl_zero"; },
    };

    // ── World ─────────────────────────────────
    drawLevel4Background(k);
    drawHouse(k, 35,  "alice.com", C.house, C.roof,                        false, 262);
    drawHouse(k, 820, "bob.com",   [160, 130, 90], [120, 70, 50],          false, 262);
    drawRouter(k, R_NORD.wx,  R_NORD.wy);
    drawRouter(k, R_SUD_A.wx, R_SUD_A.wy);
    drawRouter(k, R_SUD_B.wx, R_SUD_B.wy);

    // ── NPC sprites ───────────────────────────
    const aliceNPC = createNPC(k, "alice",  75, 275, { facingLeft: false });
    const bobNPC   = createNPC(k, "bob",   860, 275, { facingLeft: true  });

    // ── Packet on Alice's doorstep ─────────────
    packetObj = k.add([k.rect(22, 16), k.pos(72, 258), k.color(...C.packet), k.z(15)]);
    packetLabel = k.add([
      k.text("!", { size: 12 }), k.pos(0, 0), k.anchor("center"),
      k.color(255, 255, 255), k.z(16), k.follow(packetObj, k.vec2(11, 8)),
    ]);

    // ── Player – bounds cover both roads; corridor onUpdate below refines this ──
    const player = createPlayer(k, 300, blocker, {
      startY: 200, minX: 20, maxX: 920, minY: ROAD_TOP_MIN, maxY: ROAD_BOT_MAX,
    });

    // ── Road corridor constraint ───────────────
    // Runs after createPlayer's own onUpdate (registered later = runs later).
    // Outside junctions the player must stay within one road band.
    // Inside a junction they can travel freely between the two roads.
    k.onUpdate(() => {
      if (blocker.isBlocked) return;
      const obj = player.obj;
      const px  = obj.pos.x;
      const py  = obj.pos.y;

      const inJunction = (px >= 30 && px <= JUNC_L_X2) || (px >= JUNC_R_X1);

      if (inJunction) {
        // Free vertical movement between the two road bands
        obj.pos.y = Math.max(ROAD_TOP_MIN, Math.min(py, ROAD_BOT_MAX));
      } else if (py >= ROAD_TOP_MIN && py <= ROAD_TOP_MAX) {
        // On top road – already valid
      } else if (py >= ROAD_BOT_MIN && py <= ROAD_BOT_MAX) {
        // On bottom road – already valid
      } else {
        // In the gap or out-of-range: snap to nearest road band
        const midGap = (ROAD_TOP_MAX + ROAD_BOT_MIN) / 2; // ≈ 260
        if (py <= midGap) {
          obj.pos.y = Math.max(ROAD_TOP_MIN, Math.min(py, ROAD_TOP_MAX));
        } else {
          obj.pos.y = Math.max(ROAD_BOT_MIN, Math.min(py, ROAD_BOT_MAX));
        }
      }
    });

    // ── HUD ───────────────────────────────────
    k.add([k.rect(960, 40), k.pos(0, 0), k.color(15, 15, 35), k.fixed(), k.z(100)]);
    k.add([k.text("PACK-IT  -  Level 4", { size: 13 }), k.pos(12, 12), k.color(...C.ui_border), k.fixed(), k.z(101)]);
    const hudMission = k.add([k.text("", { size: 11 }), k.pos(480, 12),  k.anchor("top"),      k.color(...C.text),     k.fixed(), k.z(101)]);
    const hudLog     = k.add([k.text("", { size: 10 }), k.pos(950,  8),  k.anchor("topright"), k.color(180, 200, 255), k.fixed(), k.z(101)]);
    const hudHint    = k.add([k.text("", { size: 10 }), k.pos(480, 528), k.anchor("center"),   k.color(160, 180, 240), k.fixed(), k.z(101)]);

    // ── TTL pill (floating below HUD, left side — no overlap) ─────────────
    // Taller pill: line 1 = current TTL value (colored), line 2 = definition
    const ttlPillBg  = k.add([k.rect(122, 46), k.pos(10, 44), k.color(30, 80, 50), k.outline(2, k.rgb(...C.green)), k.fixed(), k.z(101)]);
    const ttlPillTxt = k.add([
      k.text("TTL : 2", { size: 14 }),
      k.pos(71, 56), k.anchor("center"),
      k.color(...C.green),
      k.fixed(), k.z(102),
    ]);
    // Static subtitle — explains TTL in one line, never changes
    k.add([
      k.text("sauts restants", { size: 9 }),
      k.pos(71, 76), k.anchor("center"),
      k.color(160, 180, 220),
      k.fixed(), k.z(102),
    ]);

    const refreshHUD  = () => { hudLog.text = logbookSummary(); };

    function updateTTLHUD() {
      ttlPillTxt.text = `TTL : ${ttl}`;
      if (ttl >= 2) {
        ttlPillTxt.color = k.rgb(...C.green);
        ttlPillBg.color  = k.rgb(30, 80, 50);
      } else if (ttl === 1) {
        ttlPillTxt.color = k.rgb(255, 165, 50);
        ttlPillBg.color  = k.rgb(80, 55, 20);
      } else {
        ttlPillTxt.color = k.rgb(...C.red);
        ttlPillBg.color  = k.rgb(80, 20, 20);
      }
    }

    // ── TTL toast (non-blocking "-1 TTL" pop at router position) ──────────
    function spawnToast(cx, cy) {
      const lbl = k.add([
        k.text(`-1 TTL`, { size: 17 }),
        k.pos(cx, cy - 10),
        k.anchor("center"),
        k.color(...C.red),
        k.z(60),
      ]);
      let elapsed = 0;
      const h = k.onUpdate(() => {
        elapsed += k.dt();
        lbl.pos.y  -= 55 * k.dt();
        lbl.opacity = Math.max(0, 1 - elapsed / 1.1);
        if (elapsed > 1.1) { k.destroy(lbl); h.cancel(); }
      });
    }

    // ── Decrement TTL (called on router entry) ─────────────────────────────
    function decrementTTL(r) {
      ttl--;
      updateTTLHUD();
      spawnToast(r.cx, r.cy);
      if (ttl <= 0) {
        player.hideBadge();
        setState("ttl_zero");
      }
    }

    // ── Dialog ────────────────────────────────
    const dialog = createDialog(k);

    // ── State machine ─────────────────────────
    function setState(s) {
      state = s;
      dialog.hide();
      clearArrows();
      clearArrows = () => {};

      switch (s) {
        case "intro":
          dialog.show(
            "Paquet urgent ! alice.com envoie un message a bob.com.\n" +
            "TTL = 2 : chaque routeur traverse decremente le TTL de 1.\n" +
            "Si le TTL atteint 0, le paquet est detruit !"
          );
          hudMission.text = "Va chercher le paquet chez alice.com";
          hudHint.text    = "";
          break;

        case "go_alice":
          hudMission.text = "Va chercher le paquet chez alice.com";
          hudHint.text    = "";
          clearArrows = showPathArrows(k, 370, 100, -1, 205);
          break;

        case "has_packet":
          if (packetObj)   { k.destroy(packetObj);   packetObj   = null; }
          if (packetLabel) { k.destroy(packetLabel); packetLabel = null; }
          player.showBadge();
          dialog.show(
            `En-tete IP :  SRC=192.168.1.1  DST=192.168.1.2  TTL=${ttl}\n` +
            "Chemin Nord = 1 routeur  |  Chemin Sud = 2 routeurs\n" +
            "Avec TTL=2, un seul des deux chemins aboutit a bob.com !"
          );
          hudMission.text = "Choisis le bon chemin et livre le paquet";
          hudHint.text    = "ESPACE pour continuer";
          break;

        case "en_route":
          hudMission.text = "Livre le paquet a bob.com";
          hudHint.text    = "Nord : 1 routeur (TTL suffit)  |  Sud : 2 routeurs (TTL insuffisant !)";
          // Show arrows on both routes
          const clearNord = showPathArrows(k, 190, 800, 1, 205);
          const clearSud  = showPathArrows(k, 190, 800, 1, 350);
          clearArrows = () => { clearNord(); clearSud(); };
          break;

        case "ttl_zero":
          dialog.show(
            "PAQUET DETRUIT !  Le TTL a atteint 0.\n" +
            "Le Chemin Nord ne traverse qu'un seul routeur (1 saut) :\n" +
            "TTL  2 -> 1 -> livraison.  Prends le Chemin Nord !\n\n" +
            "ESPACE pour recommencer."
          );
          hudMission.text = "Paquet detruit - appuie sur ESPACE pour recommencer";
          hudHint.text    = "";
          break;

        case "at_bob":
          k.go("win4");
          break;
      }
    }

    // ── SPACE: continuer le dialogue ─────────────────
    k.onKeyPress("space", () => {
      if (!dialog.isOpen) return;
      dialog.hide();
      if      (state === "intro")      setState("go_alice");
      else if (state === "has_packet") setState("en_route");
      else if (state === "ttl_zero")   k.go("level4");
    });

    // ── Zone triggers ──────────────────────────
    k.onUpdate(() => {
      const { x: px, y: py } = player.pos;

      // Router zone checks (computed before blocker so edge-triggers stay accurate)
      const nowNord = state === "en_route" && px > R_NORD.wx  - 10 && px < R_NORD.wx  + 100 && py > R_NORD.wy  - 20 && py < R_NORD.wy  + 90;
      const nowSudA = state === "en_route" && px > R_SUD_A.wx - 10 && px < R_SUD_A.wx + 100 && py > R_SUD_A.wy - 20 && py < R_SUD_A.wy + 90;
      const nowSudB = state === "en_route" && px > R_SUD_B.wx - 10 && px < R_SUD_B.wx + 100 && py > R_SUD_B.wy - 20 && py < R_SUD_B.wy + 90;

      const justNord = nowNord && !inNord;
      const justSudA = nowSudA && !inSudA;
      const justSudB = nowSudB && !inSudB;

      inNord = nowNord;
      inSudA = nowSudA;
      inSudB = nowSudB;

      if (blocker.isBlocked) return;

      // Alice zone – handoff animation
      if ((state === "intro" || state === "go_alice") && px < 190 && py > 148) {
        if (packetObj)   { k.destroy(packetObj);   packetObj   = null; }
        if (packetLabel) { k.destroy(packetLabel); packetLabel = null; }
        state      = "animating";
        pickupAnim = true;
        aliceNPC.playHandoff(px + 14, py + 18, () => {
          pickupAnim = false;
          setState("has_packet");
        });
      }

      // Router hits – decrement TTL (one call per entry, non-blocking)
      if (justNord) decrementTTL(R_NORD);
      if (justSudA) decrementTTL(R_SUD_A);
      if (justSudB) decrementTTL(R_SUD_B);

      // Bob zone – delivery
      if (state === "en_route" && px > 790 && py > 148)
        setState("at_bob");
    });

    // ── Boot ──────────────────────────────────
    refreshHUD();
    updateTTLHUD();
    k.wait(0.3, () => setState("intro"));
  });
}
