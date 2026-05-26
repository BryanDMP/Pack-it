// ─────────────────────────────────────────────
//  PACK-IT  –  Scene: Level 3
//
//  Concept: Routage inter-quartier
//  alice.com (192.168.1.x) veut joindre eve.com
//  (10.0.0.x). Le paquet doit transiter par le
//  routeur central. Le joueur consulte la table
//  de routage et choisit la bonne route.
//
//  Flow:
//    intro → go_alice → (handoff anim) → has_packet
//    → go_gateway → routing_table
//    → deliver → at_eve → win
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";
import { logbookGet, logbookAdd, logbookSummary } from "../data/logbook.js";
import { createDialog }              from "../ui/dialog.js";
import { createRoutingTableOverlay } from "../ui/routingTableOverlay.js";
import { drawLevel3Background, drawHouse, drawRouter, showPathArrows } from "../utils/world.js";
import { createPlayer }              from "../utils/player.js";
import { createNPC }                 from "../utils/npc.js";

const GW_X = 440; // router body left edge (visually centered at x=480)

export function registerLevel3Scene(k) {
  k.scene("level3", () => {

    // Seed logbook (in case player started directly at level 3)
    if (!logbookGet("alice.com")) logbookAdd("alice.com", "192.168.1.1");
    if (!logbookGet("eve.com"))   logbookAdd("eve.com",   "10.0.0.5");

    // ── State ─────────────────────────────────
    let state      = "intro";
    let clearArrows = () => {};
    let inGwZone   = false;
    let pickupAnim = false;

    let packetObj   = null;
    let packetLabel = null;

    const blocker = {
      get isBlocked() { return dialog.isOpen || routing.isOpen || pickupAnim; },
    };

    // ── World ─────────────────────────────────
    drawLevel3Background(k);
    drawHouse(k, 30,  "DNS / Post Office", C.post, C.postRoof, true);
    drawHouse(k, 120, "alice.com",         C.house, C.roof,    false);
    drawRouter(k, GW_X);
    drawHouse(k, 780, "eve.com",           [100, 130, 160], [60, 80, 120], false);

    // ── NPC sprites ───────────────────────────
    const aliceNPC = createNPC(k, "alice", 160, 370, { facingLeft: false });
    const eveNPC   = createNPC(k, "eve",   820, 370, { facingLeft: true  });

    // ── Packet on Alice's doorstep ─────────────
    packetObj = k.add([k.rect(22, 16), k.pos(172, 400), k.color(...C.packet), k.z(15)]);
    packetLabel = k.add([
      k.text("?", { size: 12 }), k.pos(0, 0), k.anchor("center"),
      k.color(255, 255, 255), k.z(16), k.follow(packetObj, k.vec2(11, 8)),
    ]);

    // ── Player (starts between alice and router) ──
    const player = createPlayer(k, 320, blocker);

    // ── HUD ───────────────────────────────────
    k.add([k.rect(960, 40), k.pos(0, 0), k.color(15, 15, 35), k.fixed(), k.z(100)]);
    k.add([k.text("PACK-IT  -  Level 3", { size: 13 }), k.pos(12, 12), k.color(...C.ui_border), k.fixed(), k.z(101)]);
    const hudMission = k.add([k.text("", { size: 11 }), k.pos(480, 12),  k.anchor("top"),      k.color(...C.text),     k.fixed(), k.z(101)]);
    const hudLog     = k.add([k.text("", { size: 10 }), k.pos(950,  8),  k.anchor("topright"), k.color(180, 200, 255), k.fixed(), k.z(101)]);
    const hudHint    = k.add([k.text("", { size: 10 }), k.pos(480, 528), k.anchor("center"),   k.color(160, 180, 240), k.fixed(), k.z(101)]);
    const refreshHUD = () => { hudLog.text = logbookSummary(); };

    // ── UI ────────────────────────────────────
    const dialog  = createDialog(k);
    const routing = createRoutingTableOverlay(k, {
      onValidated: () => setState("deliver"),
    });

    // ── State machine ─────────────────────────
    function setState(s) {
      state = s;
      dialog.hide();
      clearArrows();
      clearArrows = () => {};

      switch (s) {
        case "intro":
          dialog.show(
            "alice.com veut envoyer un message a eve.com !\n" +
            "eve.com est dans un autre quartier (sous-reseau 10.0.0.x).\n" +
            "Pour l'atteindre, le paquet devra passer par le routeur central."
          );
          hudMission.text = "Va chercher le paquet chez alice.com";
          hudHint.text    = "";
          clearArrows     = showPathArrows(k, 360, 140, -1);
          break;

        case "go_alice":
          hudMission.text = "Va chercher le paquet chez alice.com";
          hudHint.text    = "";
          clearArrows     = showPathArrows(k, 360, 140, -1);
          break;

        case "has_packet":
          if (packetObj)   { k.destroy(packetObj);   packetObj   = null; }
          if (packetLabel) { k.destroy(packetLabel); packetLabel = null; }
          player.showBadge();
          dialog.show(
            "Tu as le paquet !\n" +
            "En-tete IP :  SRC = 192.168.1.1 (alice.com)   DST = 10.0.0.5 (eve.com)\n" +
            "10.0.0.5 n'est pas dans ton sous-reseau (192.168.1.x). Porte-le au routeur !"
          );
          hudMission.text = "Apporte le paquet au routeur (centre)";
          hudHint.text    = "ESPACE pour continuer";
          clearArrows     = showPathArrows(k, 240, GW_X);
          break;

        case "go_gateway":
          hudMission.text = "Apporte le paquet au routeur (centre)";
          hudHint.text    = "";
          clearArrows     = showPathArrows(k, 240, GW_X);
          break;

        case "routing_table":
          routing.open();
          hudMission.text = "Consulte la table de routage";
          hudHint.text    = "(HAUT/BAS) Naviguer   (ENTREE) Confirmer";
          break;

        case "deliver":
          dialog.show(
            "Bonne route ! Le paquet est transmis via eth1 vers 10.0.0.254.\n" +
            "Suis les fleches et livre-le a eve.com !"
          );
          hudMission.text = "Livre le paquet a eve.com";
          hudHint.text    = "ESPACE pour continuer";
          clearArrows     = showPathArrows(k, GW_X + 80, 780);
          break;

        case "at_eve":
          k.go("win3");
          break;
      }
    }

    // ── SPACE: continuer le dialogue ─────────────────
    k.onKeyPress("space", () => {
      if (routing.isOpen) return;
      if (!dialog.isOpen) return;
      dialog.hide();
      if      (state === "intro")      setState("go_alice");
      else if (state === "has_packet") setState("go_gateway");
      // "deliver": wait for zone trigger
    });

    // ── Zone triggers ──────────────────────────
    k.onUpdate(() => {
      const { x: px, y: py } = player.pos;

      // Gateway edge-trigger (computed before blocker check)
      const nowInGw       = (state === "go_gateway") && px > GW_X - 80 && px < GW_X + 160 && py > 230;
      const justEnteredGw = nowInGw && !inGwZone;
      inGwZone = nowInGw;

      if (blocker.isBlocked) return;

      // Alice zone – pickup handoff animation
      if ((state === "intro" || state === "go_alice") && px > 115 && px < 255 && py > 270) {
        if (packetObj)   { k.destroy(packetObj);   packetObj   = null; }
        if (packetLabel) { k.destroy(packetLabel); packetLabel = null; }
        state      = "animating";
        pickupAnim = true;
        aliceNPC.playHandoff(px + 14, py + 18, () => {
          pickupAnim = false;
          setState("has_packet");
        });
      }

      // Gateway zone – open routing table
      if (justEnteredGw)
        setState("routing_table");

      // Eve zone – delivery
      if (state === "deliver" && !dialog.isOpen && px > 760 && py > 270)
        setState("at_eve");
    });

    // ── Boot ──────────────────────────────────
    refreshHUD();
    k.wait(0.3, () => setState("intro"));
  });
}
