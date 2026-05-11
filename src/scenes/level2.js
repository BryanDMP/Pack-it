// ─────────────────────────────────────────────
//  PACK-IT  –  Scene: Level 2
//
//  Concept: IP Header (SRC + DST)
//  Bob replies to Alice. Player fills in the
//  source and destination IP fields manually,
//  then delivers the letter. Logbook already
//  has both addresses from Level 1 — no DNS needed.
//
//  Flow:
//    intro (Bob speech)
//    → open_letter (show envelope, explain IP header)
//    → fill_header (player fills SRC + DST)
//    → deliver (follow route to Alice)
//    → win
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";
import { logbookGet, logbookAdd, logbookSummary } from "../data/logbook.js";
import { createDialog }          from "../ui/dialog.js";
import { createEnvelopeL2 }      from "../ui/envelopeL2.js";
import { drawLevel1Background, drawHouse, showPathArrows } from "../utils/world.js";
import { createPlayer }          from "../utils/player.js";

export function registerLevel2Scene(k) {
  k.scene("level2", () => {

    // Guarantee logbook has both addresses (in case player skipped L1)
    if (!logbookGet("bob.com"))   logbookAdd("bob.com",   "192.168.1.2");
    if (!logbookGet("alice.com")) logbookAdd("alice.com", "192.168.1.1");

    // ── State ─────────────────────────────────
    let state       = "intro";
    let clearArrows = () => {};

    const blocker = {
      get isBlocked() { return dialog.isOpen || envelope.isOpen; },
    };

    // ── World (same street as L1) ─────────────
    drawLevel1Background(k);
    drawHouse(k, 30,  "DNS / Post Office", C.post,  C.postRoof,           true);
    drawHouse(k, 120, "alice.com",         C.house, C.roof,               false);
    drawHouse(k, 810, "bob.com",           [160, 130, 90], [120, 70, 50], false);

    // ── Player spawns at Bob's house ──────────
    const player = createPlayer(k, 840, blocker);

    // ── HUD ───────────────────────────────────
    k.add([k.rect(960, 40), k.pos(0,0), k.color(15,15,35), k.fixed(), k.z(100)]);
    k.add([k.text("PACK-IT  -  Level 2", { size: 13 }), k.pos(12,12), k.color(...C.ui_border), k.fixed(), k.z(101)]);
    const hudMission = k.add([k.text("", { size: 11 }), k.pos(480,12), k.anchor("top"),      k.color(...C.text),   k.fixed(), k.z(101)]);
    const hudLog     = k.add([k.text("", { size: 10 }), k.pos(950, 8), k.anchor("topright"), k.color(180,200,255), k.fixed(), k.z(101)]);
    const hudHint    = k.add([k.text("", { size: 10 }), k.pos(480,528), k.anchor("center"),  k.color(160,180,240), k.fixed(), k.z(101)]);
    const refreshHUD = () => { hudLog.text = logbookSummary(); };

    // ── UI ────────────────────────────────────
    const dialog   = createDialog(k);
    const envelope = createEnvelopeL2(k, {
      onValidated: () => setState("deliver"),
      onClose:     () => {
        if (state === "deliver") {
          dialog.show(
            "En-tete complet !\n" +
            "Suis les fleches et livre la lettre a alice.com !"
          );
        }
      },
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
          hudMission.text = "Remplis l'en-tete IP (E)";
          hudHint.text    = "(E) Ouvrir l'enveloppe";
          break;

        case "fill_header":
          envelope.open();
          hudMission.text = "Remplis SRC et DST dans l'en-tete";
          hudHint.text    = "(E) Ouvrir/fermer  |  ENTREE valider  |  ESPACE fermer";
          break;

        case "deliver":
          hudMission.text = "Livre la lettre a alice.com";
          hudHint.text    = "(E) Consulter l'enveloppe";
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
      else if (state === "deliver")     { /* wait for zone */ }
    });

    // ── E: open/close envelope ────────────────
    k.onKeyPress("e", () => {
      if (state !== "open_letter" && state !== "fill_header" && state !== "deliver") return;
      if (dialog.isOpen) return;
      if (envelope.isOpen) envelope.close();
      else                 envelope.open();
    });

    // ── Zone triggers ─────────────────────────
    k.onUpdate(() => {
      if (blocker.isBlocked) return;
      const { x: px, y: py } = player.pos;

      // Bob zone → open letter
      if (state === "intro" && px > 800 && py > 270)
        setState("open_letter");

      // Bob zone → open envelope if dismissed dialog
      if (state === "fill_header" && !envelope.isOpen && px > 800 && py > 270)
        envelope.open();

      // Bob zone in deliver state → remind player
      if (state === "deliver" && px > 800 && py > 270)
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