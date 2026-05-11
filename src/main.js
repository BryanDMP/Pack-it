import kaplay from "kaplay";
import { GAME_WIDTH, GAME_HEIGHT } from "./data/constants.js";
import { registerTitleScene }  from "./scenes/title.js";
import { registerLevel1Scene } from "./scenes/level1.js";
import { registerLevel2Scene } from "./scenes/level2.js";
import { registerLevel3Scene } from "./scenes/level3.js";
import { registerWinScene }    from "./scenes/win.js";
import { registerWin2Scene }   from "./scenes/win2.js";
import { registerWin3Scene }   from "./scenes/win3.js";

const k = kaplay({
  width:      GAME_WIDTH,
  height:     GAME_HEIGHT,
  letterbox:  true,
  background: [20, 20, 40],
  font:       "monospace",
  global:     false,
});

// ── Sprites ───────────────────────────────────
k.loadSprite("player-standing", "/sprites/standing.png");
k.loadSprite("player-run1",     "/sprites/running-1.png");
k.loadSprite("player-run2",     "/sprites/running-2.png");
k.loadSprite("alice",           "/sprites/alice.png");
k.loadSprite("bob",             "/sprites/bob.png");
k.loadSprite("eve",             "/sprites/eve.png");

registerTitleScene(k);
registerLevel1Scene(k);
registerLevel2Scene(k);
registerLevel3Scene(k);
registerWinScene(k);
registerWin2Scene(k);
registerWin3Scene(k);

k.go("title");