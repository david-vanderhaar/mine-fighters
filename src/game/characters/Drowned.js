import { BaseCharacter } from "./BaseCharacter";

export function Drowned(scene, options = {}) {
  return BaseCharacter(scene, {
    name: 'Drowned',
    health: 20,
    speed: 15,
    attack: 5,
    spritesheetName: 'drowned',
    x: options.x || 600,
    y: options.y || 370,
    flipRight: options.flipRight || false
  });
}