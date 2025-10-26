import { BaseCharacter } from "./BaseCharacter";

export function Steve(scene, options = {}) {
  return BaseCharacter(scene, {
    name: 'Steve',
    health: 20,
    speed: 15,
    attack: 5,
    spritesheetName: 'steve',
    x: options.x || 600,
    y: options.y || 370,
    flipRight: options.flipRight || false
  });
}