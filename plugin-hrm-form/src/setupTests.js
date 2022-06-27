import { configure } from 'enzyme/build';
import Adapter from 'enzyme-adapter-react-16/build';

require('babel-polyfill');

configure({
  adapter: new Adapter(),
});

// Workaround for jsdom not supporting media elements: https://github.com/jsdom/jsdom/issues/2155
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => undefined;
