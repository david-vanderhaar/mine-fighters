import { BaseCharacter } from "./BaseCharacter";

export function Piglin(scene, options = {}) {
  return BaseCharacter(scene, {
    name: 'Piglin',
    health: 20,
    speed: 15,
    attack: 5,
    spritesheetName: 'piglin',
    x: options.x || 600,
    y: options.y || 370,
    flipRight: options.flipRight || false
  });
}