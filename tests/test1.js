// test1.js

import FileLooper from '../lib/file-looper.js';

const fl = new FileLooper('src', 'dist');

fl.addPlugin(file => {
  console.log(file.runNumber);
  file.renameFile = {
    fileName: file.fileName,
    extension: `min.${file.extension}`
  }
}, {
  id: 'demoPlugin',
  categories: ['demo', 'plugin'],
  onlyDo: {
    extensions: ['html']
  }
});

fl.run({
  onlyDo: {
    categories: ['demo']
  }
});