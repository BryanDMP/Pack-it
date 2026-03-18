// ─────────────────────────────────────────────
//  PACK-IT  –  Scene: Level 1
//
//  Flow:
//    intro → go_postoffice → at_postoffice (DNS overlay)
//    → go_alice → pick_packet (envelope overlay)
//    → deliver → at_bob → win
// ─────────────────────────────────────────────
import { C } from "../data/constants.js";
import { logbookGet, logbookSummary } from "../data/logbook.js";
import { createDialog }          from "../ui/dialog.js";
import { createDNSOverlay }      from "../ui/dnsOverlay.js";
import { createEnvelopeOverlay } from "../ui/envelopeOverlay.js";
import { drawLevel1Background, drawHouse, showPathArrows } from "../utils/world.js";
import { createPlayer }          from "../utils/player.js";

export function registerLevel1Scene(k) {
  k.scene("level1", () => {

    // ── State ─────────────────────────────────
    let state       = "intro";
    let clearArrows = () => {};

    // blocker: freezes player movement while any UI is open
    const blocker = {
      get isBlocked() {
        return dialog.isOpen || dns.isOpen || envelope.isOpen || state === "win";
      },
    };

    // ── World ─────────────────────────────────
    drawLevel1Background(k);
    drawHouse(k, 30,  "DNS / Post Office", C.post,  C.postRoof,      true);
    drawHouse(k, 120, "alice.com",         C.house, C.roof,          false);
    drawHouse(k, 810, "bob.com",           [160, 130, 90], [120, 70, 50], false);

    // ── Packet sitting on Alice's doorstep ────
    const packetObj = k.add([
      k.rect(22, 16),
      k.pos(172, 400),
      k.color(...C.packet),
      k.z(15),
      "packetObj",
    ]);
    k.add([
      k.text("?", { size: 12 }),
      k.pos(0, 0),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.z(16),
      k.follow(packetObj, k.vec2(11, 8)),
    ]);

    // ── Player ────────────────────────────────
    const player = createPlayer(k, 200, blocker);

    // ── HUD ───────────────────────────────────
    k.add([k.rect(960, 40), k.pos(0, 0), k.color(15, 15, 35), k.fixed(), k.z(100)]);
    k.add([k.text("PACK-IT  –  Level 1", { size: 13 }), k.pos(12, 12), k.color(...C.ui_border), k.fixed(), k.z(101)]);
    const hudMission = k.add([k.text("", { size: 11 }), k.pos(480, 12), k.anchor("top"),     k.color(...C.text),       k.fixed(), k.z(101)]);
    const hudLog     = k.add([k.text("", { size: 10 }), k.pos(950, 8), k.anchor("topright"), k.color(180, 200, 255), k.fixed(), k.z(101)]);
    const refreshHUD = () => { hudLog.text = logbookSummary(); };

    // ── UI controllers ────────────────────────
    const dialog = createDialog(k);

    const dns = createDNSOverlay(
      k,
      () => {          // onResolved: DNS lookup done, player confirmed
        refreshHUD();
        setState("go_alice");
      },
      () => setState("go_postoffice"),   // onClose via Escape
      "bob.com"                          // requiredDomain: seul bob.com est accepté
    );

    const envelope = createEnvelopeOverlay(
      k,
      { srcDomain: "alice.com", dstDomain: "bob.com", message: "Bonjour Bob !" },
      () => {          // onClose: player sealed the envelope
        k.destroy(packetObj);
        player.showBadge();
        setState("deliver");
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
            "Bienvenue, facteur ! 📬\n" +
            "Alice veut envoyer un message à bob.com.\n" +
            "Elle ne connaît pas son adresse IP.\n" +
            "Va au Bureau de Poste (DNS) pour la chercher !"
          );
          hudMission.text = "Mission : consulter le DNS";
          clearArrows = showPathArrows(k, 220, 800);
          break;

        case "go_postoffice":
          dialog.show("Direction le Bureau de Poste à gauche !");
          hudMission.text = "Aller au Bureau de Poste (DNS)";
          break;

        case "at_postoffice":
          dns.open();
          hudMission.text = "Bureau de Poste — cherche « bob.com »";
          break;

        case "go_alice": {
          const ip = logbookGet("bob.com") ?? "???";
          dialog.show(
            `bob.com = ${ip} est dans ton logbook !\n` +
            "Retourne voir Alice pour prendre son paquet."
          );
          hudMission.text = "Aller chercher le paquet chez alice.com";
          break;
        }

        case "pick_packet":
          envelope.open();
          hudMission.text = "Lis l'en-tête IP, puis ESPACE";
          break;

        case "deliver":
          dialog.show(
            "Super ! L'en-tête est rempli. 📬\n" +
            "Suis la route et livre le paquet à bob.com !"
          );
          hudMission.text = "Livrer à bob.com  (192.168.1.2)";
          clearArrows = showPathArrows(k, 220, 800);
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
      if (state === "intro") setState("go_postoffice");
    });

    // ── Zone triggers (proximity) ─────────────
    k.onUpdate(() => {
      if (blocker.isBlocked) return;
      const { x: px, y: py } = player.pos;

      // Post office zone (left side)
      if ((state === "intro" || state === "go_postoffice") && px < 130 && py > 270) {
        setState("at_postoffice");
      }
      // Alice zone (pick up packet)
      if (state === "go_alice" && px > 115 && px < 255 && py > 270) {
        setState("pick_packet");
      }
      // Bob zone (deliver)
      if (state === "deliver" && px > 800 && py > 270) {
        setState("at_bob");
      }
    });

    // ── Boot ──────────────────────────────────
    refreshHUD();
    k.wait(0.3, () => setState("intro"));
  });
}
