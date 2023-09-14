import 'normalize.css';
import './style.scss';
import Game from './modules/Game';
import UI from './modules/UI';

UI.initialise(new Game());
