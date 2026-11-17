// Chain combos. No imports here, so fighter.js can import it freely.
//
// HOW IT WORKS
//  1. When a move CONNECTS (hit, not blocked) you may cancel it straight into another move
//     (CHAIN below says which ones). Early presses are buffered for 10 frames, so mashing works.
//  2. Every cancel is added to the fighter's `chain`. If the end of the chain matches one of the
//     fighter's combos, the move you just cancelled into becomes the FINISHER: bonus damage,
//     knockback, launch, and the combo name pops up on screen.
//  3. Each move later in a chain does a little less damage (see Fighter.receive) so combos can't be infinite.
//
// Move keys: light/heavy = standing punch/kick, clight/cheavy = crouching (hold DOWN), special.
// Combo fields: seq (move keys, in order), dmg/kb (multipliers), launch (sets launch speed),
// hs (extra hitstun frames), final (no more cancelling out of it).

export const MAX_CHAIN = 6;

// Default "what can cancel into what" (every fighter). Fighters can override entries in `chain`.
export const CHAIN = {
  light:  ['light', 'clight', 'heavy', 'special'],
  clight: ['clight', 'light', 'cheavy', 'heavy'],
  heavy:  ['special'],
  cheavy: [], special: [], jlight: [], jheavy: [],
};

// Fighters are looked up by name: lowercase, letters only ("Sam Li" -> "samli").
// Add a new fighter by adding an entry here. Anyone not listed uses `default`.
export const COMBOS = {
  default: { combos: [
    { name: 'TRIPLE THREAT', seq: ['light', 'light', 'heavy'], dmg: 1.3, kb: 1.3 },
    { name: 'LOW BLOW', seq: ['clight', 'clight', 'heavy'], dmg: 1.4, launch: 5, final: true },
    { name: 'FULL COMBO', seq: ['light', 'heavy', 'special'], dmg: 1.5, final: true },
  ] },

  junior: { combos: [
    { name: 'JAB JAB KICK', seq: ['light', 'light', 'heavy'], dmg: 1.3, kb: 1.3 },
    { name: 'JUNIOR RUSH', seq: ['light', 'light', 'light', 'heavy'], dmg: 1.6, launch: 6, final: true },
    { name: 'BIG FINISH', seq: ['light', 'heavy', 'special'], dmg: 1.5, final: true },
  ] },

  marty: { combos: [
    { name: 'MARTY MASH', seq: ['light', 'light', 'heavy'], dmg: 1.2, kb: 1.5 },
    { name: 'LOW & SLOW', seq: ['clight', 'clight', 'heavy'], dmg: 1.4, launch: 5, final: true },
    { name: 'MARTY MAGIC', seq: ['light', 'heavy', 'special'], dmg: 1.6, final: true },
  ] },

  raphy: { combos: [
    { name: 'BELLY BUMP', seq: ['light', 'light', 'heavy'], dmg: 1.2, kb: 1.8 },
    { name: 'SUMO STORM', seq: ['light', 'light', 'light', 'heavy'], dmg: 1.5, launch: 6, final: true },
    { name: 'BELLY FLOP FINALE', seq: ['light', 'heavy', 'special'], dmg: 1.7, final: true },
  ] },

  esa: { combos: [
    { name: 'STINK BOMB', seq: ['light', 'light', 'special'], dmg: 1.5, final: true },
    { name: 'COUGH SYRUP', seq: ['clight', 'light', 'heavy'], dmg: 1.3, kb: 1.4 },
    { name: 'TOXIC TOUCH', seq: ['light', 'heavy', 'special'], dmg: 1.6, final: true },
  ] },

  sydney: { combos: [
    { name: 'BULLET TRAIN', seq: ['light', 'light', 'special'], dmg: 1.4, final: true },
    { name: 'FLARE KICK', seq: ['clight', 'light', 'heavy'], dmg: 1.4, launch: 5, final: true },
    { name: 'RAPID FINISH', seq: ['light', 'heavy', 'special'], dmg: 1.5, final: true },
  ] },

  // Sam Li can chain kicks into kicks (spinning kick strings).
  samli: { repeat: ['light', 'clight', 'heavy'], chain: { heavy: ['heavy', 'special'] }, combos: [
    { name: 'SPIN CYCLE', seq: ['light', 'heavy', 'heavy'], dmg: 1.3, kb: 1.3 },
    { name: 'TORNADO KICK', seq: ['light', 'heavy', 'heavy', 'heavy'], dmg: 1.7, launch: 6, final: true },
    { name: 'DRAGON SPIN', seq: ['light', 'heavy', 'special'], dmg: 1.5, final: true },
  ] },

  edson: { combos: [
    { name: 'WRESTLE MANIA', seq: ['light', 'light', 'heavy'], dmg: 1.3, kb: 1.4 },
    { name: 'TAKEDOWN', seq: ['clight', 'clight', 'heavy'], dmg: 1.3, launch: 4, final: true },
    { name: 'SUPLEX COMBO', seq: ['light', 'heavy', 'special'], dmg: 1.6, final: true },
  ] },

  mom: { combos: [
    { name: 'MOM KNOWS BEST', seq: ['light', 'light', 'special'], dmg: 1.5, final: true },
    { name: 'GROUNDED', seq: ['clight', 'light', 'heavy'], dmg: 1.4, launch: 5, final: true },
    { name: 'TIME OUT', seq: ['light', 'heavy', 'special'], dmg: 1.6, final: true },
  ] },
};

export const comboKey = def => String((def && def.name) || '').toLowerCase().replace(/[^a-z]/g, '');
export const comboSet = def => COMBOS[comboKey(def)] || COMBOS.default;
