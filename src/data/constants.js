// ─────────────────────────────────────────────
//  PACK-IT  –  Constants
// ─────────────────────────────────────────────

export const GAME_WIDTH  = 960;
export const GAME_HEIGHT = 540;
export const PLAYER_SPEED = 160;

// Colour palette (RGB arrays for kaplay color())
export const C = {
  road:      [60,  55,  80],
  sidewalk:  [90,  85, 110],
  grass:     [60, 100,  60],
  house:     [180,140, 100],
  roof:      [140,  80,  60],
  post:      [80,  160, 220],
  postRoof:  [40,  100, 180],
  player:    [255, 200,  80],
  packet:    [255, 120,  60],
  highlight: [255, 220,  60],
  ui_bg:     [20,   20,  40],
  ui_border: [100, 180, 255],
  green:     [80,  220, 120],
  red:       [220,  80,  80],
  text:      [230, 230, 255],
  shadow:    [0,    0,   0],
};

// DNS table (used across levels)
export const DNS_TABLE = {
  "bob.com":   "192.168.1.2",
  "alice.com": "192.168.1.1",
  "eve.com":   "192.168.1.3",  // Level 4
};
