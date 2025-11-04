import { BaseCharacter } from "./BaseCharacter";

export function Golem(scene, options = {}) {
  return BaseCharacter(scene, {
    name: 'Golem',
    health: 20,
    speed: 15,
    attack: 5,
    spritesheetName: 'golem',
    x: options.x || 600,
    y: options.y || 370,
    flipRight: options.flipRight || false
  });
}