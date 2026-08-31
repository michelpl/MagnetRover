import '@fontsource/oxanium/400.css';
import '@fontsource/oxanium/600.css';
import '@fontsource/oxanium/700.css';
import '@fontsource/oxanium/800.css';
import { createGame } from './game/Game';
import { applyImmersiveChrome } from './immersiveChrome';

document.addEventListener('DOMContentLoaded', () => {
  void applyImmersiveChrome();
  createGame();
});
