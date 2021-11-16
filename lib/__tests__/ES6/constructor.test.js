// constructor.js

import FileLooper from '../../file-looper.js';
import { initLooper } from './functions/constructor.js';

export function testInstanceOf() {
  let pass, actual;
  pass = false;

  // Test Content Start
  const looper = initLooper();
  pass = looper instanceof FileLooper;
  actual = looper.constructor.name
  // Test Content End

  return {
    title: 'Testing if is instance of',
    expect: 'instanceof FileLooper',
    pass: pass,
    actual: `instanceof ${actual}`
  };;
}