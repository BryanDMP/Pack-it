// ─────────────────────────────────────────────
//  PACK-IT  –  Scene: Level 1
//
//  Flow:
//    intro → go_alice → has_packet
//    → (fill Bob's IP in envelope) → packet_valid
//    → deliver to bob.com → win
//
//  The DNS / Post Office is optional: visiting it
//  adds bob.com → 192.168.1.2 to the logbook and
//  auto-fills the IP field in the envelope.
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";
import { logbookSummary } from "../data/logbook.js";
import { createDialog }          from "../ui/dialog.js";
import { createDNSOverlay }      from "../ui/dnsOverlay.js";
import { createEnvelopeOverlay } from "../ui/envelopeOverlay.js";
import { drawLevel1Background, drawHouse, showPathArrows } from "../utils/world.js";
import { createPlayer }          from "../utils/player.js";

export function registerLevel1Scene(k) {
  k.scene("level1", () => {

    // ── State ─────────────────────────────────
    let state         = "intro";
    let clearArrows   = () => {};
    let justValidated = false;   // true between onValidated and first close

    // Freezes player movement while any UI is open
    const blocker = {
      get isBlocked() {
        return dialog.isOpen || dns.isOpen || envelope.isOpen;
      },
    };

    // ── World ─────────────────────────────────
    drawLevel1Background(k);
    drawHouse(k, 30,  "DNS / Post Office", C.post,  C.postRoof,            true);
    drawHouse(k, 120, "alice.com",         C.house, C.roof,                false);
    drawHouse(k, 810, "bob.com",           [160, 130, 90], [120, 70, 50],  false);

    // ── Packet sitting on Alice's doorstep ────
    const packetObj   = k.add([
      k.rect(22, 16),
      k.pos(172, 400),
      k.color(...C.packet),
      k.z(15),
    ]);
    const packetLabel = k.add([
      k.text("?", { size: 12 }),
      k.pos(0, 0),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.z(16),
      k.follow(packetObj, k.vec2(11, 8)),
    ]);

    // ── Player (starts to the right of Alice) ─
    const player = createPlayer(k, 400, blocker);

    // ── HUD ───────────────────────────────────
    k.add([k.rect(960, 40), k.pos(0, 0), k.color(15, 15, 35), k.fixed(), k.z(100)]);
    k.add([k.text("PACK-IT  –  Level 1", { size: 13 }), k.pos(12, 12), k.color(...C.ui_border), k.fixed(), k.z(101)]);
    const hudMission = k.add([k.text("", { size: 11 }), k.pos(480, 12),  k.anchor("top"),      k.color(...C.text),       k.fixed(), k.z(101)]);
    const hudLog     = k.add([k.text("", { size: 10 }), k.pos(950,  8),  k.anchor("topright"), k.color(180, 200, 255),   k.fixed(), k.z(101)]);
    const hudHint    = k.add([k.text("", { size: 10 }), k.pos(480, 528), k.anchor("center"),   k.color(160, 180, 240),   k.fixed(), k.z(101)]);
    const refreshHUD = () => { hudLog.text = logbookSummary(); };

    // ── UI controllers ────────────────────────
    const dialog = createDialog(k);

    // Post Office DNS — optional, gives the IP as a hint
    const dns = createDNSOverlay(
      k,
      () => { refreshHUD(); },   // onResolved: logbook updated, refresh display
      () => {},                   // onClose via TAB
      "bob.com"
    );

    // Envelope — interactive, all pre-filled except Bob's IP
    const envelope = createEnvelopeOverlay(
      k,
      {
        srcDomain:    "alice.com",
        srcIP:        "192.168.1.1",
        dstDomain:    "bob.com",
        dstIPCorrect: "192.168.1.2",
        message:      "Bonjour Bob !",
      },
      {
        onValidated: () => {
          justValidated = true;
          setState("packet_valid");
        },
        onClose: () => {
          if (justValidated) {
            justValidated = false;
            dialog.show(
              "✓ Paquet validé !\n" +
              "Suis les flèches et livre-le à bob.com !"
            );
          }
        },
      }
    );

    // ── State machine ─────────────────────────
    function setState(s) {
      state = s;
      dialog.hide();
      clearArrows();
      clearArrows = () => {};

      switch (s) {
        case "intro":
          dialog.show(
            "Alice a un colis pour Bob !\n" +
            "Va la voir chez alice.com (à gauche)."
          );
          hudMission.text = "Aller chez alice.com";
          hudHint.text    = "";
          clearArrows = showPathArrows(k, 380, 140, -1);
          break;

        case "go_alice":
          hudMission.text = "Aller chercher le colis chez alice.com";
          hudHint.text    = "";
          clearArrows = showPathArrows(k, 380, 140, -1);
          break;

        case "has_packet":
          k.destroy(packetLabel);
          k.destroy(packetObj);
          player.showBadge();
          hudMission.text = "Compléter le paquet  (E)";
          hudHint.text    = "(E) Ouvrir/fermer le paquet  |  DNS (Post Office) a gauche pour l'IP  (ESPACE pour fermer le DNS)";
          envelope.open();
          break;

        case "packet_valid":
          hudMission.text = "Livrer à bob.com  →";
          hudHint.text    = "(E) Consulter le paquet";
          clearArrows = showPathArrows(k, 210, 800);
          break;

        case "at_bob":
          k.go("win1");
          break;
      }
    }

    // ── SPACE: dismiss dialogs ────────────────
    k.onKeyPress("space", () => {
      if (dns.isOpen || envelope.isOpen) return;
      if (!dialog.isOpen) return;
      dialog.hide();
      if (state === "intro") setState("go_alice");
      // Nudge player away from Bob's zone if the "not ready" dialog was showing
      if (state === "has_packet" && player.pos.x > 800) {
        player.obj.pos.x = 780;
      }
    });

    // ── E: open / close envelope ──────────────
    k.onKeyPress("e", () => {
      if (state !== "has_packet" && state !== "packet_valid") return;
      if (dns.isOpen || dialog.isOpen) return;
      if (envelope.isOpen) envelope.close();
      else                 envelope.open();
    });

    // ── Zone triggers (proximity) ─────────────
    let inPostOfficeZone = false;  // edge-trigger: ouvre le DNS seulement à l'entrée

    k.onUpdate(() => {
      const { x: px, y: py } = player.pos;

      // Post Office: calculer l'entrée dans la zone avant le blocker check
      // (pour que inPostOfficeZone reste à jour même quand le DNS est ouvert)
      const nowInPO = (state === "has_packet" || state === "packet_valid") && px < 130 && py > 270;
      const justEnteredPO = nowInPO && !inPostOfficeZone;
      inPostOfficeZone = nowInPO;

      if (blocker.isBlocked) return;

      // Alice zone — pick up the packet
      if ((state === "intro" || state === "go_alice") && px > 115 && px < 255 && py > 270) {
        setState("has_packet");
      }

      // Post Office — ouvre le DNS seulement à l'entrée dans la zone
      if (justEnteredPO) dns.open();

      // Bob zone — packet not yet valid
      if (state === "has_packet" && px > 800 && py > 270) {
        dialog.show("Le paquet n'est pas complet !\nRemplis l'adresse IP de Bob. (E)");
      }

      // Bob zone — deliver!
      if (state === "packet_valid" && px > 800 && py > 270) {
        setState("at_bob");
      }
    });

    // ── Boot ──────────────────────────────────
    refreshHUD();
    k.wait(0.3, () => setState("intro"));
  });
}
