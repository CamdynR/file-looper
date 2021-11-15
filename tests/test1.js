// test1.js

import FileLoop from '../lib/file-loop.js';

const fl = new FileLoop('src', 'dist');

fl.addPlugin(file => {
  if (file.extension == 'html') {
    file.document.querySelector('body').innerHTML += '<!-- Test -->';
    file.useDoc = true;
  }
});

fl.run();