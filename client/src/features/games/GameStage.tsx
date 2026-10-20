import { createElement } from 'react';
import type { GameComponentProps } from './types';
import { gameComponentFor } from './gameRegistry';

/**
 * Renders the component matching a game mechanic. Kept as a module-scope
 * component so the selected component is resolved inside a stable component
 * rather than being created during the page's render.
 */
export function GameStage(props: GameComponentProps): React.JSX.Element {
  const Component = gameComponentFor(props.game.mechanic);
  return createElement(Component, props);
}
