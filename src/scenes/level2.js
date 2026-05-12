// ─────────────────────────────────────────────
//  PACK-IT  –  Scene: Level 2
//
//  Flow:
//    intro → (Bob handoff anim) → open_letter
//    → fill_header → deliver → at_alice → win
//
//  Fix: envelope.open() is NEVER called from
//  inside a key-handler.  It is deferred by one
//  frame (k.wait(0, ...)) so the SPACE press that
//  dismisses the tutorial dialog is fully processed
//  before the envelope registers its own SPACE
//  handler.  The Bob-zone re-open is edge-triggered
//  (only on entry) to prevent an open/close loop.
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";
import { logbookGet, logbookAdd, logbookSummary } from "../data/logbook.js";
import { createDialog }          from "../ui/dialog.js";
import { createEnvelopeL2 }      from "../ui/envelopeL2.js";
import { drawLevel1Background, drawHouse, showPathArrows } from "../utils/world.js";
import { createPlayer }          from "../utils/player.js";
import { createNPC }             from "../utils/npc.js";

export function registerLevel2Scene(k) {
  k.scene("level2", () => {

    // Guarantee logbook has both addresses
    if (!logbookGet("bob.com"))   logbookAdd("bob.com",   "192.168.1.2");
    if (!logbookGet("alice.com")) logbookAdd("alice.com", "192.168.1.1");

    // ── State ─────────────────────────────────
    let state          = "intro";
    let clearArrows    = () => {};
    let pickupAnim     = false;
    let inBobZone      = false;   // edge-trigger: re-open envelope on entry only

    const blocker = {
      get isBlocked() { return dialog.isOpen || envelope.isOpen || pickupAnim; },
    };

    // ── World ─────────────────────────────────
    drawLevel1Background(k);
    drawHouse(k, 30,  "DNS / Post Office", C.post,  C.postRoof,           true);
    drawHouse(k, 120, "alice.com",         C.house, C.roof,               false);
    drawHouse(k, 810, "bob.com",           [160, 130, 90], [120, 70, 50], false);

    // ── NPC sprites ───────────────────────────
    const bobNPC   = createNPC(k, "bob",   850, 370, { facingLeft: true  });
    const aliceNPC = createNPC(k, "alice", 160, 370, { facingLeft: false });

    // ── Player spawns at Bob's house ──────────
    const player = createPlayer(k, 840, blocker);

    // ── HUD ───────────────────────────────────
    k.add([k.rect(960, 40), k.pos(0,0), k.color(15,15,35), k.fixed(), k.z(100)]);
    k.add([k.text("PACK-IT  -  Level 2", { size: 13 }), k.pos(12,12), k.color(...C.ui_border), k.fixed(), k.z(101)]);
    const hudMission = k.add([k.text("", { size: 11 }), k.pos(480,12),  k.anchor("top"),      k.color(...C.text),   k.fixed(), k.z(101)]);
    const hudLog     = k.add([k.text("", { size: 10 }), k.pos(950, 8),  k.anchor("topright"), k.color(180,200,255), k.fixed(), k.z(101)]);
    const hudHint    = k.add([k.text("", { size: 10 }), k.pos(480,528), k.anchor("center"),   k.color(160,180,240), k.fixed(), k.z(101)]);
    const refreshHUD = () => { hudLog.text = logbookSummary(); };

    // ── UI ────────────────────────────────────
    const dialog = createDialog(k);

    const envelope = createEnvelopeL2(k, {
      onValidated: () => {
        // Close envelope first, THEN transition — avoids any onClose dialog conflict.
        envelope.close();
        setState("deliver");
        k.wait(0.05, () => {
          dialog.show(
            "En-tete complet !\n" +
            "Suis les fleches et livre la lettre a alice.com !"
          );
        });
      },
      // onClose is a no-op: the delivery dialog is handled by onValidated above.
      onClose: () => {},
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
            "Cette lettre d'Alice m'a vraiment fait plaisir !\n" +
            "Je veux lui repondre. Tu peux m'aider a livrer ma lettre ?"
          );
          hudMission.text = "Approche Bob pour prendre la lettre";
          hudHint.text    = "";
          break;

        case "open_letter":
          dialog.show(
            "Au niveau 1 tu avais juste rempli l'adresse de destination.\n" +
            "Cette fois tu remplis l'en-tete IP complet :\n" +
            "l'adresse SOURCE et l'adresse DESTINATION.\n\n" +
            "Consulte ton logbook - tu as deja les deux adresses !"
          );
          hudMission.text = "Remplis l'en-tete IP";
          hudHint.text    = "ESPACE pour continuer";
          break;

        case "fill_header":
          // Do NOT call envelope.open() here — we are still inside the SPACE
          // key-handler that dismissed the dialog.  Deferring by one frame
          // prevents the envelope's own SPACE handler from firing on the same
          // key-press and immediately closing the envelope again.
          hudMission.text = "Remplis SRC et DST dans l'en-tete";
          hudHint.text    = "(E) Ouvrir/fermer  |  ENTREE valider";
          k.wait(0, () => { if (state === "fill_header") envelope.open(); });
          break;

        case "deliver":
          hudMission.text = "Livre la lettre a alice.com";
          hudHint.text    = "ESPACE pour continuer";
          clearArrows = showPathArrows(k, 800, 210, -1);
          break;

        case "at_alice":
          k.go("win2");
          break;
      }
    }

    // ── SPACE: dismiss dialog ─────────────────
    k.onKeyPress("space", () => {
      if (envelope.isOpen) return;
      if (!dialog.isOpen)  return;
      dialog.hide();
      if      (state === "intro")       setState("open_letter");
      else if (state === "open_letter") setState("fill_header");
      // "deliver": wait for zone trigger
    });

    // ── E: open/close envelope ────────────────
    k.onKeyPress("e", () => {
      if (state !== "fill_header" && state !== "deliver") return;
      if (dialog.isOpen) return;
      if (envelope.isOpen) envelope.close();
      else                 envelope.open();
    });

    // ── Zone triggers ─────────────────────────
    k.onUpdate(() => {
      const { x: px, y: py } = player.pos;

      // Bob zone edge-trigger (track before blocker check so inBobZone stays accurate)
      const nowInBob       = px > 800 && py > 270;
      const justEnteredBob = nowInBob && !inBobZone;
      inBobZone = nowInBob;

      if (blocker.isBlocked) return;

      // Bob zone → handoff animation then tutorial
      if (state === "intro" && justEnteredBob) {
        state      = "animating";
        pickupAnim = true;
        bobNPC.playHandoff(px + 14, py + 18, () => {
          pickupAnim = false;
          setState("open_letter");
        });
      }

      // Bob zone in fill_header → re-open envelope on entry (edge-triggered)
      if (state === "fill_header" && justEnteredBob && !envelope.isOpen)
        envelope.open();

      // Bob zone in deliver → remind player
      if (state === "deliver" && justEnteredBob)
        dialog.show("La lettre est prete ! Suis les fleches vers alice.com a gauche.");

      // Alice zone → deliver
      if (state === "deliver" && !dialog.isOpen && px < 240 && py > 270)
        setState("at_alice");
    });

    // ── Boot ──────────────────────────────────
    refreshHUD();
    k.wait(0.3, () => setState("intro"));
  });
}
