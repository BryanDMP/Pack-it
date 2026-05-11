import kaplay from "kaplay";
import { GAME_WIDTH, GAME_HEIGHT } from "./data/constants.js";
import { registerTitleScene }  from "./scenes/title.js";
import { registerLevel1Scene } from "./scenes/level1.js";
import { registerLevel2Scene } from "./scenes/level2.js";
import { registerWinScene }    from "./scenes/win.js";
import { registerWin2Scene }   from "./scenes/win2.js";

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
registerLevel2Scene(k);
registerWinScene(k);
registerWin2Scene(k);

k.go("title");