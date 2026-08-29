import { GameObjects, Geom } from 'phaser';

/**
 * Enable input on a Container using a hit shape in local child space
 * (0,0 is the container transform point).
 *
 * Phaser Containers hardcode origin 0.5 and add `displayOrigin` (half of
 * `setSize`) during hit tests. This offsets the shape so it matches children.
 */
export function setContainerInteractive(
  container: GameObjects.Container,
  hitArea: Geom.Circle,
  contains: typeof Geom.Circle.Contains,
): void;
export function setContainerInteractive(
  container: GameObjects.Container,
  hitArea: Geom.Rectangle,
  contains: typeof Geom.Rectangle.Contains,
): void;
export function setContainerInteractive(
  container: GameObjects.Container,
  hitArea: Geom.Circle | Geom.Rectangle,
  contains: typeof Geom.Circle.Contains | typeof Geom.Rectangle.Contains,
): void {
  hitArea.x += container.width * 0.5;
  hitArea.y += container.height * 0.5;
  container.setInteractive(hitArea, contains);
}
