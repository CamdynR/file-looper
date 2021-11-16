// constructor.js

import FileLooper from '../../../file-looper.js';

export function initLooper(src, dist) {
  return new FileLooper(src, dist);
}