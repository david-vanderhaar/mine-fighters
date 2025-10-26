import { BaseCharacter } from "./BaseCharacter";

export function Zombie(scene, options = {}) {
  return BaseCharacter(scene, {
    name: 'Zombie',
    health: 20,
    speed: 15,
    attack: 5,
    spritesheetName: 'zombie',
    x: 600,
    y: 370,
    flipRight: false,
    ...options
  });
}