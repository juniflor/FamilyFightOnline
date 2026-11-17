// Keyboard works for both players at all times; gamepads are added on top and auto-assigned to the first free player slot.
const KEYS = [
  { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', light: 'KeyF', heavy: 'KeyG', special: 'KeyR', block: 'ShiftLeft' },
  { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', light: 'Numpad1', heavy: 'Numpad2', special: 'Numpad3', block: 'Numpad0' }];
export const ACTIONS = ['left', 'right', 'up', 'down', 'light', 'heavy', 'special', 'block'];
const down = new Set(); let hits = new Set(), cur = [{}, {}], prev = [{}, {}];
addEventListener('keydown', e => { if (!e.repeat) hits.add(e.code); down.add(e.code);
  if (e.code.startsWith('Arrow') || e.code === 'Space' || e.code.startsWith('Numpad')) e.preventDefault(); });
addEventListener('keyup', e => down.delete(e.code));
addEventListener('blur', () => down.clear());
export const hit = c => hits.has(c);          // key pressed this frame (menus)

// ---- gamepad slot management ----
const slots = [null, null], names = ['', ''], mem = {}, events = [], swapPrev = {};
const ev = (type, text) => events.push({ type, text });
const kind = id => /xbox|045e/i.test(id) ? 'Xbox' : /054c|playstation|dualshock|dualsense/i.test(id) ? 'PlayStation' : 'Gamepad';
function manage(list) {
  for (let s = 0; s < 2; s++) if (slots[s] !== null) { const g = list[slots[s]];
    if (!g || !g.connected) { ev('off', `P${s + 1} controller disconnected - keyboard still works`); slots[s] = null; names[s] = ''; } }
  for (const g of list) { if (!g || !g.connected || slots.includes(g.index)) continue;
    const key = g.index + g.id, m = mem[key]; const s = m !== undefined && slots[m] === null ? m : slots.indexOf(null); if (s < 0) continue;
    slots[s] = g.index; names[s] = kind(g.id); mem[key] = s; ev('on', `P${s + 1}: ${names[s]} controller connected`); }
}
function readPad(g, s) {
  const b = i => !!g.buttons[i]?.pressed, x = g.axes[0] || 0, y = g.axes[1] || 0;
  let L = b(14), R = b(15), U = b(12), D = b(13);
  if (g.mapping !== 'standard' && g.axes.length > 9 && Math.abs(g.axes[9]) <= 1.01) { // generic pads: d-pad as a hat axis
    const i = Math.round((g.axes[9] + 1) * 3.5); U ||= [7, 0, 1].includes(i); R ||= [1, 2, 3].includes(i); D ||= [3, 4, 5].includes(i); L ||= [5, 6, 7].includes(i); }
  s.left ||= x < -.5 || L; s.right ||= x > .5 || R; s.up ||= y < -.6 || U || b(1); s.down ||= y > .6 || D;   // B/Circle also jumps
  s.light ||= b(0); s.heavy ||= b(2); s.special ||= b(3); s.block ||= b(4) || b(5) || b(6) || b(7);       // A/X/Y (Cross/Square/Triangle); bumpers+triggers block
}
export function poll() {
  const list = [...(navigator.getGamepads?.() || [])]; manage(list);
  for (const g of list) { if (!g) continue; const b8 = !!g.buttons[8]?.pressed;   // Back/Select/Share swaps player slots
    if (b8 && !swapPrev[g.index] && slots.includes(g.index)) { [slots[0], slots[1]] = [slots[1], slots[0]]; [names[0], names[1]] = [names[1], names[0]]; ev('on', 'Controller slots swapped'); }
    swapPrev[g.index] = b8; }
  for (let p = 0; p < 2; p++) { prev[p] = cur[p]; const s = {}; for (const a of ACTIONS) s[a] = down.has(KEYS[p][a]);
    const g = slots[p] !== null ? list[slots[p]] : null; if (g) readPad(g, s); cur[p] = s; }
}
export const padCount = () => slots.filter(s => s !== null).length;
export const padStatus = () => `P1: ${names[0] ? names[0].toUpperCase() + ' + KEYS' : 'KEYBOARD'}   P2: ${names[1] ? names[1].toUpperCase() + ' + KEYS' : 'KEYBOARD'}`;
export const takeEvents = () => events.splice(0);
export const held = (p, a) => !!cur[p][a];
export const pressed = (p, a) => !!cur[p][a] && !prev[p][a];
export const endFrame = () => hits.clear();
