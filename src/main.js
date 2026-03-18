// ─────────────────────────────────────────────
//  PACK-IT  –  Entry point
// ─────────────────────────────────────────────
import kaplay from "kaplay";
import { GAME_WIDTH, GAME_HEIGHT } from "./data/constants.js";
import { registerTitleScene }  from "./scenes/title.js";
import { registerLevel1Scene } from "./scenes/level1.js";
import { registerWinScene }    from "./scenes/win.js";

const k = kaplay({
  width:      GAME_WIDTH,
  height:     GAME_HEIGHT,
  letterbox:  true,
  background: [20, 20, 40],
  font:       "monospace",
  global:     false,
});

registerTitleScene(k);
registerLevel1Scene(k);
registerWinScene(k);

k.go("title");
